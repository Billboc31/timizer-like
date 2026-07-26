The plan is written to `runs/T031/plan.md`. It covers:

- **Backend Dockerfile** — multi-stage Maven → JRE 17 build; SQLite and signature paths via env vars; Actuator health endpoint wired in `application-prod.yml`.
- **Frontend Dockerfile** — multi-stage Vite build → Nginx; `VITE_API_BASE_URL` injected as a build arg; nginx proxies `/api/` to the backend so SPA and API share one origin.
- **docker-compose.yml** — two services with named volumes `timizer-db` (SQLite persistence) and `timizer-assets` (provider signature persistence).
- **.env.example** — all required production variables, never committed.
- **docs/deployment.md** — first-deploy, update, and verification steps with the health-check URL.

PDFs are generated on demand from DB records, so the SQLite volume covers both data and PDF regeneration — no separate PDF volume needed.
