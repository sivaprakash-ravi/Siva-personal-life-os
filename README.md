# personal-life-os
Siva's Personal Life OS — automated tracking, analytics, reports, and AI-powered insights for daily life, health, food, goals, learning, and more.

## Production Status

- **Deployment status**: NOT deployed (prepared for V1; deploy manually when ready).
- **Frontend target**: Vercel — Expo Web static export (see `client/`).
- **Backend target**: Railway — FastAPI + Uvicorn (see `app/`).
- **Database strategy**: SQLite at `data/personal_life.db`; ephemeral storage for V1 (no Postgres, no persistent volume). Data can be lost on redeploy.
- **Backup strategy**: personal data is never committed to Git. Backups are written to `backups/` (git-ignored) as a `.db` copy plus a SQL dump.
- **Full guide**: see [docs/PRODUCTION_WORKFLOW.md](docs/PRODUCTION_WORKFLOW.md).
