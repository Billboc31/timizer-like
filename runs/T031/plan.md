The plan is written to `runs/T031/plan.md`. It covers:

- **SQLite production datasource**: add `sqlite-jdbc`, `hibernate-community-dialects`, and Actuator to `pom.xml`; configure the datasource in `application.yml`; isolate H2 to the test profile.
- **CORS**: a `WebMvcConfig` class with allowed origins driven by env var.
- **Two Dockerfiles** (multi-stage): backend (Maven → JRE) and frontend (Node build → Nginx).
- **docker-compose.yml** with named volumes for the SQLite DB file and provider signature asset, ensuring persistence across restarts.
- **`.env.example`** at project root documenting every required variable.
- **`docs/deployment.md`** covering initial setup, update procedure, health check, and volume backup.
