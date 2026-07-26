Plan written to `runs/T031/plan.md`. Key decisions:

- **Two-container Docker setup** — backend (Spring Boot + SQLite) and frontend (nginx serving the Vite build), composed via `docker-compose.prod.yml`. This matches the tech stack without introducing a new runtime.
- **Named volumes** for `timizer-db` (SQLite at `/app/var`) and `timizer-assets` (signature at `/app/assets`) ensure data survives restarts and redeployments.
- **`VITE_API_BASE_URL` as Docker build arg** — baked at image build time (required by Vite); the frontend origin and backend URL are decoupled.
- **CORS config via `TIMIZER_CORS_ALLOWED_ORIGINS`** — allows the deployed frontend domain without hardcoding it.
- **Lightweight `GET /health`** — custom controller instead of adding Spring Boot Actuator as a new dependency.
- **PDFs don't need persistence** — they are generated on-demand from DB data; only the DB and signature asset require volumes.
