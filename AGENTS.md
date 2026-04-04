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
- Patient portal: signup, login, appointments, profile, notifications, orders, messages
- Doctor portal: appointment management, patient list, availability/schedule, messages, dashboard overview
- Staff portal: appointments, assigned patients, messages, profile, dashboard overview — complete
- Admin portal: users, doctors, patients, staff, payments, branches, campaigns, leads, traffic analytics, audit logs, business profile
- E-commerce: product catalog, categories, cart, checkout (Stripe), orders — web + dashboard
- Payments: Stripe (appointments + orders), manual — full integration with refund management
- Notifications: email, SMS, WhatsApp, push (multi-channel) — auth events wired; care events have templates but not all are triggered yet
- Chat/messaging: patient ↔ doctor conversations with attachments
- Media: Cloudinary uploads (avatars, documents, prescriptions, products)
- Multi-branch: manage multiple clinic locations with hours
- MFA: email / SMS / WhatsApp / Auth App OTP
- OAuth: Google login
- Audit logs: all admin/doctor/staff actions tracked
- Dashboard overviews: admin, doctor, staff, patient — all implemented

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

## Remaining Work (Non-ABA)

These items are confirmed in scope and not yet complete. Work on these before any ABA clinical features.

### 1. E-Commerce Gaps

- **Stock decrement on order** — `OrderService.checkout()` validates `stockCount` but never decrements it. Decrement each product's `stockCount` inside the checkout transaction using `product.update({ data: { stockCount: { decrement: item.quantity } } })` for both authenticated and guest checkout paths. Also decrement in `createManualOrder`.
- **PayPal checkout** — `paymentProvider: "paypal"` is accepted by the checkout schema and form but no PayPal code exists in `PaymentService`. Implement `createPaypalOrder` and `capturePaypalOrder` using the PayPal Orders API. The checkout response for PayPal needs a `paymentSession` so the client can redirect the user to PayPal approval. Wire the PayPal webhook for capture confirmation.
- **Low-stock alerts** — When `stockCount` drops to a configurable threshold (e.g., ≤5) after an order, send an `orderStatus` notification to admin/staff. Can be checked in the cleanup/scheduler service on a daily cron.

### 2. Notification Events — Wire Templates to Backend Events

Templates exist in `packages/templates` for every purpose listed below, but the server services never call `NotificationService.sendNotification()` for these events. Each must be wired to fire when the event occurs.

| Purpose | Template | Where to wire |
|---|---|---|
| `appointmentStatus` | `AppointmentStatus` | `AppointmentService.updateAppointment()` on status change |
| `appointmentReminder` | `AppointmentReminder` | Scheduled job — 24h and 1h before scheduled start |
| `newChatMessage` | `NewChatMessage` | `ChatService` when a message is saved |
| `orderStatus` | `OrderStatus` | `OrderService.checkout()` (confirmation) and `updateOrderStatus()` |
| `refundStatus` | `RefundStatus` | `PaymentService` when a refund is processed |
| `paymentStatus` | `PaymentStatus` | `PaymentService` when an order payment succeeds or fails |

ABA-specific purposes (`sessionNoteAdded`, `treatmentPlanUpdated`, `authorizationAlert`) have no templates yet — wire those when building ABA features.

### 3. Scheduled Jobs (server/src/modules/scheduler/)

Add these cron jobs alongside the existing OTP and session cleanup jobs in `CleanupService`:

| Job | Schedule | What it does |
|---|---|---|
| Appointment reminder | Daily at 7 AM | Send `appointmentReminder` notification for appointments starting in ~24h and ~1h |
| No-show marking | Every hour | Auto-mark past appointments as `noShow` if still in `confirmed` status and start time has passed by >30 min |
| Low-stock alert | Daily at 8 AM | Find products with `stockCount ≤ 5` and `status: active`, notify admin/staff |
| Soft-delete purge | Daily at 2 AM | Permanently delete soft-deleted records older than 30 days (see below) |

### 4. Soft-Delete Cleanup + Dashboard Deleted Filter

**Permanent purge job** — These models use `deletedAt DateTime?`. After 30 days, permanently delete them in the nightly cron:
- `User` — purge deleted users and cascade (profiles, sessions, media)
- `Media` — purge deleted media records (also remove from Cloudinary)
- `Branch` — purge deleted branches
- `Product` — purge deleted products
- `ProductCategory` — purge deleted categories
- `ContactMessage` — purge deleted contact messages
- `NewsletterSubscriber` — purge deleted subscriber records

