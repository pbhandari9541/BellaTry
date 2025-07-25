from functools import lru_cache
from app.services.openai_service import OpenAIService
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import os

@lru_cache()
def get_openai_service() -> OpenAIService:
    """
    Get or create a cached OpenAIService instance
    
    Returns:
        OpenAIService: Singleton instance of OpenAIService
    """
    return OpenAIService()

# --- Add async session dependency for SQLAlchemy ---
# Lazy initialization to prevent import-time errors
engine = None
async_session_maker = None

def _get_database_engine():
    global engine, async_session_maker
    if engine is None:
        DATABASE_URL = os.getenv("SUPABASE_DB_URL")
        if not DATABASE_URL:
            raise ValueError("SUPABASE_DB_URL environment variable is not set")
        
        engine = create_async_engine(
            DATABASE_URL,
            echo=False,
            future=True,
            #connect_args={"statement_cache_size": 0},
            pool_size=20,         # Increased pool size for tests and dev
            max_overflow=40,      # Allow more overflow connections
        )
        async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    return engine, async_session_maker

async def get_async_session() -> AsyncSession:
    _, session_maker = _get_database_engine()
    async with session_maker() as session:
        yield session 