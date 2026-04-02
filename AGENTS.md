<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: care-sync

**care-sync** is a production healthcare management platform built for **Ready Set and Go ABA** — an ABA (Applied Behavior Analysis) therapy practice. It handles appointment scheduling, e-commerce (products/orders), ABA clinical workflows, multi-channel notifications, payment processing (Stripe/PayPal), chat/messaging, campaign management, and business/branch configuration.

## Client Context

- **Client:** Ready Set and Go ABA (ABA therapy practice)
- **Reference platform:** Rethink Behavioral Health (rethinkbh.com) — UI/UX and feature reference. ABA clinical features from Rethink **are in scope** and should be added as thoroughly as possible. See ABA Clinical Features section.
- **Confirmed scope:** Full ABA clinical platform — appointments, e-commerce, staff management, clinical workflows, and patient mobile app.
- **Delivery order:** Web platform first (complete) → Patient mobile app second

## Roles & Apps

Four roles: `admin`, `staff`, `doctor`, `patient`.

### Web Apps (Current Phase)

- `apps/web` — Public-facing marketing site + patient portal.
  - Public pages: home, about, services, doctors, shop, resources, contact (no auth required)
  - Patient portal (`/patient/*`): appointments, profile, orders, notifications, messages — `patient` role only
  - Patients can **browse and purchase** products from the shop. They cannot manage products or orders.
- `apps/dashboard` — Internal portal for `admin`, `doctor`, and `staff` roles. All three share one Next.js app, separated by route groups:
  - `/(admin)` — admin-only pages (users, payments, analytics, business config, audit logs)
  - `/(doctor)` — doctor-only pages (appointments, patients, availability, session notes, caseload)
  - `/(staff)` — staff-only pages (assigned patients, appointments, session notes, order status updates)
  - `/(shared)` — pages accessible to all internal roles (account, notifications, messages)
  - All three internal roles (admin, doctor, staff) can manage products, inventory, and orders.

### Mobile App (Future Phase — after web is complete)

- `apps/mobile` — Single Expo React Native app for **patients only**.
  - Public screens: marketing/info pages before login
  - Authenticated screens: patient portal (appointments, profile, orders, messages, notifications)
  - Shared on iOS (App Store) and Android (Play Store)
  - Admin, doctor, and staff always use the web dashboard — no mobile portal needed for them.

Role isolation is enforced server-side via `ClientService.assertRoleAccess` (tied to request origin), and the `@Roles()` decorator on individual endpoints.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo 2.9.1, pnpm 10 |
| Server | NestJS 11, Node 24 |
| Database | PostgreSQL + Prisma 7.6 |
| ORM IDs | ULID (not UUID) |
| Frontend (Web) | Next.js 16, React 19 |
| Frontend (Mobile) | Expo (React Native) — future phase |
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

## Feature Scope

### Already Built

- **apps/web public site:** home, about, services, doctors, resources, contact pages — complete
- Patient portal: signup, login, appointments, profile, notifications
- Doctor portal: appointment management, patient list, availability/schedule, messages
- Admin portal: users, doctors, patients, payments, branches, campaigns, leads, traffic analytics, audit logs, business profile
- Payments: Stripe, PayPal, manual — full integration with refund management
- Notifications: email, SMS, WhatsApp, push (multi-channel)
- Chat/messaging: patient ↔ doctor conversations with attachments
- Media: Cloudinary uploads (avatars, documents, prescriptions)
- Multi-branch: manage multiple clinic locations with hours
- MFA: email / SMS / WhatsApp / Auth App OTP
- OAuth: Google login
- Audit logs: all admin/doctor actions tracked

### In Progress / Next — Staff Role & Portal

A fourth internal role (`staff`) for therapists, front-desk, BCBAs, and support staff.

- Staff log in via `apps/dashboard` — same app as admin and doctor, route group `/(staff)/`
- Staff can: view and manage appointments, view assigned patients, record session notes, send messages, view and update product order status
- Staff cannot: access admin-only settings, financial/payment data, system configuration, or analytics
- `UserRole` enum must include `staff`
- All server endpoints must handle `@Roles('staff')` where appropriate
- `ClientService.assertRoleAccess` must recognize `staff` as a valid dashboard role
- Staff are assigned to patients and appointments by admin or doctor

### In Scope — E-Commerce (Products, Cart, Orders)

