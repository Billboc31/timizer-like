The plan is written to `runs/T032/plan.md`. It targets three configuration/documentation changes:

1. **`frontend/vite.config.ts`** — add `server: { host: true, port: 5173, strictPort: true }` to bind on all interfaces and enforce the port.
2. **`docs/local-development.md`** — fix `npm start` → `npm run dev` (pre-existing bug: no `start` script exists), and add a sub-section on finding and using the LAN/Tailscale URL.
3. **`README.md`** and **`frontend/README.md`** — same command fix plus a brief pointer to the LAN/Tailscale instructions.
