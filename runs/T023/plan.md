The plan is written to `runs/T023/plan.md`. It covers:

- **New `ConfirmDialog` component** — modal with open/cancel/confirm/loading props, CSS, and tests
- **`CalendarGrid` changes** — Validate button (DRAFT only), validated banner (VALIDATED only), dialog wiring, `validateCra` API call with auto-dated `providerSignatureDate`, loading/error states, new tests
- **`App.tsx` wiring** — mount `CalendarGrid` when a CRA is selected (currently it's just a `console.log`), add a Back control
- **Excluded** — backend, PDF, signature date picker, reopen flow, auth, routing
- **Acceptance criteria** — button visibility, dialog flow, API call arguments, locked state after success, error display, no test regressions
