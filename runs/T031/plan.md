The plan has been written to `runs/T031/plan.md`. It covers:

- **Dockerfiles** for both backend (multi-stage Maven → JRE) and frontend (multi-stage Vite → nginx)
- **nginx reverse proxy** routing `/api/` to the backend, so `VITE_API_BASE_URL` can be empty and both services share one origin
- **Named Docker volumes** for the SQLite DB (`timizer-db`) and signature asset (`timizer-assets`) to survive restarts
- **CORS configuration** via a new `CorsConfig.java` bean reading `TIMIZER_CORS_ALLOWED_ORIGINS`
- **Health endpoint** `GET /health` (new controller if not already present, no Actuator dependency)
- **`.env.prod.example`** and `.gitignore` update to keep secrets out of the repo
- **`docs/deployment.md`** for deployment and update instructions
