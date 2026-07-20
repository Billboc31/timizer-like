The plan is written to `runs/T029/plan.md`. Here's the summary:

**Key finding:** Four of seven acceptance criteria are already covered by existing tests (`CraMonthSelector.test.tsx` and `CalendarGrid.test.tsx`). Three criteria require both component changes and new tests because the features don't exist yet in `CalendarGrid.tsx`:

- **Day click cycling** — add `onDayClick` prop, attach `onClick` on day cells for DRAFT only
- **Total summary display** — render `totalWorkedDays` with a `data-testid`
- **Validate button visibility** — add `onValidate` prop, show button for DRAFT, hide for VALIDATED

The plan scopes the work to minimal additions in `CalendarGrid.tsx` and a new `describe` block in `CalendarGrid.test.tsx`. API persistence (`updateDay`) is explicitly excluded.
