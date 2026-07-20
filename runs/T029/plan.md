The plan is written to `runs/T029/plan.md`. Here's what it specifies:

**Gap analysis**: 3 of 6 acceptance criteria are already covered by existing tests (month selection in `CraMonthSelector.test.tsx`, day rendering and PDF download in `CalendarGrid.test.tsx`). The remaining 3 require new work:

1. **Click cycle** — `CalendarGrid.tsx` needs an `onDayClick` prop + cycle logic (0 → 0.5 → 1 → 0 per click), then 1 test case.
2. **Total summary** — add a `data-testid="total-worked"` element, then 2 test cases (initial render + update on click).
3. **Validated locked state** — day cells get `aria-disabled="true"` and no `onClick` when `status === 'VALIDATED'`, then 1 test case.

All new tests go into the existing `CalendarGrid.test.tsx`. The parent component wiring for `onDayClick` is explicitly out of scope.
