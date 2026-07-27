Plan written to `runs/T032/plan.md`. It covers three changes:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` to bind on all interfaces, fix the port, and fail loudly if the port is taken.
2. **`README.md`** — document the network URL and how to find the host's Tailscale/LAN IP.
3. **`docs/local-development.md`** — same network access instructions for the docs audience.

Everything else (backend, production, HTTPS, firewall, Tailscale ACLs) is explicitly excluded.
