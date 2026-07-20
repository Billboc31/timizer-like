Plan written to `runs/T023/plan.md`. Key decisions:

- **Scope stays in `CalendarGrid`** — it already owns the CRA object, knows `isValidated`, and has `onCraUpdate`. No App.tsx restructuring needed.
- **No new dependencies** — inline confirmation overlay using a plain div, no modal library.
- **`providerSignatureDate` hardcoded** to today's ISO date at call time — the ticket doesn't ask for a user date picker.
- **8 new tests** covering button visibility, cancel, success, and error paths; all existing tests must still pass.
