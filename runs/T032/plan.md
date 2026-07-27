Plan written to `runs/T032/plan.md`. It targets two files:

- **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` to bind on all interfaces and prevent silent port fallback.
- **`README.md`** — replace `npm start` with `npm run dev` and add an "Access from another device" subsection with IP discovery commands and the URL pattern.
