# Treelink Implementation Plan
## Digital Card + Extended NFC Workflow

**Design Theme:** Clean white background with mint green accents (#4ECDC4, #95E1D3, #A8E6CF)
**Priority:** Extended NFC workflow functionality
**Database:** Supabase (PostgreSQL)
**Image Storage:** ImageKit.io

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [File Structure](#file-structure)
4. [Implementation Phases](#implementation-phases)
5. [Design System & Styling](#design-system--styling)
6. [API Routes & Endpoints](#api-routes--endpoints)
7. [Security & Authentication](#security--authentication)
8. [ImageKit Integration](#imagekit-integration)
9. [Known Issues & Solutions](#known-issues--solutions)
10. [Testing Strategy](#testing-strategy)

---

## Architecture Overview

### Core Features
1. **Public Digital Card Pages** (`/{card_uuid}`)
   - Mobile-first Linktree-style profile
   - Social links (LinkedIn, Instagram, GitHub, Website)
   - vCard download
   - Avatar display (ImageKit)

2. **Owner Claim Flow**
   - Signup token-based claiming
   - Magic link authentication (Supabase OTP)
   - Profile editing dashboard

3. **Extended NFC Workflow** (Priority)
   - Organization management
   - NFC reader device provisioning
   - Scan-to-application flow
   - User application completion
   - Organization dashboard with analytics

### Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + Auth)
- **Image Storage:** ImageKit.io
- **Styling:** Tailwind CSS 4 (custom theme)
- **Icons:** Lucide React (or similar)

---

## Database Schema

### Core Tables

```sql
-- ============================================
-- USERS & CARDS (Digital Card Foundation)
-- ============================================

create table public.users (
  id uuid primary key default gen_random_uuid(),
  card_uuid uuid unique not null default gen_random_uuid(),
  email text unique, -- for notifications and auth
  first_name text,
  last_name text,
  title text,
  tagline text,
  bio text, -- extended bio field
  linkedin text,
  instagram text,
  github text,
  website text,
  avatar_url text, -- ImageKit URL
  signup_token text unique, -- for claiming flow
  auth_user_id uuid references auth.users(id) on delete set null,
  email_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_users_card_uuid on public.users(card_uuid);
create index idx_users_signup_token on public.users(signup_token);
create index idx_users_auth_user_id on public.users(auth_user_id);

-- ============================================
-- ORGANIZATIONS (NFC Workflow)
-- ============================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique, -- URL-friendly identifier
  email text,
  logo_url text, -- ImageKit URL
  description text,
  website text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_organizations_slug on public.organizations(slug);

-- Organization members (for dashboard access)
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member', -- 'owner', 'admin', 'member'
  created_at timestamptz default now(),
  unique(organization_id, user_id)
);

create index idx_org_members_org_id on public.organization_members(organization_id);
create index idx_org_members_user_id on public.organization_members(user_id);

-- ============================================
-- READER DEVICES (NFC Hardware)
-- ============================================

create table public.reader_devices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  device_secret text not null unique, -- for API authentication
  is_active boolean default true,
  last_seen_at timestamptz,
  metadata jsonb default '{}', -- location, notes, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_reader_devices_org_id on public.reader_devices(organization_id);
create index idx_reader_devices_secret on public.reader_devices(device_secret);

-- ============================================
-- APPLICATION TYPES (Campaigns/Types)
-- ============================================

create table public.application_types (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  questions jsonb default '[]', -- array of {id, type, label, required, options?}
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(organization_id, slug)
);

create index idx_application_types_org_id on public.application_types(organization_id);

-- ============================================
-- INFORMAL APPLICATIONS (Scan Results)
-- ============================================

create table public.informal_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  card_uuid uuid not null, -- convenience reference
  organization_id uuid references public.organizations(id) on delete cascade,
  reader_device_id uuid references public.reader_devices(id),
  application_type_id uuid references public.application_types(id),
  status text default 'pending', -- 'pending', 'awaiting_user', 'completed', 'expired', 'closed'
  public_token text unique not null, -- token for email link
  token_expires_at timestamptz, -- 7 days from creation
  payload jsonb default '{}', -- user answers: {role_choice, answers: [{question_id, value}]}
  metadata jsonb default '{}', -- scan location, timestamp, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  completed_at timestamptz
);

create index idx_applications_user_id on public.informal_applications(user_id);
create index idx_applications_org_id on public.informal_applications(organization_id);
create index idx_applications_status on public.informal_applications(status);
create index idx_applications_public_token on public.informal_applications(public_token);
create index idx_applications_card_uuid on public.informal_applications(card_uuid);

-- ============================================
-- ANALYTICS & EVENTS
-- ============================================

create table public.analytics_events (
  id bigserial primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  application_id uuid references public.informal_applications(id) on delete set null,
  event_type text not null, -- 'scan', 'email_sent', 'email_opened', 'application_completed', 'card_viewed'
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index idx_analytics_org_id on public.analytics_events(organization_id);
create index idx_analytics_event_type on public.analytics_events(event_type);
create index idx_analytics_created_at on public.analytics_events(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.reader_devices enable row level security;
alter table public.application_types enable row level security;
alter table public.informal_applications enable row level security;
alter table public.analytics_events enable row level security;

-- Users: public read by card_uuid, owner can update
create policy "Users are publicly readable by card_uuid"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = auth_user_id);

-- Organizations: members can read, owners/admins can manage
create policy "Organization members can read"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id
      and user_id = auth.uid()
    )
  );

create policy "Organization owners can manage"
  on public.organizations for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = organizations.id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Reader devices: org members can read, admins can manage
create policy "Org members can read devices"
  on public.reader_devices for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = reader_devices.organization_id
      and user_id = auth.uid()
    )
  );

-- Applications: users can read their own, org members can read org's
create policy "Users can read their own applications"
  on public.informal_applications for select
  using (
    exists (
      select 1 from public.users
      where users.id = informal_applications.user_id
      and users.auth_user_id = auth.uid()
    )
  );

create policy "Org members can read org applications"
  on public.informal_applications for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = informal_applications.organization_id
      and user_id = auth.uid()
    )
  );

-- Note: Device authentication for /api/nfc/scan uses service key, not RLS
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with theme
│   ├── page.tsx                       # Landing/home page
│   ├── globals.css                    # Global styles + mint theme
│   │
│   ├── [card_uuid]/                   
│   │   └── page.tsx                   # Public card page (server)
│   │
│   ├── signin/
│   │   └── [token]/
│   │       └── page.tsx               # Claim flow entry (server)
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                 # Dashboard layout (auth required)
│   │   ├── page.tsx                   # User dashboard (profile edit)
│   │   └── profile/
│   │       └── page.tsx               # Profile editor
│   │
│   ├── org/
│   │   ├── [org_slug]/
│   │   │   ├── layout.tsx             # Org dashboard layout
│   │   │   ├── page.tsx               # Org dashboard home
│   │   │   ├── applications/
│   │   │   │   └── page.tsx           # Applications list
│   │   │   ├── devices/
│   │   │   │   ├── page.tsx           # Device management
│   │   │   │   └── [device_id]/
│   │   │   │       └── page.tsx       # Device details
│   │   │   ├── campaigns/
│   │   │   │   ├── page.tsx           # Application types
│   │   │   │   └── [type_id]/
│   │   │   │       └── page.tsx       # Campaign editor
│   │   │   └── analytics/
│   │   │       └── page.tsx           # Analytics dashboard
│   │   │
│   ├── apply/
│   │   └── complete/
│   │       └── page.tsx                # Application completion (token-based)
│   │
│   └── api/
│       ├── profile/
│       │   └── route.ts               # GET/PUT user profile
│       ├── nfc/
│       │   └── scan/
│       │       └── route.ts           # POST scan endpoint (device auth)
│       ├── applications/
│       │   ├── route.ts               # GET applications (org)
│       │   └── [id]/
│       │       └── complete/
│       │           └── route.ts       # POST complete application
│       ├── organizations/
│       │   ├── route.ts               # GET/POST orgs
│       │   └── [id]/
│       │       └── route.ts           # GET/PUT/DELETE org
│       ├── devices/
│       │   ├── route.ts               # GET/POST devices
│       │   └── [id]/
│       │       └── route.ts           # GET/PUT/DELETE device
│       ├── analytics/
│       │   └── route.ts               # GET analytics (org)
│       └── auth/
│           └── callback/
│               └── route.ts           # Supabase auth callback
│
├── components/
│   ├── ui/                            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Badge.tsx
│   │
│   ├── card/
│   │   ├── CardProfile.tsx           # Public card display
│   │   ├── SocialLink.tsx            # Social link button
│   │   └── VCardDownload.tsx         # vCard generator (client)
│   │
│   ├── auth/
│   │   ├── SignInForm.tsx            # Magic link form (client)
│   │   └── ClaimFlow.tsx             # Claim flow wrapper
│   │
│   ├── dashboard/
│   │   ├── ProfileEditor.tsx         # Profile edit form
│   │   └── AvatarUpload.tsx          # ImageKit upload (client)
│   │
│   ├── org/
│   │   ├── ApplicationsTable.tsx     # Applications list
│   │   ├── DeviceList.tsx            # Device management
│   │   ├── CampaignEditor.tsx        # Application type editor
│   │   ├── AnalyticsDashboard.tsx    # Charts and metrics
│   │   └── ApplicationDetail.tsx    # Application detail modal
│   │
│   └── apply/
│       └── ApplicationForm.tsx       # Completion form (client)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Client Supabase instance
│   │   ├── server.ts                 # Server Supabase instance
│   │   └── middleware.ts             # Middleware helper
│   │
│   ├── imagekit/
│   │   └── client.ts                 # ImageKit client wrapper
│   │
│   ├── auth/
│   │   └── helpers.ts                # Auth helper functions
│   │
│   ├── db/
│   │   └── queries.ts                # Database query helpers
│   │
│   └── utils/
│       ├── tokens.ts                 # Token generation/validation
│       └── vcard.ts                  # vCard generation
│
└── types/
    └── database.ts                   # TypeScript types from Supabase
```

---

## Implementation Phases

### Phase 1: Foundation & Digital Card (Week 1)
**Goal:** Get basic digital card functionality working

1. **Setup & Configuration**
   - [ ] Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `imagekit`
   - [ ] Configure environment variables (.env.local)
   - [ ] Setup Supabase project and run initial schema migration
   - [ ] Configure ImageKit.io account and get credentials

2. **Database Setup**
   - [ ] Create `users` table with RLS policies
   - [ ] Seed test data with signup tokens
   - [ ] Test RLS policies

3. **Core UI Components**
   - [ ] Design system: mint green theme in globals.css
   - [ ] Create base UI components (Button, Card, Input)
   - [ ] Build CardProfile component (public card display)
   - [ ] Build SocialLink component
   - [ ] Build VCardDownload component

4. **Public Card Page**
   - [ ] Create `/[card_uuid]/page.tsx` (server component)
   - [ ] Fetch user profile from Supabase
   - [ ] Render CardProfile with social links
   - [ ] Add vCard download functionality
   - [ ] Mobile-responsive styling

5. **Owner Claim Flow**
   - [ ] Create `/signin/[token]/page.tsx`
   - [ ] Build SignInForm component (magic link)
   - [ ] Create `/api/auth/callback/route.ts`
   - [ ] Link auth_user_id to user on claim
   - [ ] Redirect to dashboard after claim

6. **Profile Dashboard**
   - [ ] Create `/dashboard/page.tsx` (protected)
   - [ ] Build ProfileEditor component
   - [ ] Create `/api/profile/route.ts` (GET/PUT)
   - [ ] Add AvatarUpload with ImageKit integration
   - [ ] Test profile updates

**Deliverable:** Working digital card with claim flow and profile editing

---

### Phase 2: Organization Foundation (Week 2)
**Goal:** Organization management and device provisioning

1. **Database Schema**
   - [ ] Create `organizations`, `organization_members`, `reader_devices` tables
   - [ ] Create `application_types` table
   - [ ] Setup RLS policies for org access
   - [ ] Create indexes

2. **Organization API**
   - [ ] Create `/api/organizations/route.ts` (GET/POST)
   - [ ] Create `/api/organizations/[id]/route.ts` (GET/PUT/DELETE)
   - [ ] Add organization member management
   - [ ] Test org creation and access

3. **Organization Dashboard UI**
   - [ ] Create `/org/[org_slug]/layout.tsx` (protected, org member check)
   - [ ] Create `/org/[org_slug]/page.tsx` (org home)
   - [ ] Build org settings page
   - [ ] Add org member management UI

4. **Device Management**
   - [ ] Create `/api/devices/route.ts` (GET/POST)
   - [ ] Create `/api/devices/[id]/route.ts` (GET/PUT/DELETE)
   - [ ] Build DeviceList component
   - [ ] Create device provisioning UI (`/org/[org_slug]/devices/page.tsx`)
   - [ ] Generate device secrets securely
   - [ ] Add device activation/deactivation

**Deliverable:** Organizations can be created and devices can be provisioned

---

### Phase 3: NFC Scan Flow (Week 3) - **PRIORITY**
**Goal:** Complete scan-to-application workflow

1. **Scan Endpoint**
   - [ ] Create `/api/nfc/scan/route.ts`
   - [ ] Implement device authentication (Bearer token or HMAC)
   - [ ] Validate device_secret and organization
   - [ ] Lookup user by card_uuid
   - [ ] Create `informal_applications` record
   - [ ] Generate public_token and set expiration (7 days)
   - [ ] Record analytics event
   - [ ] Send email notification (use Supabase Edge Function or Resend)
   - [ ] Handle duplicate scans (deduplication logic)
   - [ ] Add rate limiting per device

2. **Application Types/Campaigns**
   - [ ] Create `/api/campaigns/route.ts` (GET/POST for application_types)
   - [ ] Build CampaignEditor component
   - [ ] Create `/org/[org_slug]/campaigns/page.tsx`
   - [ ] Allow linking devices to campaigns
   - [ ] Support question definitions (JSON schema)

3. **Application Completion Flow**
   - [ ] Create `/apply/complete/page.tsx` (token-based, public)
   - [ ] Validate public_token and expiration
   - [ ] Fetch application and organization context
   - [ ] Build ApplicationForm component
   - [ ] Handle authentication (OTP if needed)
   - [ ] Create `/api/applications/[id]/complete/route.ts`
   - [ ] Update application status and payload
   - [ ] Send confirmation email to org
   - [ ] Record completion analytics event

4. **Email Templates**
   - [ ] Design email template (mint green theme)
   - [ ] Setup email service (Supabase Edge Function or Resend)
   - [ ] Create scan notification email
   - [ ] Create completion confirmation email
   - [ ] Add unsubscribe/opt-out links

**Deliverable:** Complete scan → email → completion workflow

---

### Phase 4: Organization Dashboard & Analytics (Week 4)
**Goal:** Full dashboard for viewing and managing applications

1. **Applications API**
   - [ ] Create `/api/applications/route.ts` (GET with filters)
   - [ ] Support filtering by status, type, date range
   - [ ] Add pagination
   - [ ] Include user profile snapshots
   - [ ] Add search by name/email/card_uuid

2. **Applications UI**
   - [ ] Create `/org/[org_slug]/applications/page.tsx`
   - [ ] Build ApplicationsTable component
   - [ ] Add filters (status, type, date)
   - [ ] Add search functionality
   - [ ] Build ApplicationDetail modal
   - [ ] Add CSV export functionality
   - [ ] Add bulk actions (close, archive)

3. **Analytics Dashboard**
   - [ ] Create `/api/analytics/route.ts`
   - [ ] Aggregate metrics: scans by day, completion rate, funnel
   - [ ] Create `/org/[org_slug]/analytics/page.tsx`
   - [ ] Build AnalyticsDashboard component
   - [ ] Add charts (line chart for scans over time, funnel chart)
   - [ ] Add device-level analytics
   - [ ] Add campaign performance metrics

4. **Real-time Updates** (Optional)
   - [ ] Use Supabase Realtime for live application updates
   - [ ] Add notification badges for new applications

**Deliverable:** Full-featured dashboard for managing and analyzing applications

---

### Phase 5: Polish & Optimization (Week 5)
**Goal:** UX improvements, performance, and edge cases

1. **UX Enhancements**
   - [ ] Add loading states and skeletons
   - [ ] Add error boundaries
   - [ ] Improve mobile responsiveness
   - [ ] Add toast notifications
   - [ ] Add confirmation dialogs for destructive actions
   - [ ] Improve form validation and error messages

2. **Performance**
   - [ ] Optimize database queries (add missing indexes)
   - [ ] Implement caching for public card pages
   - [ ] Optimize image loading (ImageKit transformations)
   - [ ] Add pagination for large lists
   - [ ] Lazy load dashboard components

3. **Security Hardening**
   - [ ] Review and tighten RLS policies
   - [ ] Add rate limiting to all API routes
   - [ ] Implement CSRF protection
   - [ ] Add input sanitization
   - [ ] Audit device authentication
   - [ ] Add token rotation for devices

4. **Edge Cases**
   - [ ] Handle expired tokens gracefully
   - [ ] Handle duplicate applications
   - [ ] Handle deleted users/organizations
   - [ ] Add cleanup job for expired applications
   - [ ] Handle ImageKit upload failures
   - [ ] Add retry logic for email sending

5. **Testing**
   - [ ] Write unit tests for utility functions
   - [ ] Write integration tests for API routes
   - [ ] Test RLS policies
   - [ ] Test device authentication
   - [ ] End-to-end test of scan flow

**Deliverable:** Production-ready application

---

## Design System & Styling

### Color Palette
```css
/* Mint Green Theme */
--mint-primary: #4ECDC4;      /* Primary actions, links */
--mint-secondary: #95E1D3;     /* Secondary elements */
--mint-light: #A8E6CF;         /* Backgrounds, accents */
--mint-dark: #2A9D8F;          /* Hover states, emphasis */

/* Neutrals */
--white: #FFFFFF;
--gray-50: #FAFAFA;
--gray-100: #F5F5F5;
--gray-200: #E5E5E5;
--gray-300: #D4D4D4;
--gray-400: #A3A3A3;
--gray-500: #737373;
--gray-600: #525252;
--gray-700: #404040;
--gray-800: #262626;
--gray-900: #171717;

/* Semantic Colors */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;
```

### Typography
- **Font Family:** Inter or Geist Sans (system font stack fallback)
- **Headings:** Bold, 24px-48px
- **Body:** Regular, 16px
- **Small:** 14px for labels, captions

### Component Styles

**Buttons:**
- Primary: Mint green background, white text, rounded-lg
- Secondary: White background, mint border, mint text
- Ghost: Transparent, mint text on hover

**Cards:**
- White background, subtle shadow, rounded-xl
- Padding: 24px
- Border: 1px solid gray-200 (optional)

**Inputs:**
- White background, gray-200 border
- Focus: mint border, mint ring
- Rounded-lg

**Links:**
- Mint color, underline on hover
- Social links: Icon + text, mint background on hover

---

## API Routes & Endpoints

### Public Routes
- `GET /[card_uuid]` - Public card page
- `GET /apply/complete?token=...` - Application completion page
- `POST /api/nfc/scan` - NFC scan endpoint (device auth)

### Authenticated Routes (User)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /dashboard` - User dashboard
- `GET /api/applications/me` - User's applications

### Authenticated Routes (Organization)
- `GET /api/organizations` - List user's orgs
- `POST /api/organizations` - Create org
- `GET /api/organizations/[id]` - Get org
- `PUT /api/organizations/[id]` - Update org
- `GET /api/devices` - List org devices
- `POST /api/devices` - Create device
- `GET /api/applications` - List org applications (filtered)
- `GET /api/analytics` - Get org analytics

### Auth Routes
- `GET /signin/[token]` - Claim flow entry
- `GET /api/auth/callback` - Supabase callback

---

## Security & Authentication

### Device Authentication
**Problem:** NFC readers need to authenticate without user interaction.

**Solution:**
1. Generate a unique `device_secret` (32+ character random string) when provisioning
2. Store hashed version in database (optional, or use service key access)
3. Device sends `Authorization: Bearer <device_secret>` header
4. Server validates secret against `reader_devices` table
5. Use service key for device endpoints (bypass RLS)

**Alternative (More Secure):**
- Use HMAC signatures: device signs request with secret
- Server validates signature

### User Authentication
- Supabase Auth with magic links (OTP)
- Session-based authentication for dashboard
- Token-based for application completion (public_token)

### RLS Policies
- Public read for user profiles (by card_uuid)
- Users can only update their own profile
- Org members can read org data
- Org owners/admins can manage org data
- Applications: users see their own, orgs see their org's

---

## ImageKit Integration

### Setup
1. Create ImageKit.io account
2. Get Public Key, Private Key, URL Endpoint
3. Install `imagekit` npm package
4. Create server-side ImageKit client

### Implementation
```typescript
// lib/imagekit/client.ts
import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

// Generate upload token for client
export async function getUploadToken() {
  const token = imagekit.getAuthenticationParameters();
  return token;
}
```

### Client-Side Upload
- Use ImageKit JavaScript SDK for browser uploads
- Generate upload token via API route
- Upload directly from browser to ImageKit
- Store returned URL in database

### Transformations
- Avatar: `w-200,h-200,c-fill` (200x200, fill crop)
- Org logo: `w-150,h-150,c-contain`
- Use ImageKit URL parameters for responsive images

---

## Known Issues & Solutions

### Issue 1: Layout Conflicts Between Card and Dashboard
**Problem:** Public card page (`/[card_uuid]`) and dashboard pages have different layout requirements. Card needs minimal chrome, dashboard needs navigation.

**Solution:**
- Use route groups: `(public)/[card_uuid]` and `(dashboard)/dashboard`
- Create separate layouts for each group
- Keep root layout minimal (just theme and fonts)

### Issue 2: Device Secret Storage
**Problem:** Storing device secrets in plaintext is a security risk.

**Solution:**
- Option A: Hash secrets with bcrypt, validate on API call
- Option B: Use service key for device endpoints, validate secret in application code
- Option C: Use JWT tokens issued to devices (more complex but more secure)
- **Recommended:** Option B for MVP, upgrade to Option A for production

### Issue 3: Email Delivery Reliability
**Problem:** Email delivery can fail or be delayed.

**Solution:**
- Use reliable service (Resend, SendGrid, or Supabase Edge Function with Resend)
- Add retry logic with exponential backoff
- Store email status in `analytics_events`
- Provide fallback: show application link in user dashboard if email fails

### Issue 4: Duplicate Scans
**Problem:** Same card scanned multiple times creates duplicate applications.

**Solution:**
- Check for existing `pending` or `awaiting_user` application for same `(user_id, organization_id, application_type_id)`
- If exists and not expired, return existing application ID
- If expired, create new application
- Add `deduplication_window` (e.g., 24 hours) to prevent rapid duplicates

### Issue 5: Token Expiration Handling
**Problem:** Users may click expired links.

**Solution:**
- Check `token_expires_at` on application load
- Show friendly error page with option to request new link
- Add "Resend link" functionality (requires email verification)

### Issue 6: Image Upload Security
**Problem:** Allowing direct client uploads to ImageKit could be abused.

**Solution:**
- Generate time-limited upload tokens (5 minutes)
- Require authentication for upload token generation
- Validate file type and size on client and server
- Use ImageKit's authentication parameters

### Issue 7: RLS Policy Complexity
**Problem:** Complex RLS policies can be hard to maintain and debug.

**Solution:**
- Start with simple policies, add complexity gradually
- Use Supabase's policy testing tools
- Document each policy's purpose
- Consider using service key for admin operations (with application-level checks)

### Issue 8: Analytics Performance
**Problem:** Aggregating analytics on-the-fly can be slow with many events.

**Solution:**
- Create materialized views for common queries
- Refresh views via cron job (Supabase Edge Function)
- Use `analytics_events` table for raw data, materialized views for dashboards
- Consider time-series database for scale (future)

---

## Testing Strategy

### Unit Tests
- Token generation/validation
- vCard generation
- ImageKit URL transformation
- Utility functions

### Integration Tests
- API route handlers
- Database queries
- Authentication flows
- Device authentication

### E2E Tests (Critical Paths)
1. **Card Claim Flow:**
   - Visit `/signin/[token]`
   - Enter email, receive magic link
   - Complete claim, redirect to dashboard
   - Edit profile

2. **NFC Scan Flow:**
   - Device scans card, POST to `/api/nfc/scan`
   - Application created, email sent
   - User clicks link, completes application
   - Org sees application in dashboard

3. **Organization Management:**
   - Create org
   - Add device
   - View applications
   - View analytics

### Manual Testing Checklist
- [ ] Public card renders correctly
- [ ] Social links work
- [ ] vCard download works
- [ ] Claim flow works end-to-end
- [ ] Profile editing works
- [ ] Device provisioning works
- [ ] Scan endpoint authenticates correctly
- [ ] Application completion works
- [ ] Org dashboard loads applications
- [ ] Analytics display correctly
- [ ] Mobile responsive on all pages
- [ ] Image uploads work
- [ ] Email delivery works

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# ImageKit
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxx
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Email (if using Resend)
RESEND_API_KEY=xxx

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=xxx
```

---

## Next Steps

1. **Review this plan** and adjust priorities as needed
2. **Setup Supabase project** and run initial migration
3. **Configure ImageKit.io** account
4. **Start Phase 1** implementation
5. **Iterate** based on feedback and testing

---

## Notes

- This plan prioritizes the NFC workflow while maintaining digital card functionality
- All new code should follow the mint green theme
- Security is built in from the start (RLS, device auth)
- The plan is flexible and can be adjusted based on requirements
- Consider adding a staging environment for testing before production

