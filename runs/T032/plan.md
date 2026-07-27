`runs/T032/plan.md` is written. The plan covers:

- **One config change**: `frontend/vite.config.ts` gets `server: { host: '0.0.0.0', port: 5173, strictPort: true }` — the minimal Vite change needed.
- **Two doc updates**: root `README.md` and `frontend/README.md` gain instructions for finding the host IP and the remote URL.
- No package changes, no test changes, no build changes.
