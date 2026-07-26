The plan is written to `runs/T031/plan.md`. It covers:

- **SQLite JDBC**: add `sqlite-jdbc`, `hibernate-community-dialects`, and Actuator to `pom.xml`; new `application-prod.yml` Spring profile wiring SQLite datasource
- **Backend Dockerfile**: multi-stage Maven build → JRE 17 Alpine runtime, `SPRING_PROFILES_ACTIVE=prod`
- **Frontend Dockerfile**: multi-stage Node build (with empty `VITE_API_BASE_URL`) → nginx; `nginx.conf` proxies `/api/` to the backend service and falls back to `index.html` for SPA routing
- **docker-compose.yml**: two services, two named volumes (`sqlite_data`, `assets_data`) that survive restarts
- **`.env.example`**: documents all required variables; actual `.env` git-ignored
- **`docs/deployment.md`**: first-deploy, health-check, and update instructions
