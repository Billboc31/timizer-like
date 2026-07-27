The plan is written to `runs/T032/plan.md`. It covers three files:

- **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` to bind to all interfaces and hard-fail on port conflict.
- **`frontend/README.md`** — add a remote-access subsection with IP-discovery commands and URL format; correct `npm start` → `npm run dev`.
- **`README.md`** (root) — correct the same command inconsistency and point to `frontend/README.md` for remote-access instructions.

No other files or layers are touched. The `strictPort: true` flag satisfies the "fail clearly rather than silently switching" acceptance criterion.
