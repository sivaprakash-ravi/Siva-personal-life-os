import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.daily import router as daily_router
from app.api.routes.health import router as health_router
from app.api.routes.nutrition import router as nutrition_router
from app.api.routes.finance import router as finance_router
from app.api.routes.recurring import router as recurring_router
from app.api.routes.unified import router as unified_router

# Local development origins (web runs on Expo dev server on port 8081).
DEFAULT_CORS_ORIGINS = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]

# Extra production origins, e.g. the deployed Vercel frontend, supplied through
# the CORS_ORIGINS environment variable as a comma-separated list. Unset keeps
# local development working exactly as before.
EXTRA_CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

app = FastAPI(
    title="Siva OS",
    version="1.0.0",
    description="Siva OS Personal Life Operating System API",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=DEFAULT_CORS_ORIGINS + EXTRA_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(daily_router)
app.include_router(health_router)
app.include_router(nutrition_router)
app.include_router(finance_router)
app.include_router(recurring_router)
app.include_router(unified_router)


@app.get("/")
def root():
    return {
        "app": "Siva OS",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
    }