# Treelink

Digital business cards with NFC-powered application workflows.

## Features

- **Public Digital Cards**: Linktree-style mobile-friendly profile pages
- **Owner Claim Flow**: Token-based claiming with magic link authentication
- **NFC Workflow**: Scan-to-application flow for organizations
- **Organization Dashboard**: Manage devices, view applications, and analytics
- **ImageKit Integration**: Avatar and logo storage
- **Clean Design**: Mint green theme with white backgrounds

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- ImageKit.io (Image storage)
- Tailwind CSS 4
- Lucide React (Icons)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server-side operations)
- `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint
- `IMAGEKIT_PUBLIC_KEY` - ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private key
- `NEXT_PUBLIC_APP_URL` - Your app URL (e.g., http://localhost:3000)

### 3. Database Setup

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the migration file: `database/migrations/001_initial_schema.sql`
4. Verify RLS policies are enabled

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [card_uuid]/       # Public card pages
│   ├── dashboard/         # User dashboard
│   ├── org/               # Organization dashboards
│   ├── apply/             # Application completion
│   ├── signin/            # Claim flow
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── card/             # Card display components
│   ├── auth/             # Authentication
│   ├── dashboard/        # Dashboard components
│   ├── org/             # Organization components
│   └── apply/           # Application components
├── lib/                  # Utilities and helpers
│   ├── supabase/        # Supabase clients
│   ├── imagekit/        # ImageKit integration
│   ├── auth/            # Auth helpers
│   ├── db/              # Database queries
│   └── utils/           # Utility functions
└── types/               # TypeScript types
```

## Key Features

### Public Card Pages
- Accessible at `/{card_uuid}`
- Mobile-first responsive design
- Social links (LinkedIn, Instagram, GitHub, Website)
- vCard download
- Avatar display

### Owner Claim Flow
1. User receives signup token link
2. Visits `/signin/[token]`
3. Enters email, receives magic link
4. Completes authentication
5. Card is linked to their account
6. Redirected to dashboard

### NFC Workflow
1. Organization provisions NFC reader device
2. Device scans card with `card_uuid`
3. POST to `/api/nfc/scan` with device credentials
4. Application record created
5. User receives email with completion link
6. User completes application
7. Organization views in dashboard

### Organization Dashboard
- Overview with key metrics
- Applications list with filters
- Device management
- Analytics dashboard
- Campaign/application type management

## API Endpoints

### Public
- `GET /[card_uuid]` - Public card page
- `POST /api/nfc/scan` - NFC scan endpoint (device auth)
- `GET /apply/complete?token=...` - Application completion page

### Authenticated (User)
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /dashboard` - User dashboard

### Authenticated (Organization)
- `GET /api/organizations` - List user's orgs
- `POST /api/organizations` - Create org
- `GET /api/devices?organization_id=...` - List devices
- `POST /api/devices` - Create device
- `GET /api/applications?organization_id=...` - List applications
- `GET /api/analytics?organization_id=...` - Get analytics

## Security

- Row Level Security (RLS) policies on all tables
- Device authentication via Bearer tokens
- Magic link authentication for users
- Token-based application completion
- Service key used only for device endpoints

## Development

### Adding New Features

1. Create database migration if needed
2. Add TypeScript types in `src/types/database.ts`
3. Create API routes in `src/app/api/`
4. Build UI components in `src/components/`
5. Create pages in `src/app/`

### Testing

- Test public card pages with valid UUIDs
- Test claim flow with signup tokens
- Test NFC scan endpoint with device secrets
- Test organization dashboard access
- Verify RLS policies work correctly

## Deployment

1. Set environment variables in your hosting platform
2. Run database migrations in Supabase
3. Build and deploy:
   ```bash
   npm run build
   npm start
   ```

## License

MIT
