import asyncio
import pytest
import pytest_asyncio
import httpx
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import text

from app.core.config import settings
from app.core.database import Base
from app.core.deps import get_db
from app.main import app

# SQLite in-memory via StaticPool: single shared connection, no file I/O, instant.
# StaticPool is required for SQLite in-memory so all operations share one connection.
_test_engine = create_async_engine(
    settings.TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestSessionLocal = async_sessionmaker(
    _test_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """
    Sync session fixture. Uses asyncio.run() so table creation runs in its own
    temporary event loop — fully isolated from individual test event loops.
    """
    async def _create():
        async with _test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def _drop():
        async with _test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

    asyncio.run(_create())
    yield
    asyncio.run(_drop())


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    async with _TestSessionLocal() as session:
        yield session
        # SQLite: DELETE clears rows; INTEGER PRIMARY KEY (no AUTOINCREMENT)
        # resets to 1 on next insert when the table is empty.
        # Order matters: child tables before parent tables (FK constraints).
        await session.execute(text("DELETE FROM order_items"))
        await session.execute(text("DELETE FROM orders"))
        await session.execute(text("DELETE FROM products"))
        await session.execute(text("DELETE FROM users"))
        await session.execute(text("DELETE FROM categories"))
        await session.commit()


@pytest_asyncio.fixture
async def async_client(db_session: AsyncSession) -> httpx.AsyncClient:
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        yield client
    app.dependency_overrides.clear()
