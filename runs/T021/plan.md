The plan is written to `runs/T021/plan.md`. Here's a summary of what it specifies:

**3 files to modify** (no new files):
- `CalendarGrid.tsx` — add `onUpdate` prop, `savingDays`/`errorDays` state, `WORK_CYCLE` constant, `handleDayClick` async handler, and CSS modifier classes on each cell.
- `CalendarGrid.css` — add `.day-cell--saving`, `.day-cell--error`, `.day-cell--locked` styles.
- `CalendarGrid.test.tsx` — 8 new test cases covering the full cycle, saving state, error state, locked state, and double-click guard.

**Key decisions captured:**
- No optimistic updates — displayed value changes only after the server responds.
- Cycle array `[0, 1, 0.5]` drives rotation via index mod.
- `onUpdate` receives the raw `CraDetailsDto` from the API; type mapping is the parent's responsibility.
- Double-click guard via `savingDays.has(day)` check.
