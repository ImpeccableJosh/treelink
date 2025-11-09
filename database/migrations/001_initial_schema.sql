-- ============================================
-- Treelink Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

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

-- Organization members: members can read their own orgs
create policy "Users can read their org memberships"
  on public.organization_members for select
  using (user_id = auth.uid());

create policy "Org owners can manage members"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = organization_members.organization_id
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

create policy "Org admins can manage devices"
  on public.reader_devices for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = reader_devices.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
    )
  );

-- Application types: org members can read, admins can manage
create policy "Org members can read application types"
  on public.application_types for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = application_types.organization_id
      and user_id = auth.uid()
    )
  );

create policy "Org admins can manage application types"
  on public.application_types for all
  using (
    exists (
      select 1 from public.organization_members
      where organization_id = application_types.organization_id
      and user_id = auth.uid()
      and role in ('owner', 'admin')
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

create policy "Users can update their own applications"
  on public.informal_applications for update
  using (
    exists (
      select 1 from public.users
      where users.id = informal_applications.user_id
      and users.auth_user_id = auth.uid()
    )
  );

-- Analytics: org members can read their org's analytics
create policy "Org members can read org analytics"
  on public.analytics_events for select
  using (
    organization_id is null or
    exists (
      select 1 from public.organization_members
      where organization_id = analytics_events.organization_id
      and user_id = auth.uid()
    )
  );

-- Note: Device authentication for /api/nfc/scan uses service key, not RLS
-- The scan endpoint bypasses RLS by using the service role key

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_users_updated_at before update on public.users
  for each row execute function update_updated_at_column();

create trigger update_organizations_updated_at before update on public.organizations
  for each row execute function update_updated_at_column();

create trigger update_reader_devices_updated_at before update on public.reader_devices
  for each row execute function update_updated_at_column();

create trigger update_application_types_updated_at before update on public.application_types
  for each row execute function update_updated_at_column();

create trigger update_informal_applications_updated_at before update on public.informal_applications
  for each row execute function update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to create a test user with signup token
-- insert into public.users (first_name, last_name, email, signup_token) 
-- values ('Test', 'User', 'test@example.com', 'test-token-12345');

