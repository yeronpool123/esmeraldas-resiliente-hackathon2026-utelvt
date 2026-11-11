from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings


@lru_cache
def get_engine():
    return create_async_engine(
        get_settings().database_url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=5,
    )


@lru_cache
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(get_engine(), expire_on_commit=False)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    async with get_session_factory()() as session:
        yield session


async def check_database() -> tuple[bool, bool]:
    async with get_session_factory()() as session:
        await session.execute(text("SELECT 1"))
        postgis = await session.scalar(
            text("SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis')")
        )
    return True, bool(postgis)
