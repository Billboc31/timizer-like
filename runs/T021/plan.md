Plan written to `runs/T021/plan.md`. Here's the summary of what it covers:

**3 frontend files to modify, 1 to update with tests:**

- **`App.tsx`** — replace the stub `handleOpen` with a real `getCra()` fetch, add `openedCra` state, render `<CalendarGrid>` when a CRA is open.
- **`CalendarGrid.tsx`** — add `onCraUpdate` prop, local `saving`/`saveError` state, `nextWorkValue(0→1, 1→0.5, 0.5→0)` helper, per-cell click handler that calls `updateDay()`, and CSS class modifiers for locked/saving/error states.
- **`CalendarGrid.css`** — three new modifier classes (locked, saving, error).
- **`CalendarGrid.test.tsx`** — tests for each cycle step, the VALIDATED lock, the saving indicator, and the error state.

**Key design decisions noted in the plan:**
- CalendarGrid calls the API directly (it already has `cra.id` and computes the ISO date from year/month/day).
- Concurrent clicks are blocked while any save is in flight.
- `note: null` is passed to `updateDay` to leave existing notes untouched.
- `SIGNED_BY_PROVIDER` is treated as non-DRAFT (locked) by the existing frontend type mapping.