Patients browse and purchase from the shop on `apps/web`. Admin, doctor, and staff manage the catalog and orders from `apps/dashboard`.

**Patient-facing (apps/web):**
- `/shop` — public product catalog (browse without login)
- `/patient/orders` — order history (login required)
- Cart and checkout flow with Stripe / PayPal
- Order confirmation email on purchase

**Dashboard management (apps/dashboard — admin, doctor, staff):**
- Product catalog CRUD: name, description, price, images, category, stock count, active/inactive
- Order management: view all orders, update status (pending → processing → shipped → delivered)
- Inventory tracking: stock counts, low-stock alerts
- Both delivery and pickup options supported
- Client will provide the product listing

**Rules:**
- All product prices use `Decimal @db.Decimal(10, 2)` — never Float
- Product images stored via Cloudinary (`MediaType: product`)
- `NotificationPurpose` already includes `orderStatus` and `refundStatus` — wire these for order updates

### In Scope — ABA Clinical Features (Rethink-inspired)

The client confirmed: add as many clinical features as possible, modeled after Rethink Behavioral Health. These are core to the platform — not optional extras.

#### Behavior Programs
- Create individualized behavior intervention plans (BIP) per patient
- Programs have targets: skill acquisition goals and behavior reduction goals
- Each target has a status (active, mastered, discontinued), baseline data, and phase lines

#### Session Notes
- Therapists (staff/doctor) record structured notes after each therapy session
- Notes include: date, duration, therapist, patient, goals addressed, client behavior summary, next steps
- Session notes are linked to the patient's treatment plan

#### Goal Tracking
- Track progress toward each target across sessions over time
- Visual progress data (percentage correct, frequency counts, duration)
- Mastery criteria per target — auto-flag when met

#### Data Collection
- Record trial-by-trial data during or after therapy sessions
- Supports discrete trial, interval recording, and frequency/rate data types
- Data stored per session and aggregated for graphing

#### Progress Reports
- Generate PDF-style progress reports per patient for a date range
- Reports show goal status, trend graphs, session attendance, and therapist notes
- Intended for parents and insurance/funding bodies

#### Staff Caseload Management
- Assign patients to specific therapists (staff members)
- View each staff member's caseload — number of patients, hours, session frequency
- Admin and doctor can reassign patients between staff

#### Parent/Caregiver Access
- Parents can log in to view their child's progress: goals, session notes, progress reports
- Parents have read-only access — they cannot edit clinical data
- This is a sub-role or permission flag on the `patient` role, not a separate role
- Parent access is managed per patient from the admin/doctor portal

#### Insurance Authorization Tracking
- Track authorized therapy hours per patient per insurance authorization period
- Fields: authorization number, start/end date, approved hours, used hours, remaining hours
- Alerts when a patient is approaching their authorized limit
- Linked to session records to auto-decrement used hours

### Not in Scope

- CPT code generation / insurance billing submission (possible future phase)
- Telehealth video integration (future)
- Custom mobile apps for doctors/staff (web dashboard is sufficient per client)

## Monorepo Architecture Rules

### Package Boundaries

- `apps/web` and `apps/dashboard` should stay thin. They compose packages and feature pages, but should not become the main home for shared infrastructure.
- `apps/mobile` (future) will share `packages/contracts`, `packages/sdk`, and `packages/shared`. UI components will be mobile-specific — do not force web UI into mobile.
- `packages/contracts` is the single source of truth for shared enums, DTOs, validation schemas, request/response types, and app-level shared types.
- `packages/sdk` is the client-side API boundary. Prefer adding or updating SDK helpers here instead of calling `fetch` or `axios` directly from app code.
- `packages/ui` is the home for reusable UI primitives, shared providers, reusable hooks, generic CRUD building blocks, shared media components, and cross-app form helpers. Web only — not for mobile.
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
- Dashboard role route groups `(admin)`, `(doctor)`, `(staff)`, `(shared)` must each have their own layout that enforces the correct role. Never mix role-specific logic across groups.

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
- [ ] Add `staff` to `ClientService.assertRoleAccess` for dashboard client
- [ ] Wire staff role into all relevant server guards and role checks

## Quality Bar

- Favor extraction, naming clarity, and strong boundaries over quick inline code.
- Prefer professional, reusable solutions over one-off route hacks.
- When unsure where code belongs, choose the most reusable package that matches its responsibility without forcing app-specific code into shared packages.
