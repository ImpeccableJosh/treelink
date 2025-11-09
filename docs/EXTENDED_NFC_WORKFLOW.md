# Extended NFC Auto-Apply & Organization Dashboard — Design + Implementation Plan

This document describes how to extend the Linktree-style digital card system so that:

1. Scanning a card with an organization-provided NFC reader can automatically create an informal application (a lightweight "I'm interested" record) on behalf of the scanned user, targeted to the org account that owns the reader.
2. The user then receives an email to complete the application (select role, add details). The org has a dashboard to view analytics and the list of informal applications per recruitment cycle or application type.

This covers data model changes, API contracts, security, server-side endpoints, sequence flows, and a recommended implementation plan.

---

## High-level flow (fast overview)
1. Org sets up an NFC reader device in their dashboard and ties it to their `organization_id`.
2. A physical NFC card contains a `card_uuid` (or short token) that maps to a `users` profile in our DB.
3. A reader scans the card, reads the `card_uuid`, and sends a POST to our server endpoint `/api/nfc/scan` including `card_uuid` and `reader_id`.
4. The server validates the `reader_id` (it must belong to an active org and present a device credential or signed request). The server then creates an `informal_applications` record linking the `user_id` and the `organization_id` (and optionally an `application_type`), with status `awaiting_user_confirmation`.
5. The server sends the user an email with a secure per-application link that the user can open to complete the application (choose role, answer questions). The link contains an application-specific token.
6. When the user opens the link, they can authenticate (OTP / continue with existing account). After authentication they can fill in the remaining details; the user's input updates the `informal_applications` record and sets status to `completed`.
7. The org dashboard shows: aggregated analytics, list of applications, ability to filter by cycle/type/status, and export CSV.

---

## Data model additions (Postgres)

```sql
-- organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  created_at timestamptz default now()
);

-- reader devices (org-owned hardware)
create table public.reader_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text,
  secret text, -- device secret (store encrypted or use signatures)
  created_at timestamptz default now()
);

-- application types (optional, e.g. "mentorship", "internship", "job-interest")
create table public.application_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text,
  title text,
  questions jsonb default '[]', -- array of question definitions
  created_at timestamptz default now()
);

-- informal_applications created by scans
create table public.informal_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  card_uuid uuid, -- convenience reference
  organization_id uuid references public.organizations(id),
  reader_device_id uuid references public.reader_devices(id),
  application_type_id uuid references public.application_types(id),
  status text default 'pending', -- pending, awaiting_user, completed, closed
  public_token text, -- token emailed to user to finish
  payload jsonb default '{}' , -- user-provided answers when completed
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- analytics events (optional, alternate approach uses logs)
create table public.analytics_events (
  id serial primary key,
  organization_id uuid,
  user_id uuid,
  event_type text,
  meta jsonb,
  created_at timestamptz default now()
);
```

Notes:
- `reader_devices.secret` can be a token the device uses when calling the API, or you can require signed requests (HMAC) for more security.
- `public_token` is a one-time token used to identify the specific informal_application in the user's email link.

---

## API endpoints (suggested)

### 1) POST /api/nfc/scan
- Purpose: called by a trusted reader device when it scans a card
- Auth: device-level credential (Authorization header `Bearer device-secret`) or HMAC-signed payload
- Body: { card_uuid: string, reader_id: uuid, timestamp?: iso }
- Server behavior:
  - Lookup `reader_id` and validate secret.
  - Lookup `users` by `card_uuid`. If user not found, return 404.
  - Create `informal_applications` row with status `awaiting_user_confirmation` and a `public_token` (short secure random token).
  - Create an analytics_event for the org.
  - Send user email with a link to `/apply/complete?token=<public_token>`.
- Response: 201 with the created informal_application id (only for internal logs; do not return PII to device)

### 2) GET /apply/complete?token=...
- Purpose: web page user opens from email, shows pre-filled context (org, date, role choices).
- Server: loads informal_application by `public_token`. Renders a client-side page with a controlled form.

### 3) POST /api/applications/:id/complete
- Purpose: user submits answers to questions and completes their application
- Auth: session or email OTP flow; ensure `auth_user_id` or the token maps to the same user
- Body: { payload: { answers.. }, role_choice, contact_phone }
- Server behavior: validate, update `informal_applications.payload`, set `status = 'completed'`, notify org (webhook/email), record analytics_event

### 4) GET /org/:org_id/applications
- Purpose: org dashboard backend: list applications and statuses
- Auth: org user session
- Query params: status, type, date range
- Response: paginated list of informal_applications and small user profile snapshot

### 5) GET /org/:org_id/analytics
- Purpose: return aggregated metrics: scans by day, completions, open vs closed
- Implementation: either aggregate postgresql queries or use pre-computed materialized views/events table

---

## Email flow & templates
- Email sent to user after scan:
  - Subject: "Someone at <Org> scanned your card — confirm your interest"
  - Body: short friendly message, link to `/apply/complete?token=<public_token>`
  - The link includes the token and optionally the card_uuid for convenience
