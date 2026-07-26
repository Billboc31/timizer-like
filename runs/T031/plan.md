The plan is written to `runs/T031/plan.md`. It covers:

- **Backend Dockerfile** — multi-stage Maven → JRE 17 build, all config from env vars.
- **Frontend Dockerfile + nginx.conf** — Node build with `VITE_API_BASE_URL=""` → Nginx serving static files and proxying `/api` to the backend container.
- **`docker-compose.yml`** — two services, two named volumes (`db-data`, `assets-data`) that survive restarts.
- **`.env.example`** — documents all required variables; actual `.env` is already git-ignored.
- **Spring Boot Actuator** — `spring-boot-starter-actuator` added to `pom.xml`, health endpoint exposed at `/api/actuator/health`.
- **`docs/deployment.md`** — first-deploy, health-check, and update instructions with the public URL.

Key assumption flagged: the plan notes that the PDF output path must be confirmed against `CraPdfGenerator` before coding, to ensure the volume mounts cover it.
