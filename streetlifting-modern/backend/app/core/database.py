from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.config import settings
from app.core.base import Base

SQLALCHEMY_DATABASE_URL = settings.database_url

# Create engine with SQLite-specific parameters
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# For async operations (if using PostgreSQL)
async_engine = None
if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    async_database_url = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    async_engine = create_async_engine(async_database_url)


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db():
    """Dependency to get async database session"""
    if async_engine:
        async with AsyncSession(async_engine) as session:
            yield session
    else:
        # Fallback to sync for SQLite
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close() 