from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.rate_limit import limiter
from app.routers import (
    alerts,
    assistance,
    auth,
    health,
    incidents,
    kpis,
    layers,
    public,
    realtime,
    shelters,
    zones,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if get_settings().seed_users_on_startup:
        from app.seed import seed_users

        await seed_users()
    yield
    from app.db import get_engine

    await get_engine().dispose()


settings = get_settings()
app = FastAPI(
    title="Esmeraldas Resiliente API",
    description="API académica de demostración; no sustituye los canales oficiales de emergencia.",
    version="0.1.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

for route in (
    health.router,
    auth.router,
    zones.router,
    incidents.router,
    shelters.router,
    alerts.router,
    assistance.router,
    layers.router,
    layers.roads_router,
    kpis.router,
    realtime.router,
    public.router,
):
    app.include_router(route)
