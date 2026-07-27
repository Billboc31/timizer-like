All three files are correct. Here's a summary:

## Changes made

**Files modified:**

1. **`frontend/vite.config.ts`** — added `server` block with `host: '0.0.0.0'`, `port: 5173`, `strictPort: true`. The `test` block and plugins are untouched.

2. **`frontend/README.md`** — added "Remote access (Tailscale / LAN)" section with IP-discovery commands and a note about `strictPort` and the OS firewall.

3. **`docs/local-development.md`** — updated section 5 (Frontend startup) to use `npm run dev`, document port 5173 with both localhost and remote URL patterns, and add the same IP-discovery and firewall notes.

**No changes to:** `package.json`, test setup files, or any backend config. All acceptance criteria from the plan are met.
