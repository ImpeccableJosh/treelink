# Layout Issues & Fixes
## Critical Problems and Solutions for Treelink

---

## Issue 1: Route Structure Conflicts

### Problem
The current Next.js App Router structure doesn't account for:
- Public card pages (`/[card_uuid]`) needing minimal layout
- Dashboard pages needing navigation and sidebar
- Organization pages needing different navigation
- Application completion pages needing standalone layout

### Solution: Route Groups
```
app/
├── (public)/              # Route group for public pages
│   ├── [card_uuid]/
│   │   └── page.tsx
│   └── layout.tsx          # Minimal layout (no nav)
│
├── (dashboard)/           # Route group for user dashboard
│   ├── dashboard/
│   │   └── page.tsx
│   └── layout.tsx         # Dashboard layout with nav
│
├── (org)/                 # Route group for org pages
│   ├── org/
│   │   └── [org_slug]/
│   └── layout.tsx         # Org dashboard layout
│
└── (standalone)/          # Route group for standalone pages
    ├── apply/
    └── signin/
```

**Why:** Route groups `(name)` don't affect URL structure but allow separate layouts per section.

---

## Issue 2: Authentication State Management

### Problem
- Public card pages don't need auth
- Dashboard pages require auth
- Application completion pages need conditional auth (token-based)
- Organization pages need org membership check

### Solution: Middleware + Layout Guards
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Public routes: no auth needed
  if (request.nextUrl.pathname.match(/^\/[a-f0-9-]{36}$/)) {
    return NextResponse.next();
  }
  
  // Protected routes: check auth
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirect to signin if not authenticated
  }
  
  // Org routes: check org membership
  if (request.nextUrl.pathname.startsWith('/org/')) {
    // Verify user is org member
  }
}
```

**Why:** Centralized auth logic prevents layout conflicts and ensures proper access control.

---

## Issue 3: Card UUID Collision with Routes

### Problem
`/[card_uuid]` could conflict with:
- `/dashboard`
- `/api/*`
- `/org/*`
- Other app routes

### Solution: UUID Validation + Route Priority
```typescript
// app/[card_uuid]/page.tsx
export default async function CardPage({ params }: { params: { card_uuid: string } }) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(params.card_uuid)) {
    notFound();
  }
  
  // Fetch and render card
}
```

**Why:** Next.js routes are matched in order, so `/dashboard` will match before `/[card_uuid]` if UUID validation fails.

**Alternative:** Use a prefix like `/c/[card_uuid]` to avoid conflicts entirely.

---

## Issue 4: Image Loading Performance

### Problem
- Avatar images on public cards need to load fast
- Organization logos in dashboard need optimization
- ImageKit URLs need proper transformations

### Solution: Next.js Image + ImageKit
```typescript
// Use Next.js Image component with ImageKit
<Image
  src={`${imagekitUrl}/tr:w-200,h-200,c-fill/${avatarUrl}`}
  width={200}
  height={200}
  alt="Avatar"
  priority // For above-the-fold images
/>
```

**Why:** Next.js Image provides automatic optimization, lazy loading, and proper sizing.

---

## Issue 5: Mobile-First Card Design

### Problem
Current card example doesn't specify mobile breakpoints clearly. Cards need to work on:
- Small phones (320px)
- Tablets (768px)
- Desktop (1024px+)

### Solution: Responsive Design System
```css
/* Mobile-first approach */
.card-container {
  padding: 1rem;
  max-width: 100%;
}

@media (min-width: 768px) {
  .card-container {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }
}
```

**Why:** Mobile-first ensures cards work on all devices, then enhance for larger screens.

---

## Issue 6: Dashboard Navigation Structure

### Problem
- User dashboard needs: Profile, My Applications
- Org dashboard needs: Overview, Applications, Devices, Campaigns, Analytics
- These have different navigation requirements

### Solution: Separate Layout Components
```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <UserNav /> {/* Profile, Applications */}
      <main>{children}</main>
    </div>
  );
}

