The plan is written to `runs/T032/plan.md`. It targets two files:

- **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` to bind on all interfaces and prevent silent port switching.
- **`README.md`** — fix the pre-existing `npm start` → `npm run dev` bug and add an "Accessing from another device" subsection with IP discovery commands and the URL pattern.

The `frontend/vite.config.js` duplicate is noted as dead code (Vite resolves `.ts` first) but left out of scope.
