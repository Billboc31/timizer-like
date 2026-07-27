Plan written to `runs/T032/plan.md`. Three files are targeted:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }`
2. **`frontend/README.md`** — document how to find the Tailscale/LAN IP and the external URL
3. **`README.md` (root)** — fix the stale `npm start` command and cross-reference the remote-access docs

`vite.config.js` is left untouched since the `.ts` file takes precedence. Everything outside the three files (backend, production, firewall, HTTPS) is explicitly out of scope.
