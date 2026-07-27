The plan is written to `runs/T032/plan.md`. It covers three files:

- `frontend/vite.config.ts` — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }`.
- `README.md` (root) — document IP-discovery commands and the `http://<IP>:5173` URL.
- `frontend/README.md` — align the stated dev server URL with the new binding.

Everything else (backend, HTTPS, firewall, Tailscale ACLs, production) is explicitly excluded.
