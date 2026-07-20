The plan is written to `runs/T029/plan.md`. Here's the summary:

**3 acceptance criteria are already satisfied** by existing tests — no changes needed to `CraMonthSelector.test.tsx` (month selection) or the existing `CalendarGrid.test.tsx` cases (day rendering, PDF button).

**3 gaps require work:**

1. `CalendarGrid.tsx` needs three additions: an `onDayClick` prop with a click-cycle handler (0→0.5→1→0), a `data-testid="total-summary"` element rendering `totalWorkedDays`, and `aria-disabled` day cells when `status === 'VALIDATED'`
2. `CalendarGrid.test.tsx` gets 5 new test cases covering those exact behaviours
3. No new files needed
