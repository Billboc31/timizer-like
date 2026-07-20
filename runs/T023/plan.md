Plan written to `runs/T023/plan.md`. Here's a summary of the approach:

**Core change:** `CalendarGrid.tsx` gains an `onCraValidated` callback prop plus local state for the confirmation flow. No new component file needed — the confirmation area is rendered inline.

**Key design decisions:**
- `validateCra` and `getCra` already exist in `craClient.ts` — no API client changes needed.
- Day-cell locking (`isValidated` / `day-cell--locked`) is already implemented — no change needed there either.
- `ValidateCraRequest.providerSignatureDate` is fulfilled with today's ISO date at confirm time.
- The parent swaps its `cra` state to the updated DTO returned via `onCraValidated`, which triggers the natural locked re-render.

**6 new test cases** cover: button visibility per status, confirmation flow, cancel, success path, and error display.
