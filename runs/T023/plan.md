Plan written to `runs/T023/plan.md`. Key decisions:

- **Two new components**: `ConfirmationDialog` (reusable modal) and `CraValidationBar` (DRAFT button vs. VALIDATED badge + error display), each with CSS and test files.
- **`App.tsx`** gets the validation state (`showConfirmDialog`, `validating`, `validateError`) and the `handleValidateConfirmed` handler.
- **`providerSignatureDate`** is auto-set to today's ISO date (client signature UI is out of scope per ticket, but the field is required by the API).
- No changes needed to `CalendarGrid`, `craClient.ts`, or `CraMonthSelector` — they already handle their respective concerns.
