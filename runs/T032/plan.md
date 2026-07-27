The plan is written to `runs/T032/plan.md`. It covers three files:

- **`frontend/vite.config.ts`** — add `server.host: '0.0.0.0'`, `server.port: 5173`, `server.strictPort: true`
- **`README.md`** — fix `npm start` → `npm run dev` (the script isn't defined) and add remote-access URL instructions
- **`docs/local-development.md`** — new "Access from another device" section with IP discovery commands for macOS and Linux

The plan also flags the pre-existing README bug (`npm start` is not defined; only `npm run dev` is) as part of the included scope since it would confuse any developer following the remote-access docs.
