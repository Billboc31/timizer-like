The plan has been written to `runs/T021/plan.md`. It covers 5 files:

- **`types/cra.ts`** — one-line fix: `note: string | null` to match the API (required for compilation).
- **`CalendarGrid.tsx`** — new `onDayClick` prop, per-cell `saving`/`error` local state, `nextWorkValue` helper, `handleDayClick` with concurrent-click guard, CSS modifier classes, locked state for validated CRAs.
- **`CalendarGrid.css`** — three new modifier classes: `--saving`, `--error`, `--locked`.
- **`App.tsx`** — wire up `getCra` on open, render `CalendarGrid`, pass `handleDayClick` that calls `updateDay` and refreshes state.
- **`CalendarGrid.test.tsx`** — 7 new test cases covering the full cycle, concurrent-click guard, saving/error states, and the validated lock.
