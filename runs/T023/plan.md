Plan written to `runs/T023/plan.md`. It covers:

- **2 new components**: `CraPage` (CRA detail view with validate button, confirmation, locked banner, error display) and `ConfirmDialog` (reusable confirmation modal), each with component + CSS + tests
- **3 modified files**: `CalendarGrid.tsx/css` gain an optional `locked` prop; `App.tsx` manages `openCra` state and renders `CraPage` when a CRA is selected; `types/cra.ts` gets `validationDate` added to `CraDetails`
- **Explicit exclusion**: `providerSignatureDate` is auto-set to today's ISO date (no user input), and the `getCra()` backend endpoint is a runtime dependency but mocked in tests
