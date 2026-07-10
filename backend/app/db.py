from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import Settings, get_settings


class Base(DeclarativeBase):
    pass


def build_engine(settings: Settings | None = None) -> Engine:
    settings = settings or get_settings()
    url = settings.database_url
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=connect_args, future=True)


engine: Engine = build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
