The plan has been written to `runs/T029/plan.md`. Here's a summary of what it specifies:

**Gap analysis** — 3 of the 6 acceptance criteria are already satisfied by existing tests. The 3 missing ones are:
- Click cycle behaviour (no `onDayClick` prop exists on `CalendarGrid`)
- Total summary update (`totalWorkedDays` is in the data but not rendered)
- Validated CRA locked state (clicks should be suppressed when `status === 'VALIDATED'`)

**Plan calls for changes to exactly 2 files:**

1. `CalendarGrid.tsx` — add `onDayClick` optional prop, wire it to day cell click handlers (blocked when validated), add a `data-testid="total-worked-days"` element rendering `cra.totalWorkedDays`.

2. `CalendarGrid.test.tsx` — add 4 new tests in two new `describe` blocks (click cycle + total summary), without touching any of the 14 existing tests.
