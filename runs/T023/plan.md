The plan has been written to `runs/T023/plan.md`. It covers:

- **Objective**: lock a DRAFT CRA after user confirmation, reflect VALIDATED status in the UI.
- **Included**: two new components (`ConfirmationDialog`, `CraValidationBar`) with CSS and tests, plus a minimal update to `App.tsx` to wire the CRA detail view together.
- **Excluded**: backend, PDF, client signature picker, reopen workflow, auth.
- **Acceptance criteria**: button → dialog → API call → locked UI, with error handling and no test regressions.
