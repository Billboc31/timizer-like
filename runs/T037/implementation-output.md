All changes are in scope. Here's the complete summary:

---

**Files created:**
- `frontend/src/api/errorMessages.ts` — `getErrorMessage(err)` maps every `ApiErrorCode` to a French user-readable string
- `frontend/src/api/errorMessages.test.ts` — 8 tests covering all error codes + non-ApiError fallback

**Files modified:**
- `frontend/src/api/types.ts` — added `validationDate: string | null` to `CraSummaryDto` to align with the legacy type
- `frontend/src/api/__tests__/craClient.test.ts` — added `validationDate: null` to the existing mock summary fixture
- `frontend/src/App.tsx` — added `craLoading`/`craError`/`lastCraId`/`updatingDay`/`dayUpdateError` states; `handleOpen` now calls `getCra()` with retry; `handleDayChange` calls `updateDay`; all passed to CalendarGrid/CraSummaryPanel
- `frontend/src/components/CraMonthSelector/CraMonthSelector.tsx` — migrated to `craClient`, uses `getErrorMessage`, extracted `loadCras` for retry, added 3-second success message before `onOpen`
- `frontend/src/components/CraHistory/CraHistory.tsx` — migrated to `craClient`, uses `getErrorMessage`, extracted `loadCras` for retry, Open button disabled during PDF download
- `frontend/src/components/CalendarGrid/CalendarGrid.tsx` — added `onRetry`/`onDayChange`/`updatingDay`/`dayUpdateError` props; non-weekend cells become interactive buttons when `onDayChange` provided; retry button on error; `dayUpdateError` as `role="alert"`
- `frontend/src/components/CraValidation/CraValidation.tsx` — added `'success'` UIState, uses `getErrorMessage`, 2-second success message before `onValidated`
- CSS files — added `.day-cell--updating`, `.calendar-grid__day-update-error`, `.cra-validation__success`
- All 4 component test files — updated mock targets, error message strings, added retry/success/disabled-state tests

**Result:** 79/79 tests pass. The two pre-existing TypeScript errors in `httpClient.ts` (`process.env`) are unrelated to this ticket.
