# personal-life-os
Siva's Personal Life OS — automated tracking, analytics, reports, and AI-powered insights for daily life, health, food, goals, learning, and more.

## Production Status

- **Deployment status**: LIVE (V1). Frontend on Vercel (Expo Web static export), backend on Railway (FastAPI + Uvicorn), SQLite on the Railway persistent volume at `/app/data`. `main` is the current production source.
- **Frontend target**: Vercel — Expo Web static export (see `client/`).
- **Backend target**: Railway — FastAPI + Uvicorn (see `app/`).
- **Database strategy**: SQLite at `data/personal_life.db`, persisted on Railway via a **persistent volume mounted at the `data/` directory** (no Postgres, no schema change). On a fresh volume the app auto-creates all tables on startup. See `docs/PRODUCTION_WORKFLOW.md` section 12 for the exact Railway volume configuration.
- **Backup strategy**: personal data is never committed to Git. Backups are written to `backups/` (git-ignored) as a `.db` copy plus a SQL dump.
- **Release workflow**: see `docs/PRODUCTION_WORKFLOW.md` sections 22-25 for branches, staging, promotion, versioning, and rollback.
- **Full guide**: see [docs/PRODUCTION_WORKFLOW.md](docs/PRODUCTION_WORKFLOW.md).
