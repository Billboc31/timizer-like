## Objective

Configure the Vite development server to listen on all network interfaces (`0.0.0.0`) with a fixed port and `strictPort`, making the React frontend reachable from Tailscale or LAN devices while keeping `http://localhost:5173` working locally.

## Included

- **`frontend/vite.config.ts`**: add a `server` block with `host: '0.0.0.0'`, `port: 5173`, and `strictPort: true`. No other config key is touched.

- **`frontend/README.md`**: add a section explaining:
  - how to start the dev server (`npm run dev`)
  - that `http://localhost:5173` continues to work locally
  - how to find the machine's Tailscale IP (`tailscale ip -4`) and LAN IP (`ip addr` / `ifconfig`)
  - the resulting remote URL pattern: `http://<IP>:5173`
  - that the OS firewall must allow inbound TCP on port 5173 (user's responsibility)

- **`docs/local-development.md`** (if it already documents frontend startup): add the same remote-access note to stay consistent.

- No new npm dependencies, no new scripts, no changes to `package.json`.

## Excluded

- Production deployment or any non-dev Vite config (`build`, `preview`).
- Public Internet exposure, HTTPS, or TLS certificates.
- Tailscale installation, ACL rules, or firewall automation.
- Backend remote-access configuration.
- Any change to test setup files (`vitest`, `setupTests.ts`), which must remain unmodified.

## Acceptance criteria

- `frontend/vite.config.ts` contains `server: { host: '0.0.0.0', port: 5173, strictPort: true }`.
- Running `npm run dev` in `frontend/` starts the server and Vite prints a network URL alongside the localhost URL.
- `http://localhost:5173` loads the app on the host machine.
- When port 5173 is already in use, `npm run dev` exits with an error rather than binding to a different port.
- `frontend/README.md` documents the remote URL pattern and how to find the host IP.
- `npm run build` and `npm test` in `frontend/` pass without modification.
