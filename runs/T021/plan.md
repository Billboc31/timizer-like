The plan is written to `runs/T021/plan.md`. It covers four files to touch:

- **`CalendarGrid.tsx`** — add `onDayClick`, `savingDay`, `errorDay` props; apply CSS modifier classes; block clicks on locked/saving cells.
- **`CalendarGrid.css`** — three new modifier classes: `--saving`, `--error`, `--locked`.
- **`App.tsx`** — load full `CraDetailsDto` on open, implement `handleDayClick` with the 0→1→0.5→0 cycle, call `updateDay`, manage `savingDay`/`errorDay` state.
- **`CalendarGrid.test.tsx`** (new) — seven test cases covering the full cycle, concurrent-click guard, and validated lock.
