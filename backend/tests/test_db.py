import pytest
from sqlalchemy import text

from app.config import Settings
from app.db import build_engine


def test_settings_default_database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("TIMIZER_DATABASE_URL", raising=False)
    settings = Settings(_env_file=None)
    assert settings.database_url == "sqlite:///./var/timizer.db"


def test_engine_connects_to_sqlite(
    monkeypatch: pytest.MonkeyPatch, tmp_path
) -> None:
    db_file = tmp_path / "timizer-test.db"
    monkeypatch.setenv("TIMIZER_DATABASE_URL", f"sqlite:///{db_file}")

    settings = Settings(_env_file=None)
    engine = build_engine(settings)

    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1")).scalar_one()

    assert result == 1
    assert db_file.exists()
