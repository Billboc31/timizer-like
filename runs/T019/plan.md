The plan is written to `runs/T019/plan.md`. It covers:

- **Scaffolding** — Vite + React + TypeScript in `frontend/`, dev proxy to backend
- **API layer** — `frontend/src/api/cra.ts` with `openOrCreateCra()` distinguishing 200 (existing) from 201 (created)
- **`MonthSelector` component** — month/year selectors, real-time period label, dynamic button label, loading/success/error states
- **Tests** — Vitest + Testing Library covering all states
- **4 required headings** in exact order: `Objective`, `Included`, `Excluded`, `Acceptance criteria`
