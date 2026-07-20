Plan written to `runs/T029/plan.md`. Here's what it specifies:

**Gap analysis** — 3 of 6 acceptance criteria are already covered by existing tests (month selection by `CraMonthSelector.test.tsx`, day rendering and PDF download by `CalendarGrid.test.tsx`). The other 3 require new work:

- **Click cycle** — `CalendarGrid.tsx` has no onClick on day cells today
- **Total summary** — `totalWorkedDays` is in the data but not rendered in the UI
- **Validated locked state** — no click suppression logic exists

**Two files to change:**

1. `CalendarGrid.tsx` — add `onDayClick` prop, local `workedMap` state cycling `0 → 0.5 → 1 → 0`, `aria-disabled` on VALIDATED cells, and a `data-testid="total-worked"` span.
2. `CalendarGrid.test.tsx` — append a `'CalendarGrid interactions'` describe block with 3 tests covering the cycle, the total update, and the validated lock.

**Explicitly excluded:** parent wiring in `App.tsx`, backend calls, and everything outside the six stated acceptance criteria.
