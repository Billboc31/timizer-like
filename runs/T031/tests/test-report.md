I have all the information needed. Let me write the test report.

---

# Test Report — T031 Deploy the Application

## Context

The implementation deploys a Python/FastAPI stub (health-only, SQLite) and a React/nginx frontend via Docker Compose. The repository also contains the real Spring Boot Java backend (`backend/src/main/java/`), which was not containerized.

---

## Acceptance Criteria — Results

### ✅ AC: The backend starts with production configuration

`docker-compose.prod.yml` applies `env_file: .env.production` to the backend service. `backend/app/config.py` reads `TIMIZER_DATABASE_URL` via `pydantic-settings`. The FastAPI process starts with uvicorn (no `--reload`).

**PASS**

---

### ✅ AC: SQLite data survives application restarts and redeployments

`docker-compose.prod.yml` declares named volume `timizer-db` mounted at `/app/var` on the backend. `down` + `up -d` preserves the volume. `docs/deployment.md` confirms volumes are not removed by `up -d`.

**PASS**

---

### ✅ AC: Provider signature asset remains available after restart

Named volume `timizer-assets` mounted at `/app/assets`. `docs/deployment.md` includes a step to copy the signature file into the volume before first deploy.

**PASS** (with the known minor note that `TIMIZER_PROVIDER_SIGNATURE_PATH` is not consumed by `config.py`).

---

### ✅ AC: Sensitive configuration is not committed to the repository

`.gitignore` line 7: `.env.production`. `.env.production.example` is committed and contains no secrets. Verified via `git -C ... diff --name-only`: no `.env.production` in the diff.

**PASS**

---

### ✅ AC: A health or status check confirms that the backend is operational

`backend/app/main.py:22` — `GET /health` executes `SELECT 1` against SQLite and returns `{"status": "ok", "database": "sqlite"}`. Tested via `test_health_returns_ok`.

**PASS**

---

### ✅ AC: Deployment and update instructions are documented

`docs/deployment.md` contains: first-deploy checklist (clone → env file → signature copy → `up -d`), health check command, update procedure (`git pull` → `build` → `up -d`), stop procedure. All steps use `docker compose -f docker-compose.prod.yml`.

**PASS**

---

### ⚠️ AC: The frontend is accessible from a documented production URL

`docs/deployment.md` line 5 contains a TODO placeholder: `> TODO: Replace this placeholder with the actual VPS public URL once provisioned.` No real URL is provided.

The infrastructure (nginx on port 80, React `dist/` served) is correct; the URL depends on VPS provisioning. The plan acknowledged this limitation.

**PARTIAL** — URL is not yet documented; AC requires a documented URL.

---

### ❌ AC: The frontend can communicate with the deployed backend

`nginx.conf` proxies `location /api/` and `location /health` to `http://backend:8000`.

The Python FastAPI application (`backend/app/main.py`) only exposes `GET /health`. It has **no `/api/` routes**. CRA calls from the frontend (`GET /api/cras`, `POST /api/cra`, `GET /api/cras/:id/pdf`) will all return **404** from the FastAPI app.

The Spring Boot backend (`backend/src/main/java/`) which implements all CRA controllers is **not containerized** and is not part of the Docker Compose deployment.

**FAIL** — The frontend cannot complete any CRA API call against the deployed backend.

---

### ❌ AC: The full CRA workflow can be completed in the deployed environment

Same root cause as above. The deployed backend (Python FastAPI) has no business logic routes. The `CraController`, `CraDayController`, `CraPdfDownloadController`, and related services exist only in the undeployed Spring Boot application.

The plan explicitly excluded CRA routes from the Python backend, acknowledging this criterion could not be met. The review approved the implementation despite this unresolved AC.

**FAIL** — Critical. The CRA workflow cannot function in the deployed environment.

---

### ⚠️ AC: Existing tests still pass

| Suite | Command | Result |
|---|---|---|
| Python FastAPI | `cd backend && pytest tests/ -v` | **3/3 PASS** |
| Frontend | `cd frontend && npm test -- --run` | **61/61 PASS** |
| Spring Boot | `cd backend && mvn test` | **FAIL — compilation error** |

Spring Boot compilation error (`pre-existing, introduced by T022 — not by T031`):

```
CraDayUpdateService.java:67 — constructor CraDetailsDto cannot be applied:
  required: 14 args (CraDetailsDto was extended in T022)
  found: 8 args (CraDayUpdateService was not updated)
```

**PARTIAL** — Frontend and Python tests pass; Spring Boot backend does not compile. The regression pre-dates T031 but the AC "existing tests still pass" is not satisfied.

---

## Summary

| # | Criterion | Status |
|---|---|---|
| 1 | Frontend accessible from documented URL | ⚠️ PARTIAL (URL is a TODO placeholder) |
| 2 | Frontend can communicate with deployed backend | ❌ FAIL |
| 3 | Backend starts with production configuration | ✅ PASS |
| 4 | SQLite data survives restarts | ✅ PASS |
| 5 | PDF files and provider signature survive restart | ✅ PASS |
| 6 | Sensitive configuration not committed | ✅ PASS |
| 7 | Health check confirms backend operational | ✅ PASS |
| 8 | Deployment and update instructions documented | ✅ PASS |
| 9 | Full CRA workflow can be completed | ❌ FAIL |
| 10 | Existing tests still pass | ⚠️ PARTIAL (Spring Boot fails to compile) |

## Blocking Issues

1. **The deployed backend is the Python stub, not the Spring Boot application.** All CRA API routes (`/api/cras`, `/api/cra`, `/api/cras/:id/pdf`) return 404 from the deployed backend. The full CRA workflow cannot run.

2. **Spring Boot backend does not compile** (`CraDayUpdateService.java:67` — `CraDetailsDto` constructor arity mismatch). This regression originates from T022 and was not addressed in T031.

## Decision

**VALIDATION REFUSED**

Two acceptance criteria fail (AC #2 and #9) and two are partial (AC #1 and #10). The core deployment goal — making the CRA workflow available in a production environment — is not met because the backend with CRA routes was not containerized.
