Plan written to `runs/T029/plan.md`. Here's what it covers:

**3 existing tests already satisfy 3 of 6 criteria** (month selection display, calendar day rendering, PDF download visibility) — no changes needed there.

**3 gaps require minimal additions to `CalendarGrid.tsx` + 5 new test cases in `CalendarGrid.test.tsx`:**

1. **Click cycle** — add `onDayClick?(day, nextValue)` prop + click handler on day cells (disabled for VALIDATED status)
2. **Total summary** — render `cra.totalWorkedDays` in a `data-testid="total-summary"` element
3. **Validated locked state** — verify `onDayClick` is not invoked when status is `VALIDATED`
