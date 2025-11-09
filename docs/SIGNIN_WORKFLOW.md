# Sign In Workflow with Redirects

## Overview

The sign-in system supports redirects to allow users to sign in and be automatically redirected to their intended destination (e.g., organization dashboard).

## Sign In Routes

### General Sign In
**URL:** `/signin?redirect=/org/test-org`

- Accepts optional `redirect` query parameter
- If user is already signed in, redirects immediately
- Sends magic link email
- After sign in, redirects to specified path or `/dashboard`

### Card Claim Sign In
**URL:** `/signin/{token}`

- Token-based claiming flow
- Links card to authenticated user
- Always redirects to `/dashboard` after claim

## Usage Examples

### Redirect to Organization Dashboard
```
/signin?redirect=/org/test-org
```

### Redirect to Applications Page
```
/signin?redirect=/org/test-org/applications
```

### Redirect to User Dashboard
```
/signin
```
(No redirect = goes to `/dashboard`)

## Implementation Details

### Sign In Form Component
- Accepts optional `token` (for card claiming)
- Accepts optional `redirectTo` (callback URL)
- Handles both general sign-in and card claiming

### Auth Callback Route
- Handles `token` parameter (for card claiming)
- Handles `redirect` parameter (for post-signin navigation)
- Validates redirect paths (must start with `/`)

### Protected Routes
- Organization pages check auth and redirect to signin with redirect param
- User dashboard checks auth and redirects to signin

## Security

- Redirect paths are validated to be relative (start with `/`)
- Prevents open redirect vulnerabilities
- Token-based claiming only works with valid signup tokens

## Testing

1. **Test general sign in:**
   ```
   Visit: /signin?redirect=/org/test-org
   Sign in → Should redirect to /org/test-org
   ```

2. **Test card claiming:**
   ```
   Visit: /signin/test-token-12345
   Sign in → Should link card and go to /dashboard
   ```

3. **Test protected route:**
   ```
   Visit: /org/test-org (while signed out)
   Should redirect to: /signin?redirect=/org/test-org
   After sign in → Should go to /org/test-org
   ```

