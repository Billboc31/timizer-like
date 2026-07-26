The plan has been written to `runs/T031/plan.md`. It covers:

- **Objective** — Docker Compose with two services (Nginx-fronted React build + Spring Boot), named volumes for persistence, documented public URL.
- **Included** — `Dockerfile.backend`, `Dockerfile.frontend`, `nginx.conf`, `docker-compose.yml`, `.env.example`, a Spring Actuator health endpoint, `frontend/.env.production` (empty `VITE_API_BASE_URL` for nginx proxying), and `docs/deployment.md`.
- **Excluded** — TLS, CI/CD, scaling, monitoring, client signature workflow, cloud-specific infrastructure.
- **Acceptance criteria** — mirrors the ticket's criteria with concrete, verifiable checks (health endpoint, data survival after restart, no secrets in git, end-to-end CRA workflow).
