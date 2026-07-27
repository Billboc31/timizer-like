The plan is written to `runs/T032/plan.md`. It targets three files:

- **`frontend/vite.config.ts`** — add `server: { host: true, port: 5173, strictPort: true }`.
- **`README.md`** — fix `npm start` → `npm run dev` and add Tailscale/LAN URL discovery instructions.
- **`docs/local-development.md`** — same command fix, explicit port, and a new sub-section on accessing from another device.

One pre-existing issue surfaced: `README.md` and `docs/local-development.md` both say `npm start`, but no `start` script exists in `package.json` (only `dev`). The plan includes fixing this as part of the documentation update.
