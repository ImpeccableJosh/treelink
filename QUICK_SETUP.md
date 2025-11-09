# Quick Setup Guide

## ✅ Step 1: Dependencies Installed
Dependencies are now installed! You can proceed to setup.

## 🚀 Quick Start (5 minutes)

### 1. Create `.env.local`
```bash
cp .env.example .env.local
```

### 2. Get Supabase Credentials
1. Go to [supabase.com](https://supabase.com) → Create project
2. Settings → API → Copy:
   - URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Get ImageKit Credentials
1. Go to [imagekit.io](https://imagekit.io) → Sign up
2. Developer Options → Copy:
   - URL Endpoint → `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
   - Public Key → `IMAGEKIT_PUBLIC_KEY`
   - Private Key → `IMAGEKIT_PRIVATE_KEY`

### 4. Set App URL
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Database Migration
1. Supabase → SQL Editor
2. Copy/paste `database/migrations/001_initial_schema.sql`
3. Click Run

### 6. Create Test User
Run in Supabase SQL Editor:
```sql
INSERT INTO public.users (first_name, last_name, email, signup_token)
VALUES ('Test', 'User', 'test@example.com', 'test-token-12345');

SELECT card_uuid FROM public.users WHERE signup_token = 'test-token-12345';
```

### 7. Start Dev Server
```bash
npm run dev
```

### 8. Test It!
1. Visit: `http://localhost:3000/{card_uuid}` - View public card
2. Visit: `http://localhost:3000/signin/test-token-12345` - Claim card
3. Visit: `http://localhost:3000/signin` - General sign in
4. Visit: `http://localhost:3000/signin?redirect=/org/test-org` - Sign in with redirect

## 📋 Full Testing Guide
See `TESTING_GUIDE.md` for comprehensive testing steps.

## ⚠️ Note on Vulnerabilities
The `npm audit` showed some vulnerabilities. These are typically in dev dependencies and don't affect production. You can run:
```bash
npm audit fix
```
But be cautious as it may update dependencies.

