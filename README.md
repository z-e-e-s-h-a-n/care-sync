# care-sync

A production-oriented monorepo starter with:

- `apps/web` for the public Next.js app
- `apps/dashboard` for the internal/admin Next.js app
- `server` for the NestJS API
- `packages/contracts`, `packages/sdk`, `packages/ui`, `packages/templates`, and `packages/shared`
- `packages/db` for Prisma schema, migrations, seed data, and generated client exports

## Prerequisites

- Node.js `24+`
- `pnpm` `10+`
- PostgreSQL

Optional integrations:

- Cloudinary
- SMTP
- Google OAuth
- Facebook OAuth
- Firebase push notifications

## Local Setup

1. Install dependencies.

```bash
pnpm install
```

2. Copy `server/.env.example` to `server/.env` and fill in the values you need.

3. Create `apps/web/.env.local` and `apps/dashboard/.env.local`.

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_VAPID_KEY=""
# Optional
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""
```

4. Generate Prisma client and apply local migrations.

```bash
pnpm --filter @workspace/db prisma:generate
pnpm --filter @workspace/db prisma:migrate
pnpm --filter @workspace/db prisma:seed
```

5. Start the apps you need.

```bash
pnpm --filter server dev
pnpm --filter web dev
pnpm --filter dashboard dev
```

Default local endpoints:

- API: `http://localhost:4000`
- Website: `http://localhost:3000`
- Dashboard: `http://localhost:3001`

## Google OAuth notes

- Set `server/.env` values: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `CLIENT_ENDPOINT`, `ADMIN_ENDPOINT`.
- `GOOGLE_CALLBACK_URL` must match the Google Cloud Console “Authorized redirect URI” (e.g. `https://your-api.com/oauth/google/callback`).
- The frontend should start OAuth via `GET /oauth/google?redirectUrl=<app-origin>` (the SDK does this), and the server uses that `redirectUrl` to detect which client app is logging in.

## Useful Commands

```bash
pnpm check-types
pnpm lint
pnpm build
pnpm build:server
pnpm build:web
pnpm build:dashboard
pnpm prune:server
```

## Deployment Notes

- The template includes a root `Dockerfile` for packaging the NestJS server with `turbo prune`.
- `packages/db` owns Prisma schema, migrations, seed scripts, and typed exports.
- `apps/web` and `apps/dashboard` are ready to point at the API through `NEXT_PUBLIC_API_URL`.

## Package Highlights

- `@workspace/contracts` keeps DTOs and schemas aligned across server and frontend
- `@workspace/sdk` centralizes API client calls
- `@workspace/ui` holds shared design system primitives
- `@workspace/templates` contains email templates
- `@workspace/shared` keeps framework-agnostic utilities/constants
