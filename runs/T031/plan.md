The plan has been written to `runs/T031/plan.md`. It covers:

- **Objective**: Docker Compose deployment with persistent data, externalized config, and a public URL.
- **Included**: SQLite JDBC + Hibernate dialect for Spring Boot, Actuator health endpoint, two Dockerfiles (backend multi-stage Maven→JRE, frontend Node→Nginx), `docker-compose.yml` with a named volume for SQLite and the signature asset, `.env.example`, and `docs/deployment.md`.
- **Excluded**: TLS, DNS, CI/CD, multi-env, FastAPI backend, monitoring, scaling.
- **Acceptance criteria**: 10 verifiable conditions covering startup, health check, persistence, config safety, tests, and documentation.
