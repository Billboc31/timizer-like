The plan is written to `runs/T023/plan.md`. It covers:

- **Objective**: confirm-before-lock validation flow added to `CalendarGrid`.
- **Included**: changes to `CalendarGrid.tsx` (state, dialog, `confirmValidate`), `CalendarGrid.css` (overlay + badge styles), and 8 new test cases in `CalendarGrid.test.tsx`. No new files — the existing `validateCra` client function and locked-cell rendering are reused.
- **Excluded**: backend, PDF, client signature UI, reopen workflow.
- **Acceptance criteria**: all verifiable by a reviewer against the running UI and test suite.
