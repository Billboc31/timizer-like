The plan has been written to `runs/T029/plan.md`. Here's what it covers:

**Three ACs already satisfied** by existing tests — month selection (`CraMonthSelector.test.tsx`), calendar day rendering, and PDF download button (`CalendarGrid.test.tsx`). No changes needed to those files.

**Three ACs require work:**
1. **Click cycle** — `CalendarGrid.tsx` needs an `onDayClick` prop and cycle logic (0 → 0.5 → 1 → 0); three new tests in `CalendarGrid.test.tsx`
2. **Total summary** — add a `data-testid="total-summary"` element rendering `cra.totalWorkedDays`; two new tests
3. **Validated locked state** — day clicks are silently ignored when `status === 'VALIDATED'`; one new test

All new tests go into the existing `CalendarGrid.test.tsx` — no new files. The parent component's API wiring for day updates is explicitly excluded.
