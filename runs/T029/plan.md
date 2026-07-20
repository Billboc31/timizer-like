The plan has been written to `runs/T029/plan.md`. Here is a summary of what it specifies:

**Gap analysis** — 3 of 6 acceptance criteria are already covered by existing tests (month selection in `CraMonthSelector.test.tsx`, day rendering in `CalendarGrid.test.tsx`, PDF download in `CraHistory.test.tsx`). The other 3 require new work because `CalendarGrid.tsx` currently has no click handling, no total display, and no validated-lock logic.

**Two files to change:**

1. `CalendarGrid.tsx` — add an optional `onDayClick` prop, local `workedMap` state initialised from `cra.days`, a click handler cycling `0 → 0.5 → 1 → 0`, `aria-disabled="true"` on cells when `status === 'VALIDATED'`, and a `<span data-testid="total-worked">` summing current values.

2. `CalendarGrid.test.tsx` — append three test cases: click cycle (three clicks, check 0.5 → 1 → 0), total update (assert `total-worked` increments), and validated lock (cells have `aria-disabled`, clicking does not change state).

**Explicitly excluded:** parent wiring of `onDayClick` in `App.tsx`, `CraSummaryPanel` propagation tests, and anything outside the six stated acceptance criteria.
