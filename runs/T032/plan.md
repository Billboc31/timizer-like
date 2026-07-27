The plan is written to `runs/T032/plan.md`. It covers three files:

- **`frontend/vite.config.ts`** — add `server: { host: '0.0.0.0', port: 5173, strictPort: true }` alongside the existing `test` block.
- **`frontend/README.md`** — replace the localhost-only note with both the local and external URLs plus a command to find the host IP.
- **`README.md`** — extend the "Run the frontend" section to reference external access.
