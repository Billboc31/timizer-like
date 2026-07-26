All 6 new files are present and `.gitignore` is updated. Implementation complete.

---

## Summary

**Files created:**

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Python 3.11-slim image; installs package with `pip install -e .`; starts uvicorn on port 8000 |
| `frontend/Dockerfile` | Node 20 build stage → nginx 1.27-alpine serve stage |
| `frontend/nginx.conf` | Proxies `/health` and `/api/` to `backend:8000`; SPA fallback for all other paths |
| `docker-compose.prod.yml` | Two services (`frontend` on port 80, `backend` internal); two named volumes (`timizer-db` → `/app/var`, `timizer-assets` → `/app/assets`) |
| `.env.production.example` | Documents `TIMIZER_DATABASE_URL` and `TIMIZER_PROVIDER_SIGNATURE_PATH` with comments |
| `docs/deployment.md` | First-deploy checklist, health check command, update procedure, production URL placeholder |

**File modified:**

- `.gitignore` — added `.env.production` entry to keep secrets out of the repo

**No existing source files were touched.**

**Known limits (from plan):**
- CRA business routes don't exist in the Python backend yet; the full workflow cannot be exercised until they are implemented (out of scope for T031)
- Production URL placeholder in `docs/deployment.md` must be filled in once a VPS is provisioned
