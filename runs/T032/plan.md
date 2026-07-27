Plan written to `runs/T032/plan.md`. It covers four targeted changes:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }`.
2. **`frontend/vite.config.js`** — same server block for consistency.
3. **Root `README.md`** — add network URL docs and correct `npm start` → `npm run dev`.
4. **`frontend/README.md`** — note the new network-accessible URL.

Everything else (backend, production, HTTPS, firewall, Tailscale ACLs) is explicitly excluded.
