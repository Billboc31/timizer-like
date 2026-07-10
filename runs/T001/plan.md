## Objective

Provide a documented, configurable SQLite persistence layer for the backend so the application can start locally, open a connection to a SQLite database file, and be ready to receive future CRA-related schemas — without introducing any CRA entity, migration, or non-SQLite driver.

## Included

Hypotheses (explicit — to be confirmed by the Coder before implementation):

- H1: The backend stack is Python 3.11+ with FastAPI and SQLAlchemy 2.x. If a different stack has already been chosen (e.g. NestJS/Prisma), the same plan applies with equivalent artefacts (`ormconfig`, `DataSource`, `.env`) and the Coder must adapt file paths accordingly.
- H2: There is no backend code yet in the repository. This ticket therefore bootstraps the minimal backend skeleton required to prove a SQLite connection. Only the files listed below are created.
- H3: The default database file lives under `backend/var/timizer.db` (git-ignored). The path is overridable via an environment variable.

Changes to create:

- `backend/pyproject.toml` — declare runtime deps (`fastapi`, `uvicorn`, `sqlalchemy>=2`, `pydantic-settings`) and dev deps (`pytest`).
- `backend/app/__init__.py` — empty package marker.
- `backend/app/config.py` — `Settings` class (pydantic-settings) exposing `database_url: str` with default `sqlite:///./var/timizer.db`, environment variable `TIMIZER_DATABASE_URL`, `.env` file support.
- `backend/app/db.py` — build the SQLAlchemy `Engine` from `settings.database_url`, expose `SessionLocal` (sessionmaker) and `Base` (`DeclarativeBase`). Pass `connect_args={"check_same_thread": False}` only when the URL starts with `sqlite`.
- `backend/app/main.py` — minimal FastAPI app with a startup hook that opens/closes one connection to prove connectivity (`engine.connect()` inside a `try/finally`), and a `GET /health` endpoint returning `{"status": "ok", "database": "sqlite"}` after a `SELECT 1`.
- `backend/.env.example` — documents `TIMIZER_DATABASE_URL=sqlite:///./var/timizer.db`.
- `backend/var/.gitkeep` — ensure the default data directory exists.
- `backend/tests/__init__.py` — empty.
- `backend/tests/test_db.py` — two tests:
  1. `test_settings_default_database_url` — asserts default URL when env var is unset.
  2. `test_engine_connects_to_sqlite` — instantiate the engine against a temporary path (via `tmp_path` and monkeypatched env var), open a connection, execute `SELECT 1`, assert result. No CRA table is created.
- `backend/tests/test_health.py` — spin up the FastAPI app with `TestClient`, hit `/health`, expect 200 and `status == "ok"`.
- `.gitignore` (root) — append `backend/var/*.db`, `backend/var/*.db-journal`, `backend/.env`.
- `docs/backend/database.md` — short page documenting: default file location, how to override via `TIMIZER_DATABASE_URL`, how to run the backend locally (`uvicorn app.main:app --reload` from `backend/`), how to reset the DB (delete the file), and confirmation that only SQLite is supported at this stage.

Existing tests: none in the repository today. The "Existing tests still pass" acceptance criterion is honoured trivially; the plan preserves this by not touching any code outside `backend/` and the root `.gitignore` / `docs/`.

## Excluded

- Any CRA entity, table, model, schema, or endpoint.
- Alembic setup or any migration tooling (including autogenerate). Table creation is intentionally deferred to the ticket that introduces the first entity.
- PostgreSQL, MySQL, or any non-SQLite dialect. The engine helper stays SQLite-agnostic in shape, but no other driver is installed or tested.
- Cloud deployment concerns (managed DB, secrets manager, connection pooling tuning beyond SQLAlchemy defaults).
- Frontend code, UI wiring, or API contracts beyond `/health`.
- Authentication, authorisation, CORS configuration beyond FastAPI defaults.
- Docker / Compose files.
- CI configuration changes.

## Acceptance criteria

- Running `uvicorn app.main:app` from `backend/` starts the server without error and creates `backend/var/timizer.db` on first startup.
- `GET /health` responds `200` with a JSON body containing `"status": "ok"` and confirms a successful `SELECT 1` against SQLite.
- Setting `TIMIZER_DATABASE_URL=sqlite:///./var/custom.db` before startup causes the backend to use `custom.db` instead of the default file, and no other file is created.
- `pytest backend/tests` passes; both `test_settings_default_database_url` and `test_engine_connects_to_sqlite` and `test_health` are green.
- `docs/backend/database.md` exists and documents: the default path, the override environment variable, the local run command, and the reset procedure.
- `.gitignore` prevents committing `backend/var/*.db` and `backend/.env`; `backend/var/.gitkeep` is tracked.
- No file outside `backend/`, `docs/backend/`, and the root `.gitignore` is modified. No CRA-related symbol (`cra`, `report`, `activity`) appears in any created file.
