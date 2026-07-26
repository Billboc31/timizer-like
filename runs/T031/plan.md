The plan is written to `runs/T031/plan.md`. It covers:

- **Backend** — multi-stage `Dockerfile` (Maven → JRE 17), `application-prod.yml` with Actuator health, SQLite path and CORS via env vars.
- **Frontend** — multi-stage `Dockerfile` (Vite → Nginx), `nginx.conf` proxying `/api/` to the backend so both share one origin.
- **Orchestration** — `docker-compose.yml` with two named volumes (`timizer-db` for SQLite, `timizer-assets` for the provider signature) and `.env.example` listing every required variable.
- **Docs** — `docs/deployment.md` covering first-deploy, update, and verification steps.
- **Key clarification** — PDFs are generated on demand from DB records, so SQLite volume persistence satisfies both the data and PDF criteria without a separate PDF volume.
