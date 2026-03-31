# syntax=docker/dockerfile:1.7

# ---------- BASE ----------
FROM node:24-alpine AS base
WORKDIR /app

ENV TURBO_TELEMETRY_DISABLED=1

# Enable pnpm via Corepack and pin version
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# ---------- PRUNE ----------
FROM base AS pruner
WORKDIR /app

COPY . .

# Use local turbo version for consistent behavior
RUN pnpm dlx turbo@2.8.13 prune server --docker

# ---------- INSTALL ----------
FROM base AS installer
WORKDIR /app

# Copy dependency graph and lockfile
COPY --from=pruner /app/out/json/ .  
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Use BuildKit cache for pnpm store
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm fetch

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline

# Copy pruned full source
COPY --from=pruner /app/out/full/ .

# ---------- BUILD ----------
FROM installer AS builder
WORKDIR /app

# Build only the server
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN pnpm build:server -- --concurrency=1

# ---------- RUNNER ----------
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ca-certificates

ENV TURBO_TELEMETRY_DISABLED=1

# The Cloud Run migration Job runs `pnpm ...`, so pnpm must exist in the runtime image.
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

ENV NODE_ENV=production
ENV PORT=8080

# Copy metadata and built server
COPY --from=builder /app/package.json ./package.json    
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/turbo.json ./turbo.json

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/package.json ./server/package.json

# Copy dependencies and workspace packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/packages ./packages

EXPOSE 8080

CMD ["node", "server/dist/main.js"]
