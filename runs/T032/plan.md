Plan written to `runs/T032/plan.md`. Three concrete changes:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }`.
2. **`README.md`** — document how to start the dev server and reach it via Tailscale/LAN IP.
3. **`docs/local-development.md`** (if present) — align network access documentation.

Everything out of scope (production, HTTPS, backend, firewall) is explicitly excluded.
