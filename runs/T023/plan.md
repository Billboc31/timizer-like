`runs/T023/plan.md` is written. The plan covers:

- **`ConfirmDialog`** — new standalone component (tsx + css + tests) for the confirmation modal
- **`CalendarGrid` changes** — validate button (DRAFT only), confirmed dialog wiring, `validateCra` API call with loading/error states, validated badge (VALIDATED only)
- **Excluded** — backend, PDF, signature picker, reopen, auth
- **Acceptance criteria** — button visibility, dialog flow, API call, locked state, error display, no test regressions
