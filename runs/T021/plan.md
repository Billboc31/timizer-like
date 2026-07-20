Plan written to `runs/T021/plan.md`. It covers four files:

- **`CalendarGrid.tsx`** — switch to `CraDetailsDto`, add `onDayUpdated` prop, per-cell saving/error state, `handleDayClick` with cycle logic, locked state for validated CRAs.
- **`CalendarGrid.css`** — three new modifier classes (`--saving`, `--error`, `--locked`).
- **`App.tsx`** — add `craDetails` state, fetch via `getCra()` on open, render `CalendarGrid` with `onDayUpdated`.
- **`CalendarGrid.test.tsx`** — 7 new test cases covering the full cycle, concurrent-click guard, success/error callbacks, and the validated lock.
