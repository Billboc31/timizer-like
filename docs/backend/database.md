# Backend — Local SQLite database

The backend uses a local SQLite file for development and personal usage.
Only SQLite is supported at this stage; PostgreSQL and other dialects are out of scope.

## Default location

The default database file is `backend/var/timizer.db` (relative to the `backend/`
directory). The `backend/var/` directory is tracked via a `.gitkeep` marker, but
`*.db` and `*.db-journal` files are git-ignored.

## Overriding the location

The database URL is read from the `TIMIZER_DATABASE_URL` environment variable.
It can be set directly in the environment or provided through a `backend/.env`
file (see `backend/.env.example`).

Examples:

```bash
export TIMIZER_DATABASE_URL="sqlite:///./var/custom.db"
```

```bash
# backend/.env
TIMIZER_DATABASE_URL=sqlite:///./var/custom.db
```

The URL must be a SQLAlchemy-compatible SQLite URL
(`sqlite:///relative/path.db` or `sqlite:////absolute/path.db`).

## Running the backend locally

From the `backend/` directory:

```bash
pip install -e '.[dev]'
uvicorn app.main:app --reload
```

On first startup the SQLite file is created at the configured location. The
`/health` endpoint returns `{"status": "ok", "database": "sqlite"}` once a
`SELECT 1` succeeds against the database.

## Resetting the local database

Stop the backend, then delete the database file:

```bash
rm backend/var/timizer.db
```

The next startup will recreate an empty file at the configured location.

## Running the tests

From the `backend/` directory:

```bash
pytest
```
