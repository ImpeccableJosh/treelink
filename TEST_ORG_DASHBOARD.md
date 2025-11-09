# Testing Organization Dashboard & Applications

## Step 1: Create an Organization

### Option A: Via SQL (Quick)
Run in Supabase SQL Editor:

```sql
-- First, get your auth user ID
SELECT id, email FROM auth.users LIMIT 1;

-- Replace USER_ID with your actual auth user ID from above
-- Create organization
INSERT INTO public.organizations (name, slug, created_by)
VALUES ('Test Organization', 'test-org', 'YOUR_USER_ID')
RETURNING id, slug;

-- Add yourself as owner
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT id, 'YOUR_USER_ID', 'owner'
FROM public.organizations
WHERE slug = 'test-org';
```

### Option B: Via API (After claiming a card)
1. Claim your card at `/signin/{token}`
2. Sign in to dashboard
3. Create org via API:
```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Test Organization",
    "slug": "test-org",
    "description": "Test org for dashboard"
  }'
```

## Step 2: Access Organization Dashboard

Visit:
```
http://localhost:3000/org/test-org
```

**If not signed in:**
- Will redirect to: `/signin?redirect=/org/test-org`
- Sign in with your email
- After sign in, automatically redirects back to `/org/test-org`

**Expected:**
- Organization name and description
- Quick stats (Total Applications, Completed, Active Devices)
- Quick action buttons

## Step 3: View Applications

### Via Dashboard UI
1. Click "View Applications" or navigate to:
   ```
   http://localhost:3000/org/test-org/applications
   ```

2. **Expected:** See list of applications with:
   - User name/email
   - Application type
   - Status badge
   - Created date

### Via API
```bash
curl http://localhost:3000/api/applications?organization_id=YOUR_ORG_ID \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

## Step 4: Verify Application Data

### Check Database
Run in Supabase SQL Editor:

```sql
-- View all applications for your org
SELECT 
  ia.id,
  ia.status,
  ia.created_at,
  ia.completed_at,
  u.first_name,
  u.last_name,
  u.email,
  o.name as organization_name
FROM public.informal_applications ia
JOIN public.users u ON u.id = ia.user_id
JOIN public.organizations o ON o.id = ia.organization_id
WHERE o.slug = 'test-org'
ORDER BY ia.created_at DESC;
```

### Check Application Details
```sql
-- View full application with payload
SELECT 
  ia.*,
  u.first_name,
  u.last_name,
  u.email,
  u.card_uuid
FROM public.informal_applications ia
JOIN public.users u ON u.id = ia.user_id
WHERE ia.organization_id = (
  SELECT id FROM public.organizations WHERE slug = 'test-org'
)
ORDER BY ia.created_at DESC
LIMIT 1;
```

## Step 5: Test Complete Workflow

### 1. Create Test User & Card
```sql
INSERT INTO public.users (first_name, last_name, email, signup_token)
VALUES ('John', 'Doe', 'john@example.com', 'test-token-123')
RETURNING card_uuid;
```

### 2. Create Device
```sql
-- Get org ID
SELECT id FROM public.organizations WHERE slug = 'test-org';

-- Create device (replace ORG_ID)
INSERT INTO public.reader_devices (organization_id, name, device_secret, is_active)
VALUES ('ORG_ID', 'Test Reader', gen_random_uuid()::text, true)
RETURNING id, device_secret;
```

### 3. Simulate Scan
```bash
curl -X POST http://localhost:3000/api/nfc/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DEVICE_SECRET" \
  -d '{
    "card_uuid": "YOUR_CARD_UUID",
    "reader_id": "YOUR_DEVICE_ID"
  }'
```

### 4. Complete Application
Get the `public_token` from database:
```sql
SELECT public_token FROM public.informal_applications 
ORDER BY created_at DESC LIMIT 1;
```

Visit: `http://localhost:3000/apply/complete?token=YOUR_PUBLIC_TOKEN`

### 5. View in Dashboard
Visit: `http://localhost:3000/org/test-org/applications`

**Expected:** See the completed application in the list

## Step 6: Test Filters & Search

### Filter by Status
Visit:
```
http://localhost:3000/org/test-org/applications?status=completed
http://localhost:3000/org/test-org/applications?status=awaiting_user
```

### Filter by Date Range
```bash
curl "http://localhost:3000/api/applications?organization_id=ORG_ID&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

## Step 7: Test Analytics

Visit:
```
http://localhost:3000/org/test-org/analytics
```

**Expected:**
- Total applications count
- Completion rate
- Status breakdown
- Scans over time (last 30 days)

## Step 8: Test Device Management

Visit:
```
http://localhost:3000/org/test-org/devices
```

**Expected:**
- List of all devices
- Device status (Active/Inactive)
- Create new device button
- Device creation date

## Troubleshooting

### "Not a member of this organization"
**Fix:** Add yourself as a member:
```sql
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT id, 'YOUR_USER_ID', 'owner'
FROM public.organizations
WHERE slug = 'test-org';
```

### Applications not showing
**Check:**
1. Verify application exists:
```sql
SELECT * FROM public.informal_applications 
WHERE organization_id = 'YOUR_ORG_ID';
```

2. Check RLS policies allow reading
3. Verify you're signed in with correct user

### Dashboard shows 404
**Fix:** 
1. Verify organization slug is correct
2. Check you're a member of the org
3. Verify org exists:
```sql
SELECT * FROM public.organizations WHERE slug = 'test-org';
```

### No applications after scan
**Check:**
1. Verify scan was successful (check response)
2. Check database:
```sql
SELECT * FROM public.informal_applications 
ORDER BY created_at DESC LIMIT 5;
```

3. Verify `organization_id` matches your org

## Quick Test Checklist

- [ ] Organization created
- [ ] Added as org member (owner/admin)
- [ ] Can access `/org/{slug}` dashboard
- [ ] Can view applications list
- [ ] Can see application details
- [ ] Status filters work
- [ ] Analytics page loads
- [ ] Device management works
- [ ] Completed applications show correct status

## SQL Helper Queries

### Get Your User Info
```sql
SELECT id, email FROM auth.users WHERE email = 'your@email.com';
```

### Get All Your Organizations
```sql
SELECT o.*, om.role
FROM public.organizations o
JOIN public.organization_members om ON om.organization_id = o.id
WHERE om.user_id = 'YOUR_USER_ID';
```

### Get Application Counts
```sql
SELECT 
  status,
  COUNT(*) as count
FROM public.informal_applications
WHERE organization_id = 'YOUR_ORG_ID'
GROUP BY status;
```

### Get Recent Applications
```sql
SELECT 
  ia.id,
  ia.status,
  ia.created_at,
  u.first_name || ' ' || u.last_name as name,
  u.email
FROM public.informal_applications ia
JOIN public.users u ON u.id = ia.user_id
WHERE ia.organization_id = 'YOUR_ORG_ID'
ORDER BY ia.created_at DESC
LIMIT 10;
```

