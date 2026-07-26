The plan is written to `runs/T031/plan.md`. It covers:

- **Objective**: Docker Compose deployment with two services, named volumes for SQLite persistence, PDFs, and the provider signature, plus externalized configuration.
- **Included**: SQLite JDBC driver + Hibernate dialect for the backend, a `GET /api/health` controller, two multi-stage Dockerfiles (Maven→JRE for backend, Node→Nginx for frontend), `docker-compose.yml` with named volumes, `.env.example`, and `docs/deployment.md`.
- **Excluded**: TLS/DNS, CI/CD, multi-env, FastAPI backend, monitoring, scaling, client signature workflow.
- **Acceptance criteria**: 11 verifiable conditions covering startup, health check, data persistence across restarts and `down/up` cycles, config safety, passing tests, and documentation completeness.
