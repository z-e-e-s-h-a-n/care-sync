<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Monorepo Architecture Rules

This starter is used as the base for production projects such as `mi-medcare` and `care-sync`. Keep changes aligned with the structure below so features stay reusable, maintainable, and consistent.

## Package Boundaries

- `apps/web` and `apps/dashboard` should stay thin. They compose packages and feature pages, but should not become the main home for shared infrastructure.
- `packages/contracts` is the single source of truth for shared enums, DTOs, validation schemas, request/response types, and app-level shared types.
- `packages/sdk` is the client-side API boundary. Prefer adding or updating SDK helpers here instead of calling `fetch` or `axios` directly from app code.
- `packages/ui` is the home for reusable UI primitives, shared providers, reusable hooks, generic CRUD building blocks, shared media components, and cross-app form helpers.
- `packages/shared` is for framework-agnostic constants and utilities.
- `packages/templates` is for email or notification templates, not general UI.
- `packages/db` owns Prisma and database-facing shared code.
- `server` owns business logic, data access orchestration, auth rules, side effects, and module wiring.

## Preferred Feature Flow

When building a feature that spans the stack, prefer this order:

1. Update `packages/contracts` first.
2. Add or update the matching `packages/sdk` functions.
3. Implement or extend the `server` module/controller/service.
4. Extract reusable UI/hooks/providers into `packages/ui` when they are generic.
5. Keep app pages focused on composition and route-specific behavior.

## Reuse Before Duplicating

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
- Global concerns such as auth, logging, env validation, caching, interceptors, and exception handling should stay in the established server infrastructure layers.

## Quality Bar

- Favor extraction, naming clarity, and strong boundaries over quick inline code.
- Prefer professional, reusable solutions over one-off route hacks.
- When unsure where code belongs, choose the most reusable package that matches its responsibility without forcing app-specific code into shared packages.