**Dashboard deleted filter** — All list pages that manage soft-deletable models should support a `showDeleted` filter tab (e.g., "Active" / "Deleted"). Deleted records show in a muted state with a "Restore" action instead of "Edit/Delete". The server query must accept `includeDeleted: boolean` and use `deletedAt: showDeleted ? { not: null } : null`. Apply to: Users, Branches, Products, Categories, Contact Messages, Newsletter Subscribers.

### 5. Chat / Conversation UX

The chat system (patient ↔ doctor conversations with attachments) works functionally but the UX needs improvement in both `apps/web` and `apps/dashboard`:

- **Message grouping** — Group consecutive messages from the same sender visually (no repeated avatar/name on every bubble)
- **Read receipts** — Show "seen" indicators on messages (field exists on `Message` model)
- **Typing indicator** — Optimistic UI while the other party is composing (can use polling or SSE)
- **Attachment preview** — Inline image previews in the chat thread instead of download links only
- **Empty states** — Meaningful empty state when no conversations exist or a conversation has no messages
- **Unread badge** — Unread message count visible on the messages nav item
- **Conversation list** — Show last message preview, timestamp, and unread count in the conversation sidebar
- **Auto-scroll** — Scroll to bottom on new messages; show "scroll to latest" button when scrolled up

### 6. Dashboard List Page Filters — More Professional

Current list pages have basic search inputs. Upgrade to a consistent, reusable filter bar pattern:

- Combine search, status filter, date range, and sort controls into a single collapsible `FilterBar` component in `packages/ui`
- Status filter should use pill/tab selectors (not a raw `<select>`)
- Date range filter with a calendar popover
- Active filter count badge on the "Filters" button when any non-default filter is applied
- Clear-all filters button
- Filters should persist in the URL query string so they survive page refresh and are shareable
- Apply consistently across: Orders, Products, Appointments, Payments, Users, Patients, Doctors, Staff, Audit Logs, Campaigns

### 7. Dashboard Detail Page Actions — Cleaner

Detail pages currently show many individual buttons in a row. Replace with:

- A primary action button for the most common action (e.g., "Edit")
- A `DropdownMenu` (three-dot or "Actions" button) for secondary actions: delete, restore, change status, export, etc.
- Destructive actions (delete, cancel, deactivate) must require a confirmation dialog before executing
- Status-change actions should be context-aware — only show valid next states (e.g., an order in `shipped` state should only offer `delivered` or `cancelled`, not `pending`)
- Apply consistently across: Order detail, Product detail, Patient detail, Doctor detail, User detail, Appointment detail, Payment detail

### 8. apps/web — Content Gaps (vs readysetandgoaba.com)

The real client site at `readysetandgoaba.com` has pages and content not yet reflected in `apps/web`:

- **Refer a Client page** (`/refer`) — A form for healthcare providers or families to refer a new patient. Submits to the lead system (maps to `ContactMessage` with a `referral` subject type or a dedicated referral model).
- **Careers / Employment page** (`/careers`) — Static page listing open positions at the practice. Can start as a static content page; job listings can be admin-managed later.
- **Insurance page** (`/insurance`) — Information about accepted insurance providers and the authorization process. Static content, no backend required initially.
- **Services page enrichment** — Current services page is generic. The real site lists three therapy modalities: In-Home ABA, Center-Based ABA, and Virtual ABA. Each should have its own section with description, benefits, and a CTA. Also add: Social Skills Training and Family Support as distinct service types.
- **Homepage stats** — The real site shows stats (years of experience, patients served, etc.) as `0+` placeholders. Wire these to real aggregate data from the API (`/public/stats` endpoint returning appointment/patient counts) or make them admin-configurable in business profile settings.
- **Testimonials** — The homepage references parent testimonials. Add a testimonials section to the home page; testimonials can be hardcoded initially or admin-managed via a new `Testimonial` model.

## Production Checklist (Server)

All core production items are now complete:

- ✅ `@nestjs/throttler` — rate limiting wired in `app.module.ts`
- ✅ `helmet` — HTTP security headers in `main.ts`
- ✅ `trust proxy` — set in `main.ts`
- ✅ `DashboardModule` — wired in `app.module.ts`
- ✅ `DashboardService` — all four overviews implemented (admin, doctor, staff, patient)
- ✅ `server/.env.example` — header updated to "care-sync Server"
- ✅ `staff` role — `ClientService.assertRoleAccess` correctly allows staff on dashboard
- ✅ Staff portal — full route group `/(staff)` with appointments, patients, messages, profile, dashboard

## Quality Bar

- Favor extraction, naming clarity, and strong boundaries over quick inline code.
- Prefer professional, reusable solutions over one-off route hacks.
- When unsure where code belongs, choose the most reusable package that matches its responsibility without forcing app-specific code into shared packages.
