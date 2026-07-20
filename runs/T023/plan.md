The plan is written to `runs/T023/plan.md`. Here's a summary of what it covers:

**3 files to modify, no new files:**

- **`App.tsx`** — replaces the `console.log` stub with a real `getCra(id)` call, stores the loaded `CraDetailsDto` in state, renders `CalendarGrid` with an `onValidate` callback that calls `validateCra` and updates state from the server response.

- **`CalendarGrid.tsx`** — gains a new `onValidate` prop; adds a "Validate CRA" button (DRAFT only), an inline `role="dialog"` confirm panel with a date input for `providerSignatureDate`, `validating`/`validationError` state, a "CRA validé" banner (VALIDATED only), and `day-cell--locked` class on all cells when locked.

- **`CalendarGrid.test.tsx`** — extends the existing 7 tests with 5 new cases covering button visibility per status, cancel flow, success path, and error path.

Key design decision: the confirm dialog is inline in `CalendarGrid` (no new component file) to stay minimal and bounded. The `providerSignatureDate` is a required API field, so a date input is included in the dialog (defaulting to today).
