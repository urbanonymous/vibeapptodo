from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import get_db
from app.services.projects import ensure_indexes
from app.routes.projects import router as projects_router
from app.routes.steps import router as steps_router
from app.routes.reminders import router as reminders_router


def create_app() -> FastAPI:
    app = FastAPI(title="VibeTracker API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    async def health():
        return {"ok": True}

    @app.on_event("startup")
    async def _startup():
        db = get_db()
        await ensure_indexes(db)

    app.include_router(projects_router, prefix="/api")
    app.include_router(steps_router, prefix="/api")
    app.include_router(reminders_router, prefix="/api")

    return app


app = create_app()

