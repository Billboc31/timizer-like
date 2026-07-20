The plan has been written to `runs/T029/plan.md`. Here's what it covers:

**Already covered by existing tests (no new work):** month selection display, calendar day rendering, PDF download button availability.

**Three gaps that require both component changes and new tests in `CalendarGrid`:**
1. **Click cycle** — add `workedMap` local state, cycle `0→0.5→1→0` on weekday click (no API call)
2. **Total summary** — add a `data-testid="total-worked-days"` element summing the local map values
3. **Validated locked state** — skip click handler and add `day-cell--locked` class when `status === 'VALIDATED'`
