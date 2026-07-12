Plan written to `runs/T019/plan.md`. Key decisions:

- **`listCras()` + filter** rather than a dedicated "check by period" endpoint (the API doesn't have one; `listCras()` already exists in T018's client)
- **`onOpen(cra)` callback prop** for "Open CRA" — no routing library exists yet, so navigation is deferred to the parent and a future ticket
- **Three files**: new `CraMonthSelector.tsx`, updated `App.jsx`, new Vitest test file
