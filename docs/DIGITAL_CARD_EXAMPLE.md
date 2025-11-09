# Digital Business Card (Linktree-style) — Example

This document describes the minimal example implemented in this repository and how to reproduce it. It focuses on the Linktree-like mobile profile page, Supabase-backed data model, and the owner claim flow (signup token + magic link). Use this as a short blueprint to run and extend the project.

## Goal
- Public mobile-friendly profile pages (Linktree) reachable at `/{card_uuid}`.
- Store user/card profiles in Supabase and render `linkedin`, `instagram`, `github`, `website` links as buttons if present.
- Allow the owner to claim an existing card using a signup token embedded in a link and a Supabase OTP (magic-link) email flow.
- Provide a client-side vCard download generator (browser-safe) from the profile data.

## Tech stack
- Next.js (App Router, server / client components)
- TypeScript
- Supabase (Postgres + Auth)
- @supabase/supabase-js and auth helpers
- Plain CSS (project uses `src/app/globals.css`) — no heavy UI dependency required

## Required environment variables
- NEXT_PUBLIC_SUPABASE_URL — public Supabase URL (client + server)
- NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key for client interactions
- SUPABASE_SERVICE_KEY — (optional but recommended for server-only tasks like issuing tokens or admin updates)
- NEXTAUTH_URL or NEXT_PUBLIC_APP_URL — used in some callback redirects (if used)

> Note: In the repo we use the route-handler Supabase pattern for secure server routes, and NEXT_PUBLIC_* variables for the client.

## Minimal database schema (Postgres)

Run this SQL in the Supabase SQL editor to create the tables used by the example (adjust types / columns as you need):

```sql
-- users/cards table (public profile)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  card_uuid uuid unique default gen_random_uuid(), -- public path identifier
  first_name text,
  last_name text,
  title text,
  tagline text,
  linkedin text,
  instagram text,
  github text,
  website text,
  avatar_url text,
  signup_token text, -- token pre-generated for claiming
  auth_user_id uuid, -- linked Supabase Auth user (nullable)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- audit / events (optional)
create table public.events (
  id serial primary key,
  user_id uuid references public.users(id),
  event_type text,
  payload jsonb,
  created_at timestamptz default now()
);
```

Notes:
- `signup_token` is a short random token pre-seeded when an org creates a card. Users who have that link can claim the card by verifying the token in a server-side page and then signing in with `signInWithOtp` (email magic link).
- `auth_user_id` is used to lock ownership to an authenticated Supabase user after the claim.

## API routes and contracts

The example implements a few server endpoints (App Router route handlers):

- GET /[uuid] (server page): calls server helper `getUserProfile(uuid)` and renders the Linktree UI.
  - Input: path `uuid`
  - Output: server-rendered React page with profile fields

- POST /api/profile (route handler): called by owner client to create/update their public profile
  - Auth: uses route-handler Supabase client to identify current session
  - Body: partial profile { first_name, last_name, linkedin, instagram, github, website, avatar_url }
  - Behavior: insert or update profile row where `auth_user_id` == current auth id

- GET /api/verify-token?token=XYZ
  - Input: query token
  - Output: { valid: boolean, user?: { card_uuid, first_name, ... } }

- /signin/[token] (server page) + client SignIn form component
  - Server page verifies `token` exists and hasn't been claimed
  - Client SignInForm calls `supabase.auth.signInWithOtp({ email, options: { redirectTo }})` where redirectTo includes the token so callback can link account

- /api/auth/callback (route handler): invoked on magic-link callback flow (if using Supabase redirect). This server route links `auth_user_id` to the row with matching `signup_token` if not already claimed.

Security considerations:
- Use RLS policies to restrict writes to user-owned rows: allow update/insert on `users` only if `auth.uid() = auth_user_id` (or set `auth_user_id` on claim then enforce).
- The callback route should verify session and only set `auth_user_id` on rows where it's still null and `signup_token` matches.

## Client components
- `SignInForm` (client): collects email and calls `signInWithOtp` with redirect containing token.
- `VCardGenerator` (client): constructs a vCard string on the client and triggers a file download (no Node fs usage). Example approach:
  - Build a string using vCard 3.0 fields for the non-null profile fields
  - Create a Blob and `URL.createObjectURL` then `a.download` to trigger download

## Styling
- Mobile-first layout in `src/app/globals.css` with `.page-root` container and `.link-btn` used for each social link.
- Buttons are slightly transparent dark gray with white text and a light drop shadow (adjust colors in CSS to taste).

## Local quickstart (developer)
1. Copy the repo and install deps:

```bash
npm install
```

2. Create a `.env.local` with the environment variables listed above.

3. Create the Postgres tables in Supabase (use SQL from the schema section).

4. Run the app locally:

```bash
npm run dev
```

5. Seed a `users` row with a `signup_token` (string) so you can test the claim flow. Open `/signin/<token>` to start the flow.

## Extensibility notes
- Add an `applications` table and `organizations` if you want to track formal applications from the card owner to an org.
- Add `reader_devices` and a secure API route for hardware NFC readers (see the extended NFC workflow doc for a full design).

## Acceptance / success criteria
- Visiting `/{card_uuid}` renders a mobile-friendly card with only the present links.
- Owner claim flow: given a `signup_token`, the owner can sign in via email OTP and then edit their profile.
- vCard download works in the browser and contains only filled fields.

---

