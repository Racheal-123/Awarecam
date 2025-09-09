# AwareCam – Current Issues and Required Tasks

## Summary
This document captures the known issues in the codebase and a prioritized, actionable task list to bring the app to a stable local and production-ready state.

## Critical Issues (blocking)
- Backend fails to boot without Supabase credentials
  - `api/libraries/supabase_client.py` constructs the client at import time, raising if `SUPABASE_URL` or `SUPABASE_KEY` are missing.
  - Effect: Flask app cannot start for local/testing without valid credentials.
- Frontend–Backend port mismatch
  - Backend runs on port 3000 (see `api/app.py`), while previous configs assumed 5000.
  - `VITE_API_URL` must match the backend port. Frontend was updated to `http://localhost:3000`.
- Duplicate/Conflicting User classes
  - `src/api/entities.js` and `src/entities/index.js` both define `User`. Historically, `@/api/entities` exported a minimal class, while many components call methods like `User.me()`, `User.login()`, etc.
  - Effect: runtime errors/blank screens when calling missing methods.
- Missing/incorrect environment files
  - Frontend: `.env` must include `VITE_API_URL`.
  - Backend: `api/.env` must include `SECRET_KEY`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, etc. Prior encoding issues caused dotenv parse failures.
- Route naming consistency and default route
  - `src/pages/index.jsx` defines route paths with PascalCase (e.g., `/Events`) and also maps `/` to `Events`. Mixed casing and mapping can cause unexpected route resolution.
- Authentication flow coupling
  - `LandingPage.jsx` calls `User.login()` that redirects to a Google OAuth endpoint; other flows use `useAuthStore` (`src/lib/auth.js`).
  - Effect: fragmented auth, difficult to test locally.

## High Priority Issues
- Eager imports with side-effects
  - Several backend modules assume external services (Supabase, DB) are ready at import. This should be deferred to request-time.
- CORS and credential policy
  - CORS currently allows `*` with credentials disabled. Confirm if frontend needs credentials and restrict origins for production.
- Error handling and health checks
  - No simple health endpoint to quickly verify API liveness/readiness without external dependencies.
- Inconsistent routing helpers
  - `src/utils/index.js#createPageUrl` returns lowercase paths (e.g., `/events`), while routes are PascalCase in `src/pages/index.jsx`.
- Entities/API client cohesion
  - `src/lib/api.js` creates axios with interceptors and `VITE_API_URL`, while some entity classes create their own client. Single source of truth is preferred.

## Medium Priority Issues
- Lack of `.env.example` files (frontend and backend)
- No Dockerized local DB defaults or bootstrap data for quick start
- Missing 404 route and global error boundary on frontend
- No smoke tests or integration checks
- Migration/DB lifecycle clarity (Flask-Migrate usage not documented end-to-end)

## Low Priority / Cleanup
- Dead imports and unused icons across several components
- Naming consistency (files and routes)
- Developer experience: scripts for setup/start/stop

---

## Required Tasks (Prioritized)

### P0 – Unblock local dev
1) Make Supabase client lazy/optional for local
- Change `api/libraries/supabase_client.py` to expose a `get_supabase()` function without constructing a client at import time.
- Update callers to fetch the client on demand and handle missing creds gracefully.

2) Add health endpoints
- Add `/healthz` (liveness) and `/readyz` (readiness) that do not require Supabase/DB.

3) Single source of truth for User entity
- Ensure `@/api/entities` exports a `User` with methods used by the app: `me()`, `login()`, `logout()`, `getCurrentUser()`, `updateProfile()`, `changePassword()`.
- Remove/rename the duplicate `User` in `src/entities/index.js` or re-export consistently.

4) Normalize routes
- In `src/pages/index.jsx`, standardize routes to lowercase (e.g., `/events`) and align with `createPageUrl`.
- Add a catch-all `*` route to a 404 component.

5) Verify env files
- Frontend `.env`: `VITE_API_URL=http://localhost:3000`.
- Backend `api/.env`: include `SECRET_KEY`, `DATABASE_URL`, optional dummy `SUPABASE_URL`/`SUPABASE_KEY` for local.
- Add ASCII-encoded `.env.example` files for both.

### P1 – Stabilize API and app flow
6) Centralize axios client
- Ensure all entities use `src/lib/api.js` so interceptors/auth headers are consistent.

7) Unify authentication flow
- Prefer `useAuthStore` for email/password and token storage.
- Gate routes in a single place; Landing should not directly call provider URLs unless configured.

8) CORS policy review
- Restrict origins in dev/prod appropriately; decide on credentials usage.

9) Backend startup scripts
- Add PowerShell scripts to activate venv, export env, and run `python app.py`.

### P2 – DX, Tests, and Ops
10) Add health check docs and smoke tests
- Minimal frontend and backend smoke tests.

11) Add Docker support for local DB/MediaMTX
- Compose file for Postgres, MediaMTX with sensible defaults.

12) Logging and error boundaries
- Frontend error boundary + toast on major failures.
- Backend: structured logs and global error handler.

---

## Concrete Implementation Notes
- Supabase (lazy):
  - Replace module-level `supabase = get_supabase_client()` with a function `get_supabase()` that returns the client or `None` and let controllers handle the absence.
- Health endpoints:
  - `/healthz` returns `{ status: 'ok' }` 200 without touching DB.
  - `/readyz` optionally checks DB if creds are present; otherwise returns 200 with `{ ready: false, reason: 'no-db-creds' }`.
- Routing:
  - Map `/` to a simple Landing or `/events` and ensure links via `createPageUrl` match the router.
- User entity:
  - Keep `src/api/entities.js` as canonical; remove duplication or re-export from `src/entities/index.js`.

---

## Current Local Run Instructions (reference)
- Frontend: `npm run dev` (Vite prints active port; often http://localhost:5173–5175).
- Backend (from `api/`):
  - `py -3.11 -m venv .venv`
  - `./.venv/Scripts/Activate.ps1`
  - `pip install -r requirements.txt`
  - Ensure `api/.env` exists (ASCII):
    - `SECRET_KEY=dev`
    - `DATABASE_URL=postgresql://postgres:password@localhost:5432/awarecam_db`
    - Optionally set `SUPABASE_URL`, `SUPABASE_KEY`
  - `python app.py` (default port 3000)

---

## Open Questions
- Final choice of auth provider(s) and local testing strategy?
- Expected default route and access level for unauthenticated users?
- Do we require Supabase for minimal local dev, or can we mock?
