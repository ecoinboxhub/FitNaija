from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.app.core.config import settings

# Setup async engine. Render PostgreSQL supports SSL, force ssl require in production
engine_args = {}
if settings.TARGET_ENV == "production":
    engine_args["connect_args"] = {"ssl": "require"}

engine = create_async_engine(settings.DATABASE_URL, **engine_args)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """FastAPI Dependency for database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
