Plan written to `runs/T029/plan.md`.

**Key findings from reading the actual source:**

- 4 of 6 acceptance criteria are already satisfied by existing tests (month selection display, calendar day rendering, loading state, PDF download visibility).
- 3 features are **missing from `CalendarGrid.tsx`** and must be implemented before tests can be written:
  - **Day click cycling** — no `onDayClick` prop or `onClick` handler exists on day cells
  - **Total summary display** — `totalWorkedDays` is never rendered in the component
  - **Validated lock** — `isValidated` is computed but only used for the download button, not to suppress day-cell clicks

The plan scopes to minimal additions in `CalendarGrid.tsx` and a new `describe` block in `CalendarGrid.test.tsx`. API persistence (`updateDay`) is explicitly excluded — the click handler calls a callback prop; the parent is responsible for persisting.
