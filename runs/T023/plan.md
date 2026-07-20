The plan has been written to `runs/T023/plan.md`. It covers:

- **`App.tsx`** — wire the `handleOpen` callback to actual state so `CraView` renders when a CRA is selected
- **`CraView`** (new) — fetches full CRA details, owns loading/error state, orchestrates the validate API call
- **`CalendarGrid`** — add `onValidate` prop, "Validate CRA" button (DRAFT only), validated banner (VALIDATED only), error display
- **`ConfirmValidationDialog`** (new) — native `<dialog>` with a date input, Confirm/Cancel, loading and error states
- **`types/cra.ts`** — add `validationDate` field to `CraDetails` to align with the API DTO
- **Tests** for all three new/modified components
