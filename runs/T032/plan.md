Plan written to `runs/T032/plan.md`. It covers three touch points:

1. **`frontend/vite.config.ts`** — add `server: { host: true, port: 5173, strictPort: true }` to bind all interfaces and prevent silent port fallback.
2. **`frontend/vite.config.js`** — same block (both configs exist; they must stay consistent).
3. **`frontend/README.md`** and root **`README.md`** — document how to discover the Tailscale/LAN IP and form the remote URL.
