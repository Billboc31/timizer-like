The plan has been written to `runs/T031/plan.md`. It covers:

- **7 new files**: `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`, `.env.production.example`, `HealthController.java`, `docs/deployment.md`.
- **2 modified files**: `.gitignore` (add `.env.production`), `backend/src/main/resources/application.yml` (verify env var bindings).
- **Key design decisions**: Nginx proxies `/api/` to the backend so frontend and API share one origin (no CORS needed); SQLite and provider signature persist in named Docker volumes; PDFs are generated on demand so no separate PDF volume is required.
