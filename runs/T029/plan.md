The plan is written to `runs/T029/plan.md`. Here's a summary of the decisions:

**Already covered** (no work needed): month selection display, calendar day rendering, PDF download button — all tested in the existing test suites.

**Three gaps require both code and tests in `CalendarGrid`:**

1. **Click cycling** — add `workedMap` local state, cycle `0 → 0.5 → 1 → 0` on weekday cell click.
2. **Total summary** — add a `data-testid="total-worked-days"` element summing the map values.
3. **Validated locked state** — when `status === 'VALIDATED'`, disable clicks and add `day-cell--locked` class.

All new tests go into the existing `CalendarGrid.test.tsx`; no new files are created. The `workedMap` stays local (no API calls) — persisting clicks to the backend is out of scope.
