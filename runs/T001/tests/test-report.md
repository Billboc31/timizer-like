---

# Test Report — T001: Configure local SQLite database

## Setup

- Backend has no repo-local venv, so I created a throwaway `.venv-test/` inside `backend/`, ran `pip install -e '.[dev]'`, executed all checks, then deleted the venv and any generated artifacts (DB file, `egg-info`, temp logs). No files under version control were modified.
- Resolved dependencies: `fastapi 0.139.0`, `sqlalchemy 2.0.51`, `pydantic-settings 2.14.2`, `httpx 0.28.1`, Python 3.14.4.

## Commands & results

### 1. Unit tests

```
.venv-test/bin/pytest -v
```

Result: **3 passed, 1 warning in 0.21s**
- `tests/test_db.py::test_settings_default_database_url` — PASS
- `tests/test_db.py::test_engine_connects_to_sqlite` — PASS
- `tests/test_health.py::test_health_returns_ok` — PASS

Warning is a benign `StarletteDeprecationWarning` about `httpx` in `starlette.testclient` from the installed FastAPI/Starlette version. Not related to this ticket.

### 2. Backend starts with default SQLite config

```
.venv-test/bin/uvicorn app.main:app --port 8765
curl http://127.0.0.1:8765/health
```

Result: `HTTP 200` → `{"status":"ok","database":"sqlite"}`. Default DB file created at `backend/var/timizer.db` on first startup, as documented.

### 3. Backend starts with overridden DB location

```
TIMIZER_DATABASE_URL="sqlite:///tmp/t001-custom-timizer-*.db" \
  .venv-test/bin/uvicorn app.main:app --port 8766
curl http://127.0.0.1:8766/health
```

Result: `HTTP 200` → `{"status":"ok","database":"sqlite"}`. The SQLite file was created at the custom path (`/tmp/t001-custom-timizer-43449.db`), confirming `TIMIZER_DATABASE_URL` is honored end-to-end (not just in the unit test).

### 4. Negative sanity check

Setting `TIMIZER_DATABASE_URL` to an unwritable path (`sqlite:////nonexistent/definitely/not/writable/xyz.db`) causes the lifespan startup probe to fail with `sqlite3.OperationalError: unable to open database file` and uvicorn exits. This confirms the URL is genuinely consumed by the engine — not silently ignored.

## Acceptance criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Backend can connect to SQLite | **PASS** | `test_engine_connects_to_sqlite` + live `/health` returning 200 with `"database":"sqlite"` |
| 2 | Database file location is configurable | **PASS** | `TIMIZER_DATABASE_URL` override created DB at custom path in live run; also covered by unit tests and `.env.example` |
| 3 | Local database configuration is documented | **PASS** | `docs/backend/database.md` covers default location, env var override, `.env` usage, run/reset instructions; `backend/.env.example` present |
| 4 | Backend starts successfully with SQLite enabled | **PASS** | uvicorn startup complete + lifespan check passes + `/health` responds 200 |
| 5 | Existing tests still pass | **PASS** | Full pytest suite: 3/3 pass |

## Regressions observed

None.

## Blocking issues

None.

## Non-blocking observations

- No repo-managed venv or lockfile is present; each contributor recreates deps from `pyproject.toml`. Documented in `docs/backend/database.md`, so out of scope for this ticket but worth flagging for future work if reproducibility matters.
- The Starlette/httpx deprecation warning surfaces during tests. Cosmetic; not caused by this ticket.

## Verdict

**Validated.** All five acceptance criteria are satisfied; implementation and documentation are consistent, and the unit tests are reinforced by a live end-to-end check with both the default and overridden DB URL.
