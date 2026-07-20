The plan is written to `runs/T029/plan.md`. It:

- **Extends `CalendarGrid.tsx`** with `onDayClick` (cycling 0→0.5→1→0, disabled for VALIDATED), a `totalWorkedDays` display, and an `onValidate` button (DRAFT only).
- **Adds 9 new test cases** to `CalendarGrid.test.tsx` across three new `describe` blocks: click cycle (4), total summary (2), validate action (3).
- **Calls out existing coverage** — `CraMonthSelector.test.tsx` already covers month selection, and the existing download suite covers PDF button availability.
- Explicitly excludes App-level wiring and all out-of-scope items from the ticket.
