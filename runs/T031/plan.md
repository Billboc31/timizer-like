The plan has been written to `runs/T031/plan.md`. It covers:

- **Approach**: Docker Compose on a Linux VPS — two services (`frontend` nginx + `backend` Spring Boot), with nginx proxying `/api/` to the backend to eliminate CORS issues entirely.
- **New files**: `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`, `.env.prod.example`, `docs/deployment.md`, and a minimal `HealthController`.
- **One bug fix**: `httpClient.ts` uses `process.env.REACT_APP_API_BASE_URL` but Vite requires `import.meta.env.VITE_API_BASE_URL` — corrected in the plan.
- **Persistence**: SQLite via named Docker volume; provider signature via host bind-mount under `./data/assets/`.
- **Secrets**: all production values live in `.env.prod` (git-ignored); `.env.prod.example` is committed as the template.
