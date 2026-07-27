## Objective
Package the React/Vite frontend and Python/FastAPI backend as Docker containers and deploy them with Docker Compose on a single Linux VPS, using named volumes to persist the SQLite database and the provider signature asset across restarts and redeployments.

## Included

**New files to create:**

- `backend/Dockerfile` — production image: Python 3.11-slim base, installs `backend/` package via `pip install -e .`, starts uvicorn on port 8000 without `--reload`
- `frontend/Dockerfile` — multi-stage: Node 20 build stage runs `npm ci && npm run build`, nginx 1.27-alpine serve stage copies `dist/` to `/usr/share/nginx/html`
- `frontend/nginx.conf` — nginx server block: serves Vite static files, proxies known API paths (`/health` and any other backend route prefixes) to `http://backend:8000`, serves `index.html` as SPA fallback for all other paths
- `docker-compose.prod.yml` (repository root) — two services: `frontend` (port 80) and `backend` (internal port 8000, not exposed); two named volumes: `timizer-db` mounted at `/app/var` in backend, `timizer-assets` mounted at `/app/assets` in backend; `env_file: .env.production`
- `.env.production.example` (repository root) — template listing every required variable: `TIMIZER_DATABASE_URL` and `TIMIZER_PROVIDER_SIGNATURE_PATH`, with comments explaining each
- `docs/deployment.md` — first-deploy checklist, update procedure, production URL placeholder, health check command

**`.gitignore` addition:** `.env.production`

**No modifications to existing source files.**

## Excluded

- Implementing CRA business routes in the Python backend (AC "full CRA workflow" cannot be verified until those routes exist)
- TLS/HTTPS termination, CI/CD, multi-environment, scaling/HA, monitoring
- Fixing the `REACT_APP_API_BASE_URL` / `VITE_API_BASE_URL` mismatch in `httpClient.ts` (empty-string fallback works via same-origin nginx proxy)
- PDF file storage on disk (PDFs are generated on-demand and returned directly)

## Acceptance criteria

- Both containers start cleanly; `GET /health` returns `{"status":"ok","database":"sqlite"}`
- React app loads at the production URL in a browser
- `timizer-db` volume survives `down` + `up -d`; SQLite content is intact
- `timizer-assets` volume survives image rebuild + redeploy; provider signature remains present
- `.env.production` is gitignored; no secrets in committed files
- `docs/deployment.md` contains the production URL, first-deploy checklist, update command, and health check
- `cd backend && pytest` passes without modification
