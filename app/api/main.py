from fastapi import FastAPI

from app.api.routes.daily import router as daily_router
from app.api.routes.health import router as health_router
from app.api.routes.nutrition import router as nutrition_router
from app.api.routes.finance import router as finance_router
from app.api.routes.recurring import router as recurring_router
from app.api.routes.unified import router as unified_router


app = FastAPI(
    title="Siva OS",
    version="1.0.0",
    description="Siva's Personal Life Operating System",
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