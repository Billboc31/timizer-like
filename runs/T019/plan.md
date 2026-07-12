Plan written to `runs/T019/plan.md`. It covers:

- **Frontend scaffolding** — Vite + React + TypeScript in `frontend/`, with a dev proxy to `/api`
- **API layer** — `cra.ts` calling `POST /api/cra`, distinguishing 200 (existing) from 201 (created)
- **`MonthSelector` component** — month/year selectors defaulting to today, period display, loading state, success/error feedback
- **No backend changes** — the endpoint already exists
