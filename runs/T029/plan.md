The plan has been written to `runs/T029/plan.md`. Here's a summary of what it covers:

**Key finding:** Four of the seven acceptance criteria are already covered by existing tests (`CraMonthSelector.test.tsx` covers month selection and CRA loading; `CalendarGrid.test.tsx` covers calendar rendering and PDF download visibility). Three criteria are not yet testable because the underlying features don't exist in `CalendarGrid`:

- **Day click cycling** — no click handler exists on day cells
- **Total summary display** — `totalWorkedDays` is never rendered
- **Validated locked state** — no guard against clicking days in a VALIDATED CRA

The plan scopes the work to: (1) add those three features to `CalendarGrid.tsx` with minimal additions, and (2) add a new `describe` block in `CalendarGrid.test.tsx` with five tests covering those behaviors. API persistence (`updateDay`) is explicitly out of scope.