- Security: token expiration (e.g., 7 days) and single-use tokens recommended

---

## Security & RLS
- Readers are hardware devices; they must authenticate using a device secret. Store `reader_devices.secret` securely in the database and rotate secrets periodically.
- For server-to-server (reader -> server) calls, require a short HMAC signature or Bearer token to reduce accidental abuse.
- Supabase/PostgREST/Postgres RLS rules:
  - For `informal_applications`, allow trustworthy writes only via backend service key or via a stored procedure that validates the reader.
  - Org dashboard endpoints should require JWTs that represent users with appropriate org roles.

## Implementation notes (server-side pseudocode)

Example Express/Node handler for /api/nfc/scan (or Next.js route handler):

```ts
// pseudo-code for Next.js route handler
import { NextRequest, NextResponse } from 'next/server'
import { serverSupabase } from '@/lib/supabase' // server client

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { card_uuid, reader_id } = body

  // validate device
  const device = await db.query('select * from reader_devices where id=$1', [reader_id])
  if (!device) return NextResponse.json({ error: 'unknown device' }, { status: 403 })
  // validate secret from Authorization header or HMAC

  const user = await db.query('select * from users where card_uuid = $1', [card_uuid])
  if (!user) return NextResponse.json({ error: 'card not found' }, { status: 404 })

  const publicToken = randomToken(28)
  const app = await db.query(`insert into informal_applications (user_id, card_uuid, organization_id, reader_device_id, public_token, status) values ($1,$2,$3,$4,$5,'awaiting_user_confirmation') returning *`, [user.id, card_uuid, device.organization_id, device.id, publicToken])

  // send email to user with link
  await sendEmail(user.contact_email /*or found by joining user->emails*/, `Finish your interest application`, `Click here: ${APP_URL}/apply/complete?token=${publicToken}`)

  return NextResponse.json({ ok:true })
}
```

Notes:
- This route must be protected: only allow device requests that include either a valid device secret header or an HMAC signature.
- The device secret should be never embedded in client-side code. For client devices, use ephemeral provisioning to rotate.

## Org Dashboard & analytics
- Back-end queries for dashboards:
  - Simple metrics: `select count(*) from informal_applications where organization_id = ? and created_at between ? and ?`
  - Funnel: scans -> emails sent -> completed. Use `analytics_events` to record each event for time-series charts.
- UX features for orgs:
  - Table of applications with quick filters and search (by card_uuid, name, email)
  - Per-application detail modal with the profile snapshot and answers
  - CSV export
  - Toggle active/inactive reader devices
  - Ability to add `application_types` (campaigns) and attach devices to a campaign so scans are categorized automatically

## Edge cases & hardening
- Duplicate scans: reader should be allowed to scan the same card multiple times, but the server can dedupe by creating a new application only if a previous `informal_application` for that `(user, organization, application_type)` isn’t still `awaiting_user_confirmation`.
- Lost email or not opting in: if the user never completes the application, org can view incomplete items.
- User privacy: include a privacy notice and allow users to opt-out of automatic emails / opt-in.
- GDPR/CCPA: store only necessary data and delete old informal_applications per retention policy.

## Analytics scaling
- If you expect many scans, record only minimal event data to an `analytics_events` table and then aggregate in materialized views.
- For near-real-time dashboards, consider a cron job that refreshes materialized view every minute or use an analytics pipeline (Kafka, clickhouse) if needed.

## Example SQL snippets (helpful)

Create an application and expire tokens after 7 days (simple cleanup job):

```sql
update informal_applications set status='expired' where status='awaiting_user_confirmation' and created_at < now() - interval '7 days';
```

Aggregate scans-by-day:

```sql
select date_trunc('day', created_at) as day, count(*)
from informal_applications
where organization_id = '<org-id>'
group by 1 order by 1 desc;
```

## Developer checklist to implement
- [ ] Create `reader_devices`, `informal_applications`, and `application_types` migration
- [ ] Add device provisioning UI for org admins
- [ ] Implement `/api/nfc/scan` protected route using device secrets or signatures
- [ ] Implement email templates and `/apply/complete` page with a secure token flow
- [ ] Implement org dashboard routes and frontend
- [ ] Implement RLS and policies for user/org data access
- [ ] Add tests for device auth, token expiry, and deduplication logic

---

## Summary
This design lets an NFC reader authoritatively capture interest signals by scanning a card. The server converts a scan into an internal application record, notifies the user with an email link to complete the application, and shows the organization a dashboard with analytics and application lists. Security is enforced via device credentials and RLS policy; user consent and privacy must be handled in emails and UX.

If you want, I can scaffold the Next.js route handlers, example SQL migrations, and a sample org-dashboard page for this repo next — tell me which area you'd like scaffolded first (routes, DB migrations, or org UI).
