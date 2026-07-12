Implementation complete. Here's a summary:

---

## T020 — Implementation Summary

### Files created

| File | Purpose |
|------|---------|
| `frontend/package.json` | Vite + React + TypeScript + Vitest + RTL setup; `start` alias for `vite` |
| `frontend/index.html` | Vite entry HTML |
| `frontend/vite.config.ts` | Vite config with jsdom test environment |
| `frontend/tsconfig*.json` | TypeScript config (app + node) |
| `frontend/.env.development` | `VITE_API_BASE_URL=http://localhost:8080` |
| `frontend/.gitignore` | Excludes `node_modules/`, `dist/` |
| `frontend/src/types/cra.ts` | `CraDayEntry` and `CraDetails` types per plan |
| `frontend/src/api/cra.ts` | `fetchCra(year, month)` → `POST /api/cra` |
| `frontend/src/components/CalendarGrid/CalendarGrid.tsx` | Renders loading/error/empty/grid states; weekend class logic |
| `frontend/src/components/CalendarGrid/CalendarGrid.css` | Grid layout + `day-cell--weekend` background |
| `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` | 7 passing tests (cell count, weekend class, worked values, states) |
| `frontend/src/App.tsx` | Wires `fetchCra(2026, 7)` on mount → `<CalendarGrid />` |
| `frontend/src/main.tsx` + `src/index.css` + `src/setupTests.ts` | App bootstrap |

### Verifications
- `npm test` → **7/7 passing**
- `npm start` → dev server starts on port 4173, serves HTML correctly
- Weekend days (Sat/Sun) get `day-cell--weekend` class; weekdays do not
- Loading, error, and empty states handled

### Notes
- Used Vite instead of CRA (deprecated) — consistent with the rest of the project. Env var prefix is `VITE_` not `REACT_APP_`.
- RTL auto-cleanup wasn't firing with vitest globals disabled; added explicit `afterEach(cleanup)` in the test file.
