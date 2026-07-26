Plan written to `runs/T031/plan.md`. Here's a summary of what it covers:

**Approach**: Docker Compose on a Linux VPS — the simplest path that satisfies all acceptance criteria without provider lock-in.

**Key decisions**:
- Two containers: `frontend` (nginx serving `dist/`) and `backend` (Spring Boot JAR). nginx proxies `/api/` to the backend, eliminating CORS issues and letting `VITE_API_BASE_URL` be a simple relative path.
- SQLite and the provider signature are bind-mounted from `./data/` on the host, so they survive restarts and redeployments.
- A minimal `GET /api/health` controller (no Actuator dependency) satisfies the health-check requirement.
- `.env.prod` holds all secrets and is git-ignored; `.env.prod.example` is committed as a template.
- No test changes — existing `mvnw test` and `npm test` suites must stay green.
