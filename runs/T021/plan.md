Plan written to `runs/T021/plan.md`. Here's a summary of what it covers:

**4 files to touch:**

1. **`CalendarGrid.tsx`** — add `onDayClick`, `savingDay`, and `dayError` props; implement `nextValue` cycle (0→1→0.5→0); gate clicks on DRAFT status and no in-flight save; apply per-cell CSS modifier classes.

2. **`CalendarGrid.css`** — add `.day-cell--clickable`, `.day-cell--saving`, `.day-cell--error`, `.day-cell--locked` modifier styles.

3. **`App.tsx`** — lift CRA state here, manage `savingDay`/`dayError`, call `updateDay` on click, refresh CRA from the API response, pass all props down to `CalendarGrid`.

4. **`frontend/src/utils/craDate.ts`** (new) — single utility to format a day number into an ISO date string for the PATCH URL, keeping that logic testable.

**Key design decisions in the plan:**
- No optimistic updates — worked value only changes in state after the API succeeds.
- A click is ignored if the CRA is VALIDATED or if a save is already in flight for that cell.
- `cra_validated` API errors are handled distinctly (cell shows locked message) from generic errors.
