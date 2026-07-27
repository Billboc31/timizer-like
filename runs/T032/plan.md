Plan written to `runs/T032/plan.md`. Three files change:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` to the existing `defineConfig`.
2. **`README.md`** — extend the "Run the frontend" section with Tailscale/LAN IP discovery commands and the `http://<IP>:5173` URL pattern.
3. **`docs/local-development.md`** — extend section 5 with the same remote-access instructions and a note about `strictPort` failing clearly on port conflict.

Everything else (backend, HTTPS, firewall, Tailscale ACLs, production) is explicitly excluded.
