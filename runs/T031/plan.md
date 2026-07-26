The plan is written to `runs/T031/plan.md`. It covers:

- **Objective**: Docker Compose on a Linux VPS, two services (Spring Boot backend + nginx frontend), public URL documented.
- **Included**: `backend/Dockerfile`, `frontend/Dockerfile`, `nginx.conf`, `docker-compose.yml`, `.env.prod.example`, `docs/deployment.md`, a new `HealthController`, and a fix to `frontend/.env.production` so `VITE_API_BASE_URL` doesn't hard-code `localhost:8080` in production.
- **Persistence**: SQLite via named Docker volume, provider signature via host bind-mount; a conditional note for PDFs (stream vs. disk — Coder must verify).
- **Excluded**: TLS/HTTPS, CI/CD, scaling, monitoring, client signature workflow.
- **Acceptance criteria**: mirrors the ticket exactly with verifiable checks (health endpoint, CORS, data survival after restart, no secrets in git, end-to-end CRA workflow).
