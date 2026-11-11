from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.db import check_database

router = APIRouter(tags=["Salud del servicio"])


@router.get("/api/health")
async def health() -> dict:
    try:
        database_ok, postgis_ok = await check_database()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail={"status": "degraded", "db": "unavailable", "postgis": "unknown"},
        ) from None
    result = {
        "status": "ok" if database_ok and postgis_ok else "degraded",
        "db": "ok" if database_ok else "unavailable",
        "postgis": "ok" if postgis_ok else "missing",
    }
    if not postgis_ok:
        raise HTTPException(status_code=503, detail=result)
    return result
