Plan written to `runs/T032/plan.md`. It covers five touch points:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }`.
2. **`frontend/vite.config.js`** — same block (both configs coexist, must stay consistent).
3. **`docs/local-development.md`** — subsection in section 5 explaining how to discover the Tailscale/LAN IP and connect remotely.
4. **`README.md`** — mention the remote URL and point to local-development.md.
5. **`frontend/README.md`** — one-line note about network reachability.
