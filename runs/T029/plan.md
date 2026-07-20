Plan written to `runs/T029/plan.md`. It covers three gaps not currently implemented or tested:

1. **Click cycling** — add local `workedMap` state to `CalendarGrid`, cycle `0 → 0.5 → 1 → 0` on cell click.
2. **Total summary** — render a `data-testid="total-worked-days"` element computed from `workedMap`.
3. **VALIDATED locked state** — disable clicks and apply `day-cell--locked` class when `cra.status === 'VALIDATED'`.

Existing tests (month selection, day rendering, PDF download) are already passing and will remain so. All new tests go into `CalendarGrid.test.tsx`; no new files needed.
