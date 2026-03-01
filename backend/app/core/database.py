from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class _LazyAsyncSessionLocal:
    """Defers asyncpg import until first database call.

    ``create_async_engine`` with a ``postgresql+asyncpg://`` URL imports asyncpg
    at module load time.  On Python 3.14 + Windows with an unresponsive WMI
    service, asyncpg's compiled extension hangs indefinitely during import.
    By deferring engine creation to first use, tests (which override ``get_db``)
    never trigger the asyncpg import at collection time.
    """

    _factory: async_sessionmaker | None = None

    def _ensure(self) -> async_sessionmaker:
        if self._factory is None:
            from sqlalchemy.ext.asyncio import create_async_engine

            from app.core.config import settings

            _engine = create_async_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                connect_args={"ssl": True},
            )
            self._factory = async_sessionmaker(
                _engine,
                class_=AsyncSession,
                expire_on_commit=False,
            )
        return self._factory

    def __call__(self) -> AsyncSession:
        return self._ensure()()


AsyncSessionLocal = _LazyAsyncSessionLocal()
