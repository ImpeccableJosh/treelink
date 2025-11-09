# Quick Start Checklist
## Getting Treelink Up and Running

---

## Pre-Development Setup

### 1. Environment Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env.local` file
- [ ] Add Supabase credentials:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add ImageKit credentials:
  - [ ] `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
  - [ ] `IMAGEKIT_PUBLIC_KEY`
  - [ ] `IMAGEKIT_PRIVATE_KEY`
- [ ] Add app URL:
  - [ ] `NEXT_PUBLIC_APP_URL` (e.g., `http://localhost:3000`)

### 2. Supabase Setup
- [ ] Create new Supabase project
- [ ] Go to SQL Editor
- [ ] Run database schema migration (from IMPLEMENTATION_PLAN.md)
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Test RLS policies
- [ ] Create test user in Auth
- [ ] Seed test data:
  - [ ] Create test `users` row with `signup_token`
  - [ ] Create test `organizations` row
  - [ ] Create test `reader_devices` row

### 3. ImageKit Setup
- [ ] Create ImageKit.io account
- [ ] Create new media library
- [ ] Get Public Key, Private Key, URL Endpoint
- [ ] Configure upload settings (allowed file types, max size)
- [ ] Test image upload manually

### 4. Dependencies Installation
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install imagekit
npm install lucide-react
npm install date-fns  # for date formatting
```

---

## Phase 1: Foundation (Week 1)

### Database & Auth
- [ ] Run initial migration
- [ ] Test RLS policies
- [ ] Setup Supabase client helpers (`lib/supabase/client.ts`, `server.ts`)

### Design System
- [ ] Update `globals.css` with mint green theme
- [ ] Create base UI components:
  - [ ] `components/ui/Button.tsx`
  - [ ] `components/ui/Card.tsx`
  - [ ] `components/ui/Input.tsx`
  - [ ] `components/ui/Modal.tsx`

### Public Card Page
- [ ] Create `app/[card_uuid]/page.tsx`
- [ ] Create `components/card/CardProfile.tsx`
- [ ] Create `components/card/SocialLink.tsx`
- [ ] Create `components/card/VCardDownload.tsx`
- [ ] Test card rendering with test data
- [ ] Test mobile responsiveness

### Claim Flow
- [ ] Create `app/signin/[token]/page.tsx`
- [ ] Create `components/auth/SignInForm.tsx`
- [ ] Create `app/api/auth/callback/route.ts`
- [ ] Test claim flow end-to-end

### Profile Dashboard
- [ ] Create `app/dashboard/page.tsx` (protected)
- [ ] Create `components/dashboard/ProfileEditor.tsx`
- [ ] Create `app/api/profile/route.ts`
- [ ] Create `components/dashboard/AvatarUpload.tsx` (ImageKit)
- [ ] Test profile editing

**Checkpoint:** Can view public card, claim it, and edit profile

---

## Phase 2: Organizations (Week 2)

### Database
- [ ] Run organization tables migration
- [ ] Test RLS policies for orgs

### Organization API
- [ ] Create `app/api/organizations/route.ts`
- [ ] Create `app/api/organizations/[id]/route.ts`
- [ ] Test org CRUD operations

### Organization UI
- [ ] Create `app/org/[org_slug]/layout.tsx`
- [ ] Create `app/org/[org_slug]/page.tsx`
- [ ] Create org settings page
- [ ] Create member management UI

### Device Management
- [ ] Create `app/api/devices/route.ts`
- [ ] Create `app/api/devices/[id]/route.ts`
- [ ] Create `app/org/[org_slug]/devices/page.tsx`
- [ ] Create `components/org/DeviceList.tsx`
- [ ] Test device provisioning
- [ ] Test device secret generation

**Checkpoint:** Can create orgs and provision devices

---

## Phase 3: NFC Workflow (Week 3) - **PRIORITY**

### Scan Endpoint
- [ ] Create `app/api/nfc/scan/route.ts`
- [ ] Implement device authentication
- [ ] Test device secret validation
- [ ] Implement user lookup by card_uuid
- [ ] Create `informal_applications` record
- [ ] Generate `public_token` with expiration
- [ ] Record analytics event
- [ ] Implement duplicate scan handling
- [ ] Add rate limiting

### Application Types
- [ ] Create `app/api/campaigns/route.ts`
- [ ] Create `app/org/[org_slug]/campaigns/page.tsx`
- [ ] Create `components/org/CampaignEditor.tsx`
- [ ] Test campaign creation

### Application Completion
- [ ] Create `app/apply/complete/page.tsx`
- [ ] Create `components/apply/ApplicationForm.tsx`
- [ ] Create `app/api/applications/[id]/complete/route.ts`
- [ ] Test token validation
- [ ] Test application completion flow

### Email System
- [ ] Setup email service (Resend or Supabase Edge Function)
- [ ] Create email templates (mint green theme)
- [ ] Send scan notification email
- [ ] Send completion confirmation email
- [ ] Test email delivery

**Checkpoint:** Complete scan → email → completion workflow works

---

## Phase 4: Dashboard & Analytics (Week 4)

### Applications API
- [ ] Create `app/api/applications/route.ts`
- [ ] Implement filtering (status, type, date)
- [ ] Implement pagination
- [ ] Test API endpoints

### Applications UI
- [ ] Create `app/org/[org_slug]/applications/page.tsx`
- [ ] Create `components/org/ApplicationsTable.tsx`
- [ ] Add filters UI
- [ ] Add search functionality
- [ ] Create `components/org/ApplicationDetail.tsx` (modal)
- [ ] Implement CSV export
- [ ] Test applications list

### Analytics
- [ ] Create `app/api/analytics/route.ts`
- [ ] Create aggregation queries
- [ ] Create `app/org/[org_slug]/analytics/page.tsx`
- [ ] Create `components/org/AnalyticsDashboard.tsx`
- [ ] Add charts (line, funnel)
- [ ] Test analytics display

**Checkpoint:** Full dashboard with applications and analytics

---

## Phase 5: Polish (Week 5)

### UX Improvements
- [ ] Add loading states (skeletons)
- [ ] Add error boundaries
- [ ] Improve mobile responsiveness
- [ ] Add toast notifications
- [ ] Add confirmation dialogs
- [ ] Improve form validation

### Performance
- [ ] Add database indexes
- [ ] Implement caching for public cards
- [ ] Optimize image loading
- [ ] Add pagination everywhere
- [ ] Lazy load dashboard components

### Security
- [ ] Review RLS policies
- [ ] Add rate limiting
- [ ] Add CSRF protection
- [ ] Sanitize inputs
- [ ] Audit device auth
- [ ] Test token expiration

### Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Test RLS policies
- [ ] End-to-end test scan flow
- [ ] Test on mobile devices

---

## Testing Checklist

### Public Card
- [ ] Card renders with all fields
- [ ] Social links work
- [ ] vCard download works
- [ ] Mobile responsive
- [ ] Avatar displays correctly

### Claim Flow
- [ ] Token validation works
- [ ] Magic link sent
- [ ] Auth callback links account
- [ ] Redirect to dashboard works

### Profile Editing
- [ ] Can update all fields
- [ ] Avatar upload works
- [ ] Changes persist
- [ ] Validation works

### NFC Scan
- [ ] Device authentication works
- [ ] Application created
- [ ] Email sent
- [ ] Duplicate handling works
- [ ] Rate limiting works

### Application Completion
- [ ] Token validation works
- [ ] Form renders correctly
- [ ] Submission works
- [ ] Status updates
- [ ] Org notified

### Organization Dashboard
- [ ] Applications list loads
- [ ] Filters work
- [ ] Search works
- [ ] Detail modal works
- [ ] CSV export works
- [ ] Analytics display correctly

---

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables set in production
- [ ] Database migrations run in production
- [ ] RLS policies enabled
- [ ] ImageKit configured for production
- [ ] Email service configured
- [ ] Error tracking setup (optional)

### Deployment
- [ ] Build passes (`npm run build`)
- [ ] Deploy to hosting (Vercel, etc.)
- [ ] Verify environment variables
- [ ] Test production URLs
- [ ] Test email delivery
- [ ] Monitor error logs

### Post-Deployment
- [ ] Test public card page
- [ ] Test claim flow
- [ ] Test NFC scan endpoint
- [ ] Test application completion
- [ ] Test org dashboard
- [ ] Monitor performance

---

## Common Issues & Solutions

### Issue: RLS Policy Blocks Query
**Solution:** Check policy conditions, test with service key, verify user context

### Issue: Device Auth Fails
**Solution:** Verify device_secret matches, check Authorization header format

### Issue: Image Upload Fails
**Solution:** Check ImageKit credentials, verify upload token generation, check CORS

### Issue: Email Not Sending
**Solution:** Verify email service credentials, check spam folder, verify email template

### Issue: Token Expired
**Solution:** Check token expiration logic, verify timezone handling, extend expiration if needed

---

## Next Steps After Completion

1. **User Testing:** Get feedback from real users
2. **Performance Monitoring:** Set up analytics and monitoring
3. **Feature Requests:** Collect and prioritize new features
4. **Documentation:** Create user-facing documentation
5. **Marketing:** Prepare for launch

---

## Resources

- **Implementation Plan:** `docs/IMPLEMENTATION_PLAN.md`
- **Layout Issues:** `docs/LAYOUT_ISSUES_AND_FIXES.md`
- **Design System:** `docs/DESIGN_SYSTEM.md`
- **Supabase Docs:** https://supabase.com/docs
- **ImageKit Docs:** https://docs.imagekit.io
- **Next.js Docs:** https://nextjs.org/docs

