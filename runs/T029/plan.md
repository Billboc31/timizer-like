The plan is written to `runs/T029/plan.md`. Here's a summary of what it covers:

**Existing tests already satisfy** month selection, calendar day rendering, and PDF download visibility — no changes needed there.

**Three missing behaviours must be added to `CalendarGrid.tsx`** before tests can be written:
1. **Click-cycle** — local `workedMap` state cycling `0 → 0.5 → 1 → 0` on weekday cells in DRAFT status
2. **Total summary** — `data-testid="total-worked-days"` element summing `workedMap` values
3. **Locked state + validate action** — `day-cell--locked` class and disabled click when VALIDATED; "Validate CRA" button shown for DRAFT via a new `onValidate` prop

**New tests in `CalendarGrid.test.tsx`** cover all four gaps: click-cycle progression, live total update, locked state on validation, and validate button visibility.
