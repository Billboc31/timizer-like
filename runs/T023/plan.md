Plan written to `runs/T023/plan.md`. Key decisions:

- **New `ConfirmDialog` component** — standalone, vanilla CSS, no UI library (matches the project's pattern)
- **Validate button in `CalendarGrid`** — visible only on DRAFT, hidden on VALIDATED
- **`providerSignatureDate` auto-set to today** — "Client signature" is explicitly out of scope in the ticket
- **Local state copy hypothesis** — `CalendarGrid` keeps a local `useState<CraDetailsDto>` to reflect post-validation status without requiring prop changes upstream; flagged explicitly so the Coder can choose option 2 if `CraMonthSelector` needs to reflect VALIDATED in its list
- **7 test cases** covering button visibility, confirm/cancel, API call args, success locking, and error display