// app/(org)/org/[org_slug]/layout.tsx
export default function OrgLayout({ children }) {
  return (
    <div className="org-layout">
      <OrgNav /> {/* Overview, Applications, Devices, etc. */}
      <main>{children}</main>
    </div>
  );
}
```

**Why:** Separate layouts prevent navigation conflicts and provide appropriate UX for each context.

---

## Issue 7: Application Completion Flow

### Problem
- Application completion page needs to work for:
  - Unauthenticated users (token-based)
  - Authenticated users (session-based)
- Different UI states based on auth status

### Solution: Conditional Rendering + Auth Check
```typescript
// app/apply/complete/page.tsx
export default async function CompleteApplication({ searchParams }) {
  const token = searchParams.token;
  const application = await getApplicationByToken(token);
  
  // Check if user is authenticated
  const session = await getSession();
  const isOwner = session?.user?.id === application.user_id;
  
  if (isOwner) {
    // Show pre-filled form, skip email verification
  } else {
    // Show email input, require OTP
  }
}
```

**Why:** Handles both authenticated and unauthenticated flows gracefully.

---

## Issue 8: Analytics Data Loading

### Problem
- Analytics dashboard needs to load:
  - Aggregated metrics (fast)
  - Time-series data (can be slow)
  - Real-time updates (optional)

### Solution: Progressive Loading + Caching
```typescript
// Load critical metrics first
const metrics = await getQuickMetrics(orgId);

// Load time-series data in parallel (or lazy)
const timeSeries = await getTimeSeriesData(orgId);

// Use React Suspense for progressive rendering
<Suspense fallback={<MetricsSkeleton />}>
  <MetricsChart data={timeSeries} />
</Suspense>
```

**Why:** Improves perceived performance and allows dashboard to be usable while heavy queries run.

---

## Issue 9: Device Secret Management UI

### Problem
- Device secrets need to be:
  - Generated securely
  - Displayed once (never again)
  - Rotatable
  - Not exposed in client-side code

### Solution: Server-Side Generation + One-Time Display
```typescript
// app/api/devices/route.ts (POST)
export async function POST(req: Request) {
  const deviceSecret = generateSecureToken(32);
  
  // Store hashed version (optional)
  const hashedSecret = await hashSecret(deviceSecret);
  
  // Create device
  const device = await createDevice({ secret: hashedSecret });
  
  // Return secret ONLY on creation (never again)
  return Response.json({ 
    device: { id: device.id },
    secret: deviceSecret, // Show this once in UI
    warning: "Save this secret now. It won't be shown again."
  });
}
```

**Why:** Security best practice - secrets should only be visible once at creation time.

---

## Issue 10: Email Link Expiration Handling

### Problem
- Expired tokens show confusing errors
- Users may need to request new links
- No clear path for recovery

### Solution: Friendly Error Page + Recovery Flow
```typescript
// app/apply/complete/page.tsx
if (application.token_expires_at < new Date()) {
  return (
    <ExpiredTokenPage 
      applicationId={application.id}
      onRequestNewLink={handleRequestNewLink}
    />
  );
}

// Request new link functionality
async function handleRequestNewLink(applicationId: string) {
  // Generate new token, extend expiration
  // Send new email
  // Show success message
}
```

**Why:** Better UX than generic 404 or error pages.

---

## Issue 11: RLS Policy Testing

### Problem
- RLS policies are hard to test
- Policies can break silently
- Need to verify access control works

### Solution: Test Utilities + Documentation
```typescript
// lib/test/rls-helpers.ts
export async function testRLSPolicy(
  policyName: string,
  userId: string,
  operation: 'select' | 'insert' | 'update' | 'delete',
  testData: any
) {
  // Create test session
  // Attempt operation
  // Verify result matches expected
  // Log results
}
```

**Why:** Automated testing prevents security regressions.

---

## Issue 12: vCard Download Browser Compatibility

### Problem
- vCard generation needs to work across browsers
- Some browsers may block downloads
- File naming conventions vary

### Solution: Robust Client-Side Generation
```typescript
// components/card/VCardDownload.tsx
function downloadVCard(profile: UserProfile) {
  const vcard = generateVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${profile.first_name}_${profile.last_name}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

**Why:** Works across modern browsers and handles cleanup properly.

---

## Summary of Critical Fixes

1. **Use route groups** to separate public, dashboard, and org layouts
2. **Validate UUIDs** in dynamic routes to prevent conflicts
3. **Implement middleware** for centralized auth checks
4. **Progressive loading** for analytics and heavy data
5. **One-time secret display** for device provisioning
6. **Friendly error pages** for expired tokens
7. **Mobile-first responsive design** for all pages
8. **Separate navigation** for user vs org dashboards
9. **Conditional auth flows** for application completion
10. **RLS policy testing** to prevent security issues

---

## Implementation Priority

1. **High Priority:** Route groups, UUID validation, middleware
2. **Medium Priority:** Progressive loading, error handling, mobile design
3. **Low Priority:** RLS testing utilities, advanced optimizations

