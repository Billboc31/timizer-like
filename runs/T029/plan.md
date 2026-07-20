Plan written to `runs/T029/plan.md`.

**What the plan covers:**

The exploration found that 4 of 6 ticket acceptance criteria are already satisfied by existing tests — month selection display (`CraMonthSelector.test.tsx`), calendar day rendering, PDF download button presence/absence, and DRAFT vs VALIDATED state. The three gaps that require new work are:

1. **Day click cycling** — `CalendarGrid` has no `onClick` on day cells and no `onDayClick` prop.
2. **Total summary update** — `totalWorkedDays` is in the `CraDetails` type but never rendered.
3. **Validated lock** — `isValidated` is computed but only gates the download button, not day cell interaction.

The plan scopes to:
- `CalendarGrid.tsx`: add `onDayClick` prop, wire cells to it (skipped when VALIDATED), render `totalWorkedDays`
- `CalendarGrid.test.tsx`: append 7 new tests across two `describe` blocks — no existing tests touched
