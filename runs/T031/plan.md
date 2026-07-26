The plan is written to `runs/T031/plan.md`. It covers:

- **Objective**: Docker + docker-compose deployment with named volumes for SQLite and asset persistence, nginx reverse-proxy for the frontend, and externalized secrets via `.env`.
- **Included** (8 deliverables): `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`, `.env.example`, `application-production.yml`, Actuator in `pom.xml`, and `docs/deployment.md`.
- **Excluded**: TLS, CI/CD, multi-env, FastAPI backend, monitoring, scaling, client signature workflow.
- **Acceptance criteria**: 10 verifiable conditions covering startup, health check, data persistence across `down/up` cycles, secrets hygiene, passing tests, and documentation completeness.
