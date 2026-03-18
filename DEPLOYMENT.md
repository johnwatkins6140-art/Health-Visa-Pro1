# Deployment Guide — UK Health Visa Application
## Dokploy + PostgreSQL

---

## Build Method — Choose One

Two build methods are included. **Dockerfile is recommended** — it uses the standard Node.js Docker image and has no environment quirks.

### Option A — Dockerfile (Recommended ✅)

1. In Dokploy → Application settings → **Build type**: select `Dockerfile`
2. Nixpacks.toml is ignored; the `Dockerfile` in the root is used
3. Deploy — no extra steps needed

The Dockerfile uses `node:22-slim`, installs pnpm 10.26.1 via npm (which works reliably in standard Docker), builds the frontend and API, then runs the compiled server.

### Option B — Nixpacks (Alternative)

1. In Dokploy → Application settings → **Build type**: select `Nixpacks`
2. `nixpacks.toml` is used; `COREPACK_INTEGRITY_KEYS=0` is pre-configured to bypass the corepack signature check that affects older bundled corepack versions
3. Deploy

---

## Overview

This app consists of:
- **Frontend** — React + Vite (built to static files)
- **Backend** — Node.js + Express API (serves both the API and the static frontend)
- **Database** — PostgreSQL (stores all visa applications, auto-created on first startup)

---

## Step 1 — Set up PostgreSQL in Dokploy

1. Log in to your Dokploy dashboard
2. Go to **Services → New Service → Database**
3. Select **PostgreSQL**
4. Set a database name, e.g. `visa_db`
5. Dokploy will give you a **connection string** like:
   ```
   postgresql://username:password@hostname:5432/visa_db
   ```
6. Copy this — you'll need it in Step 3

---

## Step 2 — Create the Application in Dokploy

1. Go to **Services → New Service → Application**
2. Set the source:
   - **Git provider**: GitHub / GitLab / Bitbucket (connect your account)
   - **Repository**: your repo URL
   - **Branch**: `main`
3. Set **Build type** to `Nixpacks`
4. Dokploy will auto-detect the `nixpacks.toml` and use it

---

## Step 3 — Set Environment Variables

In the Dokploy application settings, go to **Environment Variables** and add:

| Variable | Value | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `NODE_ENV` | `production` | Enables static file serving + production mode |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/visa_db` | PostgreSQL connection string from Step 1 |

> **Note:** Dokploy can link the PostgreSQL service directly. Go to the app's **Environment** tab, click **Link Database**, and it will inject `DATABASE_URL` automatically.

---

## Step 4 — Configure Port & Domain

1. In the app settings, set **Port** to `3000` (must match the `PORT` env var)
2. Under **Domains**, add your domain or use the Dokploy-generated subdomain
3. Enable **HTTPS** (Dokploy handles Let's Encrypt automatically)

---

## Step 5 — Deploy

1. Click **Deploy** in Dokploy
2. Watch the build logs — it will:
   - Install Node.js 22 via Nix
   - Install pnpm 9
   - Install dependencies (`pnpm install --frozen-lockfile`)
   - Build the React frontend (`vite build`)
   - Bundle the Express server (`esbuild`)
3. Once build succeeds, the container starts with `node artifacts/api-server/dist/index.cjs`

---

## Step 6 — Run Database Migrations (First Deploy Only)

After the first successful deployment, open the **Terminal** in Dokploy for your app and run:

```bash
# Apply the database schema
pnpm -C lib/db push
```

This creates the `visa_applications` table in your PostgreSQL database using Drizzle Kit.

> You only need to do this once. Future schema changes also require running this command after deployment.

---

## Step 7 — Verify the Deployment

1. Open your domain in a browser — the GOV.UK visa application form should load
2. Test the health endpoint:
   ```
   curl https://your-domain.com/api/healthz
   ```
   Expected response: `{"status":"ok"}`
3. Complete a test application through all 7 steps + payment
4. Verify the application is saved — check your database:
   ```sql
   SELECT reference_number, first_name, last_name, sponsor_name, total_fee_paid, submitted_at
   FROM visa_applications
   ORDER BY submitted_at DESC
   LIMIT 10;
   ```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `POST` | `/api/visa-applications` | Submit a visa application (called automatically on payment) |
| `GET` | `/api/visa-applications/:ref` | Retrieve application by reference number |

---

## Architecture (Production)

```
Browser
  │
  ▼
Dokploy (HTTPS reverse proxy)
  │
  ▼
Node.js / Express — port 3000
  ├── /api/*          → API routes (Express Router)
  │     ├── GET  /api/healthz
  │     ├── POST /api/visa-applications   → saves to PostgreSQL
  │     └── GET  /api/visa-applications/:ref
  └── /*              → Static files (React + Vite build)
        └── index.html (SPA fallback for all routes)
  │
  ▼
PostgreSQL
  └── visa_applications table
```

---

## Database Schema

```sql
CREATE TABLE visa_applications (
  id                    SERIAL PRIMARY KEY,
  reference_number      TEXT NOT NULL UNIQUE,
  payment_reference     TEXT NOT NULL,
  visa_type             TEXT NOT NULL,          -- 'health-care' | 'skilled-worker'
  status                TEXT NOT NULL DEFAULT 'submitted',
  title                 TEXT NOT NULL,
  first_name            TEXT NOT NULL,
  last_name             TEXT NOT NULL,
  date_of_birth         TEXT NOT NULL,
  nationality           TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT NOT NULL,
  address               TEXT NOT NULL,
  city                  TEXT NOT NULL,
  country               TEXT NOT NULL,
  postcode              TEXT,
  passport_number       TEXT NOT NULL,
  passport_expiry       TEXT NOT NULL,
  cos_reference         TEXT NOT NULL,
  sponsor_name          TEXT NOT NULL,
  sponsor_licence_number TEXT,
  job_title             TEXT NOT NULL,
  occupation_group      TEXT NOT NULL,
  annual_salary         TEXT NOT NULL,
  employment_start_date TEXT NOT NULL,
  work_location         TEXT,
  contract_type         TEXT NOT NULL,
  english_level         TEXT NOT NULL,
  english_evidence      TEXT NOT NULL,
  qualification_level   TEXT,
  qualification_subject TEXT,
  visa_duration         TEXT NOT NULL,          -- 'short' | 'long'
  processing_speed      TEXT NOT NULL,          -- 'none' | 'priority' | 'super'
  ihs_years             INTEGER,
  total_fee_paid        INTEGER NOT NULL,
  submitted_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Troubleshooting

**Build fails at `pnpm install`**
- Make sure your repo has a committed `pnpm-lock.yaml`
- Check that `NODE_ENV` is not set during install (Nixpacks handles this)

**`DATABASE_URL` error on startup**
- The app will refuse to start without this variable
- Double-check it's set in Dokploy's environment variables, not just locally

**Schema not applied / empty database**
- Run `pnpm -C lib/db push` via the Dokploy terminal (Step 6)
- Verify `DATABASE_URL` is accessible from inside the container

**Frontend loads but API returns 404**
- Confirm `NODE_ENV=production` is set (this enables API routing in app.ts)
- Check the Dokploy logs for any startup errors

**Port conflict**
- Set `PORT=3000` in environment variables and ensure Dokploy's port configuration matches

---

## Updating the App

1. Push changes to your Git branch
2. In Dokploy, click **Redeploy** (or enable automatic deployments via webhook)
3. If you changed the database schema, run `pnpm -C lib/db push` via terminal after deployment

---

## Environment Variables Summary

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname:5432/visa_db
```
