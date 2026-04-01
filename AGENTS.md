<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: care-sync

**care-sync** is a production healthcare management platform for doctors, patients, and administrators. It handles appointment scheduling, medical commerce (products/orders), multi-channel notifications, payment processing (Stripe/PayPal), chat/messaging, campaign management, and business/branch configuration.

## Roles & Apps

Three roles: `admin`, `patient`, `doctor`.

Two frontend apps:
- `apps/web` — patient-facing (signup, appointments, orders, chat). Only `patient` role can access.
- `apps/dashboard` — admin/doctor portal (schedule, analytics, business config, moderation). `admin` and `doctor` roles only.

Role isolation is enforced server-side via `ClientService.assertRoleAccess` (tied to request origin), and the `@Roles()` decorator on individual endpoints.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo 2.9.1, pnpm 10 |
| Server | NestJS 11, Node 24 |
| Database | PostgreSQL + Prisma 7.6 |
| ORM IDs | ULID (not UUID) |
| Frontend | Next.js 16, React 19 |
| Auth | JWT (jose), argon2, httpOnly cookies, sessions in DB |
| MFA | Email / SMS / WhatsApp / AuthApp OTP |
| OAuth | Google (Passport) |
| Media | Cloudinary |
| Payments | Stripe, PayPal, manual |
| SMS/WhatsApp | Twilio |
| Push | Firebase FCM + Expo |
| Email | SMTP (Nodemailer) + React Email templates |
| Cache | Redis (Keyv) |
| Cron | @nestjs/schedule |
| Geolocation | IPStack API |
| Validation | Zod (server + contracts) |

## Monorepo Architecture Rules

### Package Boundaries

- `apps/web` and `apps/dashboard` should stay thin. They compose packages and feature pages, but should not become the main home for shared infrastructure.
- `packages/contracts` is the single source of truth for shared enums, DTOs, validation schemas, request/response types, and app-level shared types.
- `packages/sdk` is the client-side API boundary. Prefer adding or updating SDK helpers here instead of calling `fetch` or `axios` directly from app code.
- `packages/ui` is the home for reusable UI primitives, shared providers, reusable hooks, generic CRUD building blocks, shared media components, and cross-app form helpers.
- `packages/shared` is for framework-agnostic constants and utilities.
- `packages/templates` is for email or notification templates, not general UI.
- `packages/db` owns Prisma and database-facing shared code. All models use ULID primary keys.
- `server` owns business logic, data access orchestration, auth rules, side effects, and module wiring.

### Preferred Feature Flow

When building a feature that spans the stack, prefer this order:

1. Update `packages/contracts` first (Zod schemas, DTOs, types).
2. Add or update the matching `packages/sdk` functions.
3. Implement or extend the `server` module/controller/service.
4. Extract reusable UI/hooks/providers into `packages/ui` when they are generic.
5. Keep app pages focused on composition and route-specific behavior.

### Reuse Before Duplicating

- If logic or UI is useful across multiple dashboard screens, move it into `packages/ui`.
- If a type is shared between server and frontend, it belongs in `packages/contracts`.
- If a utility does not depend on React, Next.js, or NestJS, prefer `packages/shared`.
- If a pattern already exists, extend it instead of creating a second custom version.

## Dashboard and Web Conventions

- Prefer shared building blocks such as provider wrappers, shared hooks, generic tables, generic forms, generic detail pages, search toolbars, media helpers, and skeletons before creating page-local alternatives.
- Route files should primarily assemble data hooks, shared UI, and route-specific config.
- Keep app-specific components in the app only when they are truly route- or domain-specific.

## Server Conventions

- Follow the Nest module pattern consistently: `module`, `controller`, `service`.
- Keep validation and shared API shapes aligned with `packages/contracts`.
- Do not put direct database logic in controllers.
- Global concerns such as auth, logging, env validation, caching, interceptors, and exception handling stay in `server/src/lib/`.
- All routes are protected by the global `AuthGuard` by default. Use `@Public()` only for truly unauthenticated endpoints.
- Use `@Roles()` decorator to restrict endpoints beyond the global auth check.
- Soft-delete models use `deletedAt DateTime?`. Always filter `deletedAt: null` in queries on soft-deletable models (User, Media, Branch, ContactMessage, NewsletterSubscriber).
- IDs are ULIDs. Never assume UUID format.
- All money fields use `Decimal @db.Decimal(10, 2)`. Never use `Float` for currency.

## Auth & Security Rules

- Passwords hashed with argon2. Never store plain text.
- Refresh tokens stored as argon2 hashes in the `Session` table (not the raw token).
- JWT cookies: `httpOnly`, `secure` (prod), `sameSite: strict`.
- JWT payload includes: `sub` (userId), `sid` (sessionId), `rol` (role), `sts` (status), `aud` (client app).
- `aud` is validated against the requesting client app on every token verification.
- OTP: 6-digit numeric (`crypto.randomInt`) or 64-char hex secure token (`crypto.randomBytes(32)`). Never use `Math.random()`.
- Never expose passwords in response objects. `userView.omit: { password: true }` is the standard.
- Rate limiting and `helmet` headers must be added before any public deployment (not yet wired — see production checklist below).

## Production Checklist (Server)

These items are **not yet implemented** and are required before production:

- [ ] Add `@nestjs/throttler` for rate limiting (especially auth + OTP endpoints)
- [ ] Add `helmet` for HTTP security headers
- [ ] Add `trust proxy` setting in main.ts for correct IP resolution behind load balancers
- [ ] Wire `DashboardModule` into `app.module.ts` (currently missing)
- [ ] Implement `DashboardService.getOverview()` (stub — returns nothing)
- [ ] Update `server/.env.example` header (still says "Mi MedCare Server")

## Quality Bar

- Favor extraction, naming clarity, and strong boundaries over quick inline code.
- Prefer professional, reusable solutions over one-off route hacks.
- When unsure where code belongs, choose the most reusable package that matches its responsibility without forcing app-specific code into shared packages.
