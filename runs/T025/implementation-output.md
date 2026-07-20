All 40 tests pass, including the renamed/updated `shows error when PDF download fails and keeps table visible` test.

**Changes made:**

- `CraHistory.tsx` — added `downloadError` state, used it in the PDF `.catch()` instead of `setError`, and rendered it inline above the table (no early return, so the table stays visible)
- `CraHistory.test.tsx` — updated the PDF error test to also assert `'June 2026'` row and the Download button are still present after the error
- `types/cra.ts` — removed the redundant `validationDate: string | null` re-declaration from `CraDetailsDto` (already inherited from `CraSummaryDto`)
