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
- **Important for V1:** the deployed (Railway) filesystem is **ephemeral**.
  This means new data can be **lost after a deploy/restart** because we are
  intentionally NOT using persistent storage or Postgres. For the first live
  V1 this is acceptable; for a permanent deployment you would add a persistent
  volume or migrate to Postgres later.

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
3. Deploy the backend to Railway.
4. Deploy the frontend to Vercel, pointing `EXPO_PUBLIC_API_URL` at the
   Railway URL.
5. Set the backend `CORS_ORIGINS` to the Vercel origin.
6. Verify `/health` responds and the app loads end to end.

Do **not** deploy until you (Siva) explicitly ask. This repository is prepared
but not yet deployed.

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
- **Storage**: deliberately none (no persistent volume). SQLite is ephemeral.

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
- **Data**: restore from `backups/` (section 8). Because V1 storage is
  ephemeral, redeploying wipes data — check the backup before/after any
  redeploy.

---

## 19. Current V1 limitations

- **Ephemeral storage**: data can be lost on Railway redeploy/restart.
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
- **Data disappeared after redeploy**: expected for V1 (ephemeral storage).
  Restore from `backups/`.
- **Missing table errors**: ensure `app/main.py` `initialize_all_databases()`
  ran on startup; it creates all tables.

---

## 21. One-minute mental model

> SIVA OS = Expo (Vercel) talking over HTTPS to FastAPI (Railway), which reads
> and writes one SQLite file (`data/personal_life.db`). Your *code* lives in
> Git; your *data* lives in that SQLite file and is backed up to `backups/`.
> For V1 the cloud database is temporary, so always back it up before shipping.
