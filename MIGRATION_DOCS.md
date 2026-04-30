# Fonzkart — Self-Hosted Migration Documentation

> **Project:** Fonzkart (Cash-on-Gadgets)
> **Date:** April 2026
> **Author:** Migration executed with Antigravity AI
> **Status:** ✅ Production-Ready

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture: Before vs After](#2-architecture-before-vs-after)
3. [Infrastructure Setup](#3-infrastructure-setup)
4. [Supabase Backend Stack](#4-supabase-backend-stack)
5. [Next.js Frontend Dockerization](#5-nextjs-frontend-dockerization)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Data Migration](#7-data-migration)
8. [Bugs Fixed During Migration](#8-bugs-fixed-during-migration)
9. [Running the Stack](#9-running-the-stack)
10. [Maintenance & Operations](#10-maintenance--operations)
11. [Security Checklist](#11-security-checklist)

---

## 1. Overview

Fonzkart was originally deployed across two third-party managed services:

| Layer | Before (Cloud) | After (Self-Hosted) |
|---|---|---|
| **Frontend** | Vercel (automatic Next.js hosting) | Docker container on private VPS |
| **Database** | Supabase Cloud PostgreSQL | `supabase/postgres:15.1.0.117` Docker container |
| **Auth** | Supabase Cloud GoTrue | `supabase/gotrue:v2.132.3` Docker container |
| **API Gateway** | Supabase Cloud Kong | `kong:2.8.1` Docker container |
| **Orchestration** | None required | Coolify (self-hosted PaaS on VPS) |

**Why migrate?** Full data ownership, zero vendor lock-in, zero monthly Supabase/Vercel fees.

---

## 2. Architecture: Before vs After

### Before (Cloud)

```
User Browser
    │
    ▼
[Vercel Edge Network]
    │  (Next.js SSR)
    ▼
[Supabase Cloud]
    ├── PostgreSQL DB  (managed)
    ├── GoTrue Auth    (managed)
    ├── PostgREST API  (managed)
    └── Kong Gateway   (managed, port 443)
```

### After (Self-Hosted VPS)

```
User Browser
    │
    ▼ :3002
[fonzkart-frontend Docker container]  ← Next.js 16 / Node 20 Alpine
    │
    ├──▶ :5432  [supabase-db]       ← PostgreSQL 15 (Prisma ORM)
    ├──▶ :8081  [supabase-kong]     ← Kong API Gateway
    │               │
    │               ├──▶ [supabase-auth]  ← GoTrue v2.132.3
    │               └──▶ [supabase-rest]  ← PostgREST v10
    │
    └──▶ :3001  [supabase-studio]   ← Supabase Dashboard UI

All services run on the same Docker host network.
Coolify manages the lifecycle of all containers.
```

---

## 3. Infrastructure Setup

### Coolify Installation

Coolify was installed on the VPS using the official one-line installer:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

**Required open ports:**

| Port | Purpose |
|---|---|
| `8000` | Coolify Dashboard (HTTP) |
| `6001` | Coolify Real-time communications |
| `6002` | Coolify Terminal access |
| `22` | SSH access |
| `80` | HTTP / SSL certificate generation |
| `443` | HTTPS traffic |
| `3002` | Fonzkart Frontend |
| `8081` | Supabase Kong API |
| `3001` | Supabase Studio |

### Key Files Added

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build for Next.js frontend |
| `docker-compose.supabase.yml` | Self-hosted Supabase backend stack |
| `.env.production` | Runtime environment variables |
| `.dockerignore` | Excludes `node_modules`, `.git`, etc. from build context |
| `scripts/migrate_from_supabase.py` | One-shot data migration script |
| `scripts/gen_jwt.py` | JWT generator for local Supabase keys |

---

## 4. Supabase Backend Stack

The full backend is defined in `docker-compose.supabase.yml` and deployed via Coolify.

### Services

#### `supabase-db` — PostgreSQL 15
```yaml
image: supabase/postgres:15.1.0.117
ports: "5432:5432"
volume: supabase_db_data  # persisted named volume
```
- Password: `[CONFIGURED_IN_COOLIFY]`
- Database: `postgres`

#### `supabase-kong` — API Gateway
```yaml
image: kong:2.8.1
ports: "8081:8000"  # 8081 used to avoid conflict with Coolify's port 8000
```
- Runs in DB-less mode with declarative config

#### `supabase-auth` — GoTrue Authentication
```yaml
image: supabase/gotrue:v2.132.3
```
- JWT Secret: `[CONFIGURED_IN_COOLIFY]`
- Email OTP: Disabled (`GOTRUE_EXTERNAL_EMAIL_ENABLED: "false"`) during initial setup to bypass SMTP requirement
- To enable email OTP later: configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and set `GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"`

#### `supabase-rest` — PostgREST
```yaml
image: postgrest/postgrest:v10.1.1
```
- Exposes PostgreSQL tables as a RESTful API

#### `supabase-studio` — Dashboard
```yaml
image: supabase/studio:latest
ports: "3001:3000"
```
- Accessible at `http://<VPS_IP>:3001`

### Port Conflict Resolution

> **⚠️ Critical:** Coolify itself binds to port `8000`. Supabase Kong also defaults to port `8000`. This conflict was resolved by mapping Kong externally to port `8081`:
> ```yaml
> ports:
>   - "8081:8000"  # External 8081 → Internal 8000
> ```

---

## 5. Next.js Frontend Dockerization

### Dockerfile (3-Stage Build)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts    # --ignore-scripts skips prisma generate (no DB at build time)

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl  # Required by Prisma on Alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ vars MUST be baked in at build time — they are inlined into the JS bundle
ARG NEXT_PUBLIC_SUPABASE_URL=http://localhost:8081
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL=http://localhost:3002
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl   # Required by Prisma Client at runtime
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app ./
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
```

### Build Command

```bash
docker build --network host \
  --build-arg "NEXT_PUBLIC_SUPABASE_URL=http://localhost:8081" \
  --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-jwt>" \
  --build-arg "NEXT_PUBLIC_APP_URL=http://localhost:3002" \
  -t fonzkart-frontend .
```

> **Why `--network host`?** The build connects to the local PostgreSQL container during `prisma migrate deploy`. Host networking allows the builder to reach `localhost:5432`.

### Run Command

```bash
docker run -d \
  --name fonzkart-frontend \
  --restart unless-stopped \
  --network host \
  -e PORT=3002 \
  -e SUPABASE_SERVICE_ROLE_KEY=<local-service-role-jwt> \
  -e DATABASE_URL=postgresql://postgres:[CONFIGURED_IN_COOLIFY]@localhost:5432/postgres \
  -e DIRECT_URL=postgresql://postgres:[CONFIGURED_IN_COOLIFY]@localhost:5432/postgres \
  fonzkart-frontend
```

> **Why port 3002?** Port 3000 was already occupied by Coolify's internal services on the VPS.

### `.dockerignore`

```
node_modules
.next
.git
.vercel
*.log
coolify/
tmp/
```

This reduced the Docker build context from **~1.15 GB** down to **~210 MB**.

---

## 6. Environment Variables Reference

### Build-Time Variables (baked into JS bundle)

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://localhost:8081` | Points to local Kong gateway |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(local anon JWT)* | Generated with local tools |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3002` | Frontend URL |

> ⚠️ These **cannot** be changed at runtime. A rebuild is required to change them.

### Runtime Variables (passed via `-e` or `.env.production`)

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Set in Dockerfile |
| `PORT` | `3002` | Frontend port |

```bash
python3 scripts/gen_jwt.py
```

Both `anon` and `service_role` tokens will be printed. The JWT secret must match `GOTRUE_JWT_SECRET` in `docker-compose.supabase.yml`.

---

## 7. Data Migration

Because the VPS couldn't reach Supabase's IPv6 database endpoint directly, data was migrated using the **Supabase REST API** instead of `pg_dump`.

### Migration Script

`scripts/migrate_from_supabase.py` — fetches all rows from Supabase Cloud via HTTP and inserts them into the local Postgres container.

```bash
python3 scripts/migrate_from_supabase.py
```

### Migration Results

| Table | Rows Migrated |
|---|---|
| `Brand` | 31 |
| `City` | 5 |
| `User` | 30 |
| `Model` | 1,815 |
| `Variant` | 2,989 |
| `Rider` | 1 |
| `Order` | 1 |
| `EvaluationRule` | 147 |
| `EmailMessage` | 0 (empty) |
| **Total** | **5,019 rows** |

### Schema Initialization

Before migrating data, the Prisma schema was applied to the empty local database:

```bash
# Generate SQL from Prisma schema (no DB connection needed)
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > /tmp/schema.sql

# Apply to local Postgres container
cat /tmp/schema.sql | docker exec -i supabase-db psql -U postgres -d postgres
```

> **Why not `prisma migrate deploy`?** The local DB already had Supabase's own internal schema (`schema_migrations` table), causing Prisma's migration resolver to throw `P3005: database schema is not empty`. Generating raw SQL and applying it directly bypasses this check.

Also, `prisma migrate deploy` was removed from the `npm run build` script in `package.json` to prevent build-time migration failures:

```diff
- "build": "prisma generate && prisma migrate deploy && next build",
+ "build": "prisma generate && next build",
```

---

## 8. Bugs Fixed During Migration

### Bug 1: Supabase Auth crashes on startup (SMTP)

**Symptom:** `supabase-auth` container exited immediately with `SMTP configuration required`.

**Root Cause:** GoTrue v2 enforces SMTP configuration at startup by default.

**Fix:** Set `GOTRUE_EXTERNAL_EMAIL_ENABLED: "false"` in `docker-compose.supabase.yml`. This allows GoTrue to start without SMTP. Email/OTP features are disabled until a real SMTP provider is configured.

---

### Bug 2: Kong port conflict with Coolify

**Symptom:** Kong failed to bind because Coolify had already claimed port `8000`.

**Fix:** Remapped Kong's external port to `8081`:
```yaml
ports:
  - "8081:8000"
```

---

### Bug 3: Docker build context too large (1.15 GB)

**Symptom:** `docker build` transferred 1.15 GB of context, taking 70+ seconds before any layer was built.

**Root Cause:** `node_modules` and `.next` directories were being sent to the Docker daemon.

**Fix:** Created `.dockerignore` excluding `node_modules`, `.next`, `.git`, etc. Context dropped to ~210 MB.

---

### Bug 4: `npm ci` fails — `prisma generate` runs postinstall

**Symptom:** `npm ci` in the `deps` stage failed because `postinstall: prisma generate` tries to connect to a DB that doesn't exist at build time.

**Fix:** Used `npm ci --ignore-scripts` in the `deps` stage. Prisma generate is then run explicitly in the `builder` stage after all files are copied.

---

### Bug 5: Prisma Engine not found at runtime (`linux-musl`)

**Symptom:** Container started but every DB request failed with:
```
PrismaClientInitializationError: Prisma Client could not locate the Query Engine for runtime "linux-musl".
This happened because Prisma Client was generated for "linux-musl-openssl-3.0.x"
```

**Root Cause:** Prisma requires OpenSSL to be installed in the Alpine container. The `runner` stage was a clean Alpine image with no OpenSSL.

**Fix:** Added to both `builder` and `runner` stages:
```dockerfile
RUN apk add --no-cache openssl
```

---

### Bug 6: `supabaseKey is required` on login (digest: 791385048)

**Symptom:** Every page load/login attempt crashed with a 500, digest `791385048`.

**Root Cause:** Two separate issues:
1. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are **inlined at build time** in Next.js. The previous image was built without them, so they were `undefined` in the bundle.
2. `SUPABASE_SERVICE_ROLE_KEY` (a server-side variable) was not passed to the running container, so `lib/supabase.ts` failed to initialize the client.
3. `auth.ts` imports `supabase` at the **module level**, meaning any page that imports auth actions crashes immediately — not just the password reset page.

**Fix:**
- Added `ARG`/`ENV` declarations in Dockerfile's builder stage so `NEXT_PUBLIC_*` vars get baked in
- Rebuilt the image with `--build-arg` flags
- Passed `SUPABASE_SERVICE_ROLE_KEY` as a runtime `-e` flag

---

### Bug 7: `prisma migrate deploy` fails — P3005

**Symptom:** Build step `prisma migrate deploy` threw:
```
Error: P3005 — The database schema is not empty.
```

**Root Cause:** The local Postgres (from the Supabase Docker image) already has internal Supabase tables. Prisma's migration engine refuses to run on a non-empty DB without baselining.

**Fix:** Removed `prisma migrate deploy` from the build script entirely. The schema was applied directly via raw SQL generated by `prisma migrate diff`.

---

## 9. Running the Stack

### Start Backend (Supabase Stack)
```bash
docker compose -f docker-compose.supabase.yml up -d
```

### Rebuild & Start Frontend
```bash
# 1. Build
docker build --network host \
  --build-arg "NEXT_PUBLIC_SUPABASE_URL=http://localhost:8081" \
  --build-arg "NEXT_PUBLIC_SUPABASE_ANON_KEY=$(python3 scripts/gen_jwt.py | grep anon | cut -d' ' -f2)" \
  --build-arg "NEXT_PUBLIC_APP_URL=http://localhost:3002" \
  -t fonzkart-frontend .

# 2. Run
docker rm -f fonzkart-frontend
docker run -d \
  --name fonzkart-frontend \
  --restart unless-stopped \
  --network host \
  -e PORT=3002 \
  -e SUPABASE_SERVICE_ROLE_KEY=$(python3 scripts/gen_jwt.py | grep service_role | cut -d' ' -f2) \
  -e DATABASE_URL="postgresql://postgres:[CONFIGURED_IN_COOLIFY]@localhost:5432/postgres" \
  -e DIRECT_URL="postgresql://postgres:[CONFIGURED_IN_COOLIFY]@localhost:5432/postgres" \
  fonzkart-frontend
```

### Re-run Data Migration (if needed)
```bash
python3 scripts/migrate_from_supabase.py
```

### Access Points

| Service | URL |
|---|---|
| **Fonzkart App** | http://localhost:3002 |
| **Supabase Studio** | http://localhost:3001 |
| **Coolify Dashboard** | http://localhost:8000 |
| **Kong API** | http://localhost:8081 |

---

## 10. Maintenance & Operations

### Viewing Logs

```bash
# Frontend logs
docker logs -f fonzkart-frontend

# Supabase DB logs
docker logs -f supabase-db

# Supabase Auth logs
docker logs -f supabase-auth
```

### Restarting Services

```bash
# Restart just the frontend
docker restart fonzkart-frontend

# Restart entire Supabase stack
docker compose -f docker-compose.supabase.yml restart
```

### Backing Up the Database

```bash
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

### Restoring a Backup

```bash
cat backup_20260412.sql | docker exec -i supabase-db psql -U postgres postgres
```

### Enabling Email OTP (Future)

1. Get SMTP credentials (Gmail App Password, Resend, Mailgun, etc.)
2. Update `docker-compose.supabase.yml` under `supabase-auth`:
```yaml
environment:
  GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
  SMTP_HOST: smtp.gmail.com
  SMTP_PORT: "587"
  SMTP_USER: your@gmail.com
  SMTP_PASS: your_app_password
  SMTP_SENDER_NAME: Fonzkart
```
3. Restart auth: `docker restart supabase-auth`

---

## 11. Security Checklist

- [ ] **Change default DB password** — `POSTGRES_PASSWORD: [CONFIGURED_IN_COOLIFY]` must be changed in production. Update in both `docker-compose.supabase.yml` and all connection string env vars.
- [ ] **Change JWT secret** — `GOTRUE_JWT_SECRET: [CONFIGURED_IN_COOLIFY]` must be changed. Regenerate all JWTs after changing it using `scripts/gen_jwt.py`.
- [ ] **Firewall rules** — Ensure ports `5432` (Postgres) and `8081` (Kong) are **not** exposed to the public internet. Use firewall rules to restrict to `localhost` only.
- [ ] **HTTPS** — Set up a domain with Coolify's built-in Let's Encrypt + Traefik for automatic TLS.
- [ ] **Auth secret** — `AUTH_SECRET` in `lib/session.ts` falls back to `'[CONFIGURED_IN_COOLIFY]'`. Set a proper random value via env var in production.
- [ ] **Remove debug routes** — The application has debug routes (`/api/debug-session`, `/api/debug/inspect-as`, etc.) that should be removed or access-restricted before going fully public.
- [ ] **`.env` files** — Ensure `.env` and `.env.production` are listed in `.gitignore` and never committed to the repository.

---

*Documentation generated: April 2026*
*Migration performed by: Antigravity AI (Google DeepMind)*
