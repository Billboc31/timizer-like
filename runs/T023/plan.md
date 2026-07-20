Plan written to `runs/T023/plan.md`. Here's a summary of the approach:

**Key decision**: validation logic stays inside `CalendarGrid` rather than requiring App.tsx restructuring. CalendarGrid already holds the `cra` object, knows about `isValidated`, and has the `onCraUpdate` callback — adding the validate button there is minimal and self-contained.

**Three changes**:
1. `CalendarGrid.tsx` — three new local states (`showConfirmDialog`, `validateLoading`, `validateError`), three handlers, and the inline confirm overlay rendered below the day grid.
2. `CalendarGrid.css` — styles for the button, badge, and overlay.
3. `CalendarGrid.test.tsx` — 8 new tests covering visibility, confirmation flow, success, and error cases.

The existing `validateCra` client function in `craClient.ts` is reused as-is with `providerSignatureDate` set to today's ISO date.
