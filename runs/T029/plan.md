Plan written to `runs/T029/plan.md`. Here's the summary:

**3 components to touch, 4 test files affected:**

- `CalendarGrid.tsx` — add `onDayClick` prop + click cycle logic (0→1→0.5→0) + aria-disabled on VALIDATED cells
- `CalendarGrid.test.tsx` — add 4 new tests for the click cycle describe block
- `CraSummaryPanel.tsx` + `CraSummaryPanel.test.tsx` — new component + 2 tests for total worked days display
- `CraValidation.tsx` + `CraValidation.test.tsx` — new component + 3 tests for Validate button visibility

Month selection, CRA loading, calendar rendering, and PDF download are already covered by the existing tests on this branch.
