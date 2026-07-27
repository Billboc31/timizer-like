The plan has been written to `runs/T032/plan.md`. It targets three files:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` to bind on all interfaces and enforce the port (failing clearly if 5173 is taken).
2. **`README.md`** — add instructions for finding the Tailscale/LAN IP and the external URL.
3. **`frontend/README.md`** — update the localhost-only reference to mention external access.
