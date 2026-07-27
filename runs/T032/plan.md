Plan written to `runs/T032/plan.md`. Two files need to change:

1. **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }`.
2. **`README.md`** — fix `npm start` → `npm run dev` and add a section on finding the Tailscale/LAN IP and the `http://<IP>:5173` URL.
