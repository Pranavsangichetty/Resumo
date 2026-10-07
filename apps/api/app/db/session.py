from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.base import Base


connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def init_db() -> None:
    # Ensure all models are registered with Base metadata
    from app.models.user import User  # noqa: F401
    from app.models.resume import Resume  # noqa: F401
    from app.models.application import Application  # noqa: F401
    try:
        from app.models.user_settings import UserSettings  # noqa: F401
    except ImportError:
        pass

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()