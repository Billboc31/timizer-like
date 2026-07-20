The plan has been written to `runs/T029/plan.md`.

**What the plan covers:**

The exploration confirmed that 3 of the 6 ticket acceptance criteria are already covered by existing tests (month selection, calendar day rendering, PDF download button visibility). The three gaps requiring new work are:

1. **Click cycle** — CalendarGrid has no `onDayClick` prop and day cells are plain `<div>`s.
2. **Total summary** — `totalWorkedDays` exists in the type but is never rendered.
3. **Validated locked state** — `isValidated` only gates the download button, not day interaction.

The plan proposes minimal changes to `CalendarGrid.tsx` (add `onDayClick` prop, render `totalWorkedDays`, conditionally wire clicks) and five new test cases appended to the existing `CalendarGrid.test.tsx`. No other files need to change.
