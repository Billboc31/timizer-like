## Implementation summary

Implemented the SQLite persistence skeleton per the approved plan. All acceptance criteria were verified end-to-end (pytest 3/3 green, live `/health` = 200, override via `TIMIZER_DATABASE_URL` confirmed to redirect the DB file).

### Files created

- `backend/pyproject.toml` — runtime deps (`fastapi`, `uvicorn`, `sqlalchemy>=2`, `pydantic-settings`) + dev extra (`pytest`, `httpx`).
- `backend/app/__init__.py` — package marker.
- `backend/app/config.py` — `Settings` with `database_url` (env `TIMIZER_DATABASE_URL`, default `sqlite:///./var/timizer.db`, `.env` support).
- `backend/app/db.py` — `build_engine()`, module-level `engine`, `SessionLocal`, `Base(DeclarativeBase)`. `check_same_thread=False` applied only for SQLite URLs.
- `backend/app/main.py` — FastAPI app; `lifespan` opens/closes a connection at startup; `GET /health` runs `SELECT 1` and returns `{"status":"ok","database":"sqlite"}`.
- `backend/.env.example` — documents the override env var.
- `backend/var/.gitkeep` — keeps the default data directory tracked.
- `backend/tests/__init__.py`
- `backend/tests/test_db.py` — default-URL check + engine connects against `tmp_path` and executes `SELECT 1`.
- `backend/tests/test_health.py` — `TestClient` against a `tmp_path` DB (reloads `app.db` / `app.main` so the env var takes effect).
- `.gitignore` (root) — ignores `backend/var/*.db`, `backend/var/*.db-journal`, `backend/.env`.
- `docs/backend/database.md` — default path, override env var, local run command, reset procedure, SQLite-only scope.

### Verifications performed

- `pytest`: 3/3 pass (`test_settings_default_database_url`, `test_engine_connects_to_sqlite`, `test_health_returns_ok`).
- `uvicorn app.main:app` starts and creates `backend/var/timizer.db`; `curl /health` → `200 {"status":"ok","database":"sqlite"}`.
- With `TIMIZER_DATABASE_URL=sqlite:///./var/custom.db`, only `custom.db` is created; no `timizer.db`.
- `git check-ignore` confirms `backend/.env.example` and `backend/var/.gitkeep` are trackable.

### Assumptions & limits

- H1 confirmed: went with Python 3.11+ / FastAPI / SQLAlchemy 2.x as the plan hypothesised (no prior backend stack existed in the repo).
- H2 confirmed: no pre-existing backend code, so this ticket bootstraps the minimum skeleton.
- Local install was validated under Python 3.14 (the interpreter available in this environment); the declared floor is `>=3.11` per plan.
- No CRA symbols, no Alembic, no non-SQLite driver, no CI/Docker changes — kept strictly in-scope.
- `test_health.py` reloads `app.db` and `app.main` to make the env var take effect because `engine` is module-level; documented behaviour, not a change of design.

Ready for implementation review.
