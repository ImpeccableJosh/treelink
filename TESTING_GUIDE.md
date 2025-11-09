# Testing Guide for Treelink

## Step 1: Install Dependencies

```bash
npm install
```

If you still encounter issues, try:
```bash
npm install --legacy-peer-deps
```

## Step 2: Environment Setup

1. **Create `.env.local` file** in the root directory:
```bash
cp .env.example .env.local
```

2. **Fill in your credentials:**

### Supabase Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings → API
3. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### ImageKit Setup
1. Go to [imagekit.io](https://imagekit.io) and create an account
2. Go to Developer Options → API Keys
3. Copy:
   - `URL Endpoint` → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
   - `Public Key` → `IMAGEKIT_PUBLIC_KEY`
   - `Private Key` → `IMAGEKIT_PRIVATE_KEY`

### App URL
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Database Setup

1. In Supabase, go to **SQL Editor**
2. Copy the entire contents of `database/migrations/001_initial_schema.sql`
3. Paste and click **Run**
4. Verify tables were created (check Table Editor)

## Step 4: Create Test Data

Run this SQL in Supabase SQL Editor to create a test user:

```sql
-- Create a test user with signup token
INSERT INTO public.users (
  first_name,
  last_name,
  email,
  title,
  tagline,
  signup_token
) VALUES (
  'John',
  'Doe',
  'john.doe@example.com',
  'Software Engineer',
  'Building awesome things',
  'test-token-12345'
);

-- Get the card_uuid for testing
SELECT card_uuid, signup_token FROM public.users WHERE signup_token = 'test-token-12345';
```

**Save the `card_uuid`** - you'll need it for testing!

## Step 5: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 6: Testing Checklist

### ✅ Test 1: Public Card Page
1. Visit `http://localhost:3000/{card_uuid}` (use the UUID from Step 4)
2. **Expected:** Card displays with name, title, tagline
3. **Test:** Click social links (if added)
4. **Test:** Click "Download vCard" button

### ✅ Test 2: Claim Flow
1. Visit `http://localhost:3000/signin/test-token-12345`
2. **Expected:** Sign-in form appears
3. Enter your email address
4. Click "Send Magic Link"
5. **Expected:** Success message appears
6. Check your email for magic link
7. Click the magic link
8. **Expected:** Redirected to dashboard

### ✅ Test 3: User Dashboard
1. After claiming, you should be on `/dashboard`
2. **Expected:** See your public card link
3. **Test:** Edit profile fields
4. **Test:** Upload avatar (ImageKit)
5. Click "Save Profile"
6. **Expected:** Success message, profile updates

### ✅ Test 4: Create Organization
1. In dashboard, create an organization via API or add a button
2. Or use this SQL:
```sql
-- First, get your auth user ID
SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then create org (replace USER_ID with your auth user ID)
INSERT INTO public.organizations (name, slug, created_by)
VALUES ('Test Org', 'test-org', 'USER_ID');

-- Add yourself as owner
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT id, 'USER_ID', 'owner'
FROM public.organizations
WHERE slug = 'test-org';
```

3. Visit `http://localhost:3000/org/test-org`
4. **Expected:** Organization dashboard loads

### ✅ Test 5: Device Provisioning
1. In org dashboard, go to "Devices"
2. Click "Add Device"
3. Enter device name: "Test Reader"
4. Click "Create Device"
5. **Expected:** Device secret appears (SAVE THIS!)
6. **Test:** Copy secret to clipboard

### ✅ Test 6: NFC Scan Endpoint
Use curl or Postman to test:

```bash
curl -X POST http://localhost:3000/api/nfc/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DEVICE_SECRET" \
  -d '{
    "card_uuid": "YOUR_CARD_UUID",
    "reader_id": "YOUR_DEVICE_ID"
  }'
```

**Expected:** Returns `{"success": true, "application_id": "..."}`

### ✅ Test 7: Application Completion
1. After a scan, check the database for `public_token`:
```sql
SELECT public_token, token_expires_at 
FROM public.informal_applications 
ORDER BY created_at DESC 
LIMIT 1;
```

2. Visit `http://localhost:3000/apply/complete?token={public_token}`
3. **Expected:** Application form appears
4. Fill out form (if questions exist)
5. Click "Submit Application"
6. **Expected:** Success message, redirects

### ✅ Test 8: Organization Applications
1. In org dashboard, go to "Applications"
2. **Expected:** See the application you just completed
3. **Test:** Filter by status
4. **Test:** View application details

### ✅ Test 9: Analytics
1. In org dashboard, go to "Analytics"
2. **Expected:** See metrics:
   - Total applications
   - Completion rate
   - Status breakdown
   - Scans over time

## Step 7: Common Issues & Fixes

### Issue: "Cannot find module '@/lib/...'"
**Fix:** Make sure `tsconfig.json` has:
```json
"paths": {
  "@/*": ["./src/*"]
}
```

### Issue: "RLS policy violation"
**Fix:** 
1. Check RLS policies in Supabase
2. Verify user is authenticated
3. Check organization membership

### Issue: "ImageKit upload fails"
**Fix:**
1. Verify ImageKit credentials
2. Check CORS settings in ImageKit dashboard
3. Verify upload token generation

### Issue: "Magic link not working"
**Fix:**
1. Check Supabase email settings
2. Verify `NEXT_PUBLIC_APP_URL` is correct
3. Check spam folder
4. Verify Supabase Auth is enabled

### Issue: "Device authentication fails"
**Fix:**
1. Verify device_secret matches exactly
2. Check Authorization header format: `Bearer {secret}`
3. Verify device is active in database

## Step 8: Production Readiness Checklist

Before deploying:

- [ ] All environment variables set in production
- [ ] Database migrations run in production Supabase
- [ ] RLS policies tested and working
- [ ] ImageKit configured for production domain
- [ ] Email service configured (Resend/SendGrid)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Rate limiting configured
- [ ] CORS settings configured
- [ ] SSL/HTTPS enabled
- [ ] Build passes: `npm run build`

## Step 9: Manual Testing Script

Create a test script to automate some checks:

```bash
# Test public card
curl http://localhost:3000/{card_uuid}

# Test NFC scan
curl -X POST http://localhost:3000/api/nfc/scan \
  -H "Authorization: Bearer {secret}" \
  -H "Content-Type: application/json" \
  -d '{"card_uuid": "{uuid}", "reader_id": "{id}"}'

# Test applications list (requires auth cookie)
curl http://localhost:3000/api/applications?organization_id={org_id}
```

## Step 10: Next Steps

1. **Add Email Integration:**
   - Set up Resend or SendGrid
   - Create email templates
   - Test email delivery

2. **Add Rate Limiting:**
   - Install `@upstash/ratelimit` or similar
   - Add to API routes

3. **Add Error Tracking:**
   - Set up Sentry or similar
   - Add error boundaries

4. **Add Tests:**
   - Unit tests for utilities
   - Integration tests for API routes
   - E2E tests for critical flows

5. **Optimize:**
   - Add caching for public cards
   - Optimize database queries
   - Add pagination everywhere

## Troubleshooting

If something doesn't work:

1. Check browser console for errors
2. Check terminal for server errors
3. Check Supabase logs
4. Verify environment variables are loaded
5. Check database tables exist
6. Verify RLS policies are correct
7. Test with service role key (bypass RLS) to isolate issues

## Support

For issues:
1. Check the implementation plan docs
2. Review the layout issues doc
3. Check Supabase/ImageKit documentation
4. Review Next.js App Router docs

