The plan is written to `runs/T031/plan.md`. It covers:

- **Backend changes**: add Actuator for `/actuator/health`, env-var-bindable datasource URL, a two-stage `Dockerfile`.
- **Frontend changes**: two-stage `Dockerfile` (Node build → Nginx serve) with a `nginx.conf` that handles React Router rewrites.
- **Orchestration**: `docker-compose.yml` at the repo root with named volumes for SQLite persistence and the provider signature asset.
- **Documentation**: `docs/deployment.md` with first-deployment, health-check, update, and backup instructions.
- **Out of scope**: TLS, DNS, CI/CD, scaling, monitoring, client signature, Python backend.
