# SIVA OS — Production Workflow

A practical, down-to-earth guide to how SIVA OS works and how to run it in
production. Read this top to bottom once; then keep it as a reference.

---

## 1. What SIVA OS is

SIVA OS (Siva's Personal Life OS) is a personal life-operating-system app. It
tracks daily check-ins, health records, meals/nutrition, and
finance/transactions in one place, and shows everything on a dashboard (Today).

It is a single-user, personal application intended for one person.

---

## 2. Current architecture

Three parts, plus a database:

```
Vercel (frontend)
   │  Expo Web (static site)
   ▼
   HTTPS requests (fetch)
   ▼
Railway (backend)
   │  FastAPI + Uvicorn  ->  app/api/main.py
   ▼
SQLite (database)  ->  data/personal_life.db
```

- **Frontend**: an Expo app. For the web the code lives in `client/` and is
  exported to a **static site** for Vercel. The same codebase also builds for
  Android/iOS.
- **Backend**: a FastAPI app in `app/`. Entry point is `app/api/main.py`
  (the FastAPI `app` object). It runs under Uvicorn.
- **Database**: a single SQLite file at `data/personal_life.db`. No
  database server, no Postgres. Just one file.

---

## 3. Frontend → API → backend → database flow

1. The browser/device loads the frontend (Expo Web).
2. The frontend `client/src/services/api.ts` builds an API base URL from the
   `EXPO_PUBLIC_API_URL` environment variable.
3. It calls REST endpoints under `/api/v1/...`, e.g.
   `GET /api/v1/daily`, `POST /api/v1/health/records`.
4. FastAPI routes in `app/api/routes/*.py` receive the request.
5. The routes call service functions in `app/services/*.py`.
6. Services talk to the database through `get_connection()` defined in
   `app/database/database.py`, which opens `data/personal_life.db`.
7. Results return as JSON, and the frontend renders it.

The database is the single source of truth for all user data.

---

## 4. What happens when you complete a Daily check-in

- The Today screen calls `POST /api/v1/daily/checkins/{id}/complete`
  (client: `completeCheckin(id)`).
- Route: `app/api/routes/daily.py` → service `app/services/checkin_service.py`
  → `update_checkin(..., status='completed')` in `app/database/database.py`.
- The row in `daily_checkins` gets `status='completed'` and a `completed_at`
  timestamp.
- The dashboard and screens re-fetch (`useFocusEffect` in
  `client/src/app/*.tsx`) so the summary/streak recompute from real data.

---

## 5. What happens when you add Health/Nutrition/Finance data

Each domain has a `POST` endpoint that inserts a row, then the UI reloads:

- **Health** — `POST /api/v1/health/records`
  -> `app/api/routes/health.py` -> `app/services/health_service.py`
  -> `app/database/health_database.py` (table `health_records`).
- **Nutrition/meals** — `POST /api/v1/nutrition/meals`
  -> `app/api/routes/nutrition.py` -> `app/services/meal_service.py`
  -> `app/database/meal_database.py` (table `meals`).
- **Finance/transactions** — `POST /api/v1/finance/expenses`
  -> `app/api/routes/finance.py` -> `app/services/expense_service.py`
  -> `app/database/expense_database.py` (table `expenses`).

All inserts validate their input (e.g. amount > 0, no negative calories).

---

## 6. SQLite storage

- One file: `data/personal_life.db`.
- Created automatically on startup by `initialize_all_databases()` in
  `app/main.py`, which calls the `initialize_*_table()` functions for all 13
  tables.
- The file path is anchored to the repository root in
  `app/database/database.py` (`DATABASE_PATH`), so it is the same file no
  matter which directory launches the server.
- **V1 (ephemeral):** the deployed (Railway) filesystem was intentionally
  ephemeral, meaning new data could be lost after a deploy/restart. This was
  acceptable for the initial live smoke-test deployment only.
- **V1 persistent (current):** a Railway **persistent volume** is mounted over
  the repository's `data/` directory (see section 12). Because
  `DATABASE_PATH` already anchors to `APP_ROOT/data/personal_life.db` (the same
  path Railway serves), the SQLite file now survives redeploys and restarts
  with **no code or schema change**. No Postgres migration is required.
- On a fresh persistent volume (e.g. a new volume or first deploy), the
  `lifespan` startup hook calls `initialize_all_databases()` and creates all
  13 tables automatically — no manual setup needed.

---

## 7. Database backup

The database is located at `data/personal_life.db`. Back it up before any
significant change, and routinely after adding real data.

Backup files live in `backups/` and are **git-ignored** (never committed).

To create a complete backup (binary `.db` copy + SQL dump):

```powershell
# 1) Consistent binary copy
sqlite3 data\personal_life.db ".backup 'backups\personal_life_backup.db'"

# 2) Full SQL dump (portable)
sqlite3 data\personal_life.db ".output backups\personal_life_dump.sql" ".dump"
```

Or, without the `sqlite3` CLI, using Python:

```python
import sqlite3
from pathlib import Path

src = sqlite3.connect("data/personal_life.db")
dst = sqlite3.connect("backups/personal_life_backup.db")
src.backup(dst)          # consistent copy
dst.close()

with open("backups/personal_life_dump.sql", "w", encoding="utf-8") as f:
    for line in src.iterdump():
        f.write(line + "\n")
src.close()
```

The `backups/` folder currently contains:
- `backups/personal_life_backup.db`
- `backups/personal_life_dump.sql`

---

## 8. Database restore

From the SQL dump (portable):

```powershell
sqlite3 data\personal_life.db ".read backups\personal_life_dump.sql"
```

Or with Python:

```python
import sqlite3
con = sqlite3.connect("data/personal_life.db")
with open("backups/personal_life_dump.sql", "r", encoding="utf-8") as f:
    con.executescript(f.read())
con.commit()
con.close()
```

From the binary `.db` copy (replace the whole file):

```powershell
Copy-Item -Force backups\personal_life_backup.db data\personal_life.db
```

Steps for a safe restore:
1. Stop the backend (so nothing is writing to the DB).
2. Copy current `data/personal_life.db` to a safety name first.
3. Restore using one of the methods above.
4. Restart the backend.

---

## 9. Git backup vs database backup

- **Git** backs up *code* (frontend + backend source). It is your rollback
  point for code changes.
- **The database** (`data/personal_life.db`) and the `backups/` folder are
  *your data* and are **excluded from Git** (see `.gitignore`:
  `*.db`, `*.sqlite`, `*.sqlite3`, `backups/`).

So: push code to Git, and back up the database separately. Never rely on Git
to store your personal data, and never commit your data into Git.

---

## 10. Local development workflow

Backend:

```powershell
# from the repo root
uvicorn app.api.main:app --reload --host 0.0.0.0 --port 8000
```

- Runs on port 8000. In development the client falls back to the local LAN
  server (see `DEV_API_FALLBACK` in `client/src/services/api.ts`).

Frontend (Expo Web):

```powershell
# from client/
npm run web        # or: npx expo start --web
```

- Runs the Expo dev server on port `8081`, which is why the backend CORS
  allows `http://localhost:8081` and `http://127.0.0.1:8081`.

---

## 11. Production deployment workflow

1. Back up the database (`backups/`).
2. Run the validation checks (see section 17).
3. Promote code to `main` (see section 22 — release workflow) and push.
4. Railway and Vercel deploy from `main` (auto or manual; see section 23).
5. Set the backend `CORS_ORIGINS` to the Vercel origin.
6. Verify `/health` responds and the app loads end to end.

Production is live; `main` is the production source. Development happens on
other branches and is promoted to `main` only after validation (see sections
22-25).

---

## 12. Railway setup (backend)

- **Project**: new Railway service from the GitHub repo root.
- **Build**: Railway auto-detects Python from `requirements.txt`
  (`python-dotenv`, `fastapi`, `uvicorn`).
- **Start command**:
  ```bash
  uvicorn app.api.main:app --host 0.0.0.0 --port "$PORT"
  ```
  (`$PORT` is provided by Railway; binding to `0.0.0.0` makes it reachable.)
- **Environment variables** on Railway:
  - `APP_ENV=production`
  - `CORS_ORIGINS=https://<your-vercel-domain>`
  - (No secret keys needed for V1 — no external credentials.)
- **Storage (persistent volume):**
  - Add a **Volume** to the backend service with:
    - **Mount path**: `<repo-root>/data` (default Nixpacks repo root is
      `/app`, so the mount path is `/app/data`). Mount it exactly at the
      directory that holds `personal_life.db`.
  - Railway persists this volume across deploys, restarts, and crashes, so the
    SQLite file survives. The DB path (`APP_ROOT/data/personal_life.db`)
    resolves to this mounted directory, so no code changes are required.
  - On a brand-new volume, the app auto-creates all 13 tables on first startup
    (the `lifespan` hook in `app/api/main.py` → `initialize_all_databases()`).
  - Keep volume capacity at the minimum (SQLite is a single small file).
  - Do **not** expose the `data/` directory publicly (no static file serving;
    the API only reads the DB internally).

---

## 13. Vercel setup (frontend)

The Expo Web app exports to a static site, so use Vercel with a static
framework.

From `client/`:

```powershell
npx expo export --platform web
```

This writes the static site to `client/dist/`.

- **Build output directory**: `dist` (relative to `client/`).
- **Environment variable** on Vercel:
  - `EXPO_PUBLIC_API_URL=https://<your-railway-backend-url>`
- Optional: a `vercel.json` in `client/` specifying the output directory if
  your root is set to `client/` in Vercel.

---

## 14. Environment variables

| Variable                | Where            | Purpose                                                        |
|-------------------------|------------------|----------------------------------------------------------------|
| `EXPO_PUBLIC_API_URL`   | Vercel (frontend) | Base URL of the deployed backend. **Required for production.** |
| `APP_ENV`               | Railway (backend) | Runtime label: `development` or `production`.                  |
| `CORS_ORIGINS`          | Railway (backend) | Comma-separated allowed browser origins (e.g. Vercel domain).  |

Do not put real values/secrets in Git. `client/.env.example` documents the
client variable without a real value; the root `.env.example` holds
`APP_ENV=development`.

---

## 15. CORS

CORS is configured in `app/api/main.py`:

- Defaults always allow local development:
  `http://localhost:8081`, `http://127.0.0.1:8081`.
- Add the deployed Vercel origin through the **`CORS_ORIGINS`** environment
  variable (comma-separated). Example:
  `CORS_ORIGINS=https://siva-os.vercel.app`
- Because the whole app uses same-type API calls with `allow_credentials=True`,
  include the exact origin (no trailing slash).

---

## 16. Android/iOS production builds

The same `client/src/services/api.ts` is used for web, Android, and iOS, so
all three read `EXPO_PUBLIC_API_URL` from the same mechanism.

Native builds use EAS (Expo Application Services):

```bash
npx eas build --platform android
npx eas build --platform ios
```

These require an Expo account and (for iOS) signing credentials, plus setting
`EXPO_PUBLIC_API_URL` for those builds. JS bundles for all three platforms
compile successfully with `npx expo export --platform web|android|ios`.

---

## 17. Validation checklist

Run these before deploying:

- [ ] TypeScript: `npx tsc --noEmit` (in `client/`) — clean.
- [ ] Backend Python: `python -m py_compile app\api\main.py` and compile the
      whole `app\` package.
- [ ] Expo web export: `npx expo export --platform web` succeeds.
- [ ] Backend start command runs / binds to `0.0.0.0` and `$PORT`.
- [ ] Database initializes on a clean environment (fresh `data/` created with
      all 13 tables).
- [ ] No production LAN-IP fallback (see `client/src/services/api.ts`).
- [ ] No secrets committed (`git grep` for keys; confirm no `.env`/`.db`
      tracked).
- [ ] CORS includes the Vercel origin.
- [ ] `job-agent/` untouched.

---

## 18. Rollback strategy

- **Code**: Git is the source of truth. Roll back the frontend/backend with a
  `git revert` or redeploy a previous good commit.
- **Data**: restore from `backups/` (section 8). With the persistent volume,
  redeploying/restarting preserves data; still verify the backup before/after
  any redeploy as a safety net.

---

## 19. Current V1 limitations

- **Persistent storage via volume**: data now survives redeploys/restarts on
  Railway through a persistent volume over `data/` (section 12). Backups remain
  the safety net — always back up before significant changes.
- **No auth**: single-user personal app; no user accounts or isolation.
- **Single machine/person**: not designed for multi-user concurrent access.
- **`explore` screen**: a leftover Expo starter template screen
  (`client/src/app/explore.tsx`), hidden from navigation (`href: null`),
  not user-facing. Optional cleanup later.

---

## 20. Common troubleshooting

- **Web shows CORS errors**: the backend `CORS_ORIGINS` does not include the
  exact origin the browser is on. Add it (section 15).
- **Frontend can't reach API**: check `EXPO_PUBLIC_API_URL` is set for the
  active build. In development it falls back to the LAN server; in production
  it fails fast if unset.
- **Data disappeared after redeploy**: should not happen with the persistent
  volume (section 12). If data is missing, the volume is not mounted at
  `/app/data` for that deploy, or the service lost the volume — check the
  volume mount and restore from `backups/`.
- **Missing table errors**: ensure `app/main.py` `initialize_all_databases()`
  ran on startup; it creates all tables.

---

## 21. One-minute mental model

> SIVA OS = Expo (Vercel) talking over HTTPS to FastAPI (Railway), which reads
> and writes one SQLite file (`data/personal_life.db`). Your *code* lives in
> Git; your *data* lives in that SQLite file, persists via the Railway
> persistent volume, and is backed up to `backups/`. Always back it up before
> shipping significant changes.

---

## 22. Release workflow (staging -> production)

One rule keeps production safe: **`main` is sacred.** Everything lands on
`main` only after validation, and every thing that lands on `main` is
versioned.

Branch strategy (minimal, two long-lived branches):

```
feature/<name>   ------>   develop (staging/integration)
                                |
                                v  test + validate
                          main (production)  ->  deploy  ->  tag vX.Y.Z
```

- `main` — production. Auto-deploys to Railway (backend) and Vercel
  (frontend). Only promotion merges and tagged releases land here.
- `develop` — integration/staging trunk. Branches merge here first and the
  combined result is validated before reaching `main`.
- `feature/<name>` — short-lived work branches off `develop`. Tiny hotfixes may
  branch off `main` directly, but still go through validation before merge.

Desired workflow restated as a checklist:

1. Start from `develop`, create `feature/<name>`.
2. Develop + commit locally (do not commit data: `*.db`, `backups/`, `.env`
   are ignored).
3. Push the branch, open a PR/merge into `develop`.
4. Validate on staging (section 23) + run the section 17 checks.
5. Merge `develop` into `main`, push.
6. Deploys to Railway and Vercel happen (auto or manual — see section 23).
7. Smoke-test production.
8. Tag the release (section 24) and record it.

Semantic versioning:

- Format `MAJOR.MINOR.PATCH` (e.g. `v1.0.0`, `v1.1.0`, `v1.0.1`).
  `client/app.json` `version` should mirror the current `v` number.
- `PATCH` — bug fixes that keep behavior/API compatible (e.g. the finance
  category fix, the water metric fix). No schema/API change.
- `MINOR` — backward-compatible new features or additive API endpoints.
- `MAJOR` — breaking API/UI/schema changes.
- Tags: annotated tags on `main` after the release is live:
  `git tag -a v1.0.1 -m "Release v1.0.1"; git push origin v1.0.1`.
  Optionally create a matching GitHub Release with notes.

---

## 23. Current production setup and staging arrangement

Current production (what is live today):

- **GitHub**: `origin/main` is the production source of truth
  (`https://github.com/sivaprakash-ravi/personal-life-os`). Railway and Vercel
  watch this branch.
- **Vercel (frontend)**: Expo Web static export from `client/`, build output
  `dist`, with `EXPO_PUBLIC_API_URL` pointing at the Railway backend URL.
- **Railway (backend)**: service from the repo root, start command
  `uvicorn app.api.main:app --host 0.0.0.0 --port "$PORT"`, env `APP_ENV`,
  `CORS_ORIGINS`, and the **persistent volume mounted at `/app/data`** holding
  `personal_life.db`. This single production volume/DB must never be shared
  with or wiped by staging.

Safest practical staging (recommended, minimal):

- **Frontend staging = Vercel Preview deployments.** Every PR automatically
  gets a preview URL, so the web frontend can be exercised before anything
  touches `main`. No extra config.
- **Backend staging = one separate Railway service** connected to `develop`:
  - New service, same start command and `requirements.txt` build.
  - **Its own volume** mounted at `/app/data` (a *second, separate* volume —
    never the production one). Production volume and data are untouched.
  - Env: `APP_ENV=staging` (or `development`), `CORS_ORIGINS` set to the Vercel
    preview origin.
  - Point a staging frontend build (`EXPO_PUBLIC_API_URL`) at the staging
    backend URL.
- Lighter alternative when not testing backend changes: validate locally
  (`uvicorn app.api.main:app` + `npm run web`) and rely on Vercel preview for
  frontend-only changes. This needs no second backend at all.
- Staging data is throwaway: it is a separate volume and can be reset freely.
  Production data is only ever touched by production deploys.

---

## 24. Rollback: code vs database

Separate the two. **A code rollback never touches data, and a database
rollback never touches code.**

Code rollback (return to the previous known-good application version):

- Preferred: `git revert` the bad commit/merge on `main` and push — Railway
  and Vercel redeploy the reverted tree. Same history stays intact.
  ```
  git checkout main && git pull
  git revert --no-edit <bad-sha>       # or <merge-sha> for a merge
  git push origin main
  ```
- Alternative: in Railway/Vercel, "Redeploy previous deployment" to the last
  known-good commit/tag.
- Tags make this fast: `v1.0.0` is the previous good released version; you can
  revert to exactly that point.

Database rollback (restore data only):

- Only needed if data was corrupted/lost or a shipped schema/init change made
  the DB incompatible. Restore from `backups/` using section 8.
- Steps: stop the backend, copy the current DB aside, restore the `.db`/dump,
  restart. Data and code are independent: you may revert code alone, restore
  data alone, or both.

Backup before risky changes:

- Before any promotion that touches schema, table init, or data logic, run the
  section 7 backup (binary `.db` + SQL dump) into `backups/` (git-ignored).
- For maximum safety on a database/schema change, also download a snapshot of
  the production DB (Railway volume) and store it with a dated name before
  deploying.

Note: reverting a **schema change** requires restoring the DB *and* reverting
code to the version that reads the old schema — do both together.

---

## 25. Promotion runbook (fast path)

Every release, in order:

1. `git fetch origin && git status` — clean tree, on `main`.
2. Back up production data (section 7 + section 24 note).
3. Validate: section 17 checklist (tsc, py_compile, expo export, fresh-DB init,
   no secrets, CORS, `job-agent/` untouched).
4. Merge the fetched/validated changes:
   ```
   git checkout main && git pull origin main
   git merge --no-ff develop && git push origin main
   ```
   (or merge the approved PR to `main` on GitHub).
5. Wait for Railway + Vercel deploys; hit `GET /health` and the dashboard;
   add/read one record end to end.
6. Tag: `git tag -a v<NEW> -m "Release v<NEW>"; git push origin v<NEW>`.
7. Confirm production shows the expected version and data persisted.
