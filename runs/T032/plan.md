Plan written to `runs/T032/plan.md`. Here's the summary:

**One config change** — `frontend/vite.config.ts` gets a `server` block with `host: '0.0.0.0'`, `port: 5173`, and `strictPort: true`.

**Three doc updates** — `frontend/README.md`, `README.md`, and `docs/local-development.md` each get the Tailscale/LAN URL documented and the incorrect `npm start` references corrected to `npm run dev`.

One assumption flagged: `npm start` is undefined in `package.json` yet all three doc files reference it — fixing this is treated as in-scope since the ticket requires accurate startup documentation.
