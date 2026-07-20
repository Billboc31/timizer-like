The plan is written to `runs/T023/plan.md`. It covers:

- **3 new component folders**: `ConfirmationDialog` (generic reusable modal), `CraView` (CRA detail page with validate button + error display), each with component, CSS, and test files.
- **3 modified files**: `CalendarGrid.tsx/css/test` gain a `locked` prop; `App.tsx` wires up `CraView` via `getCra()` when a CRA is opened.
- **1 explicit hypothesis**: `providerSignatureDate` will be today's date automatically — flagged for review since it's a required API field not mentioned in the ticket.
