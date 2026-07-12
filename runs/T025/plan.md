The plan is written to `runs/T025/plan.md`. It covers 5 files across 3 concerns:

1. **`api/types.ts`** — add `validationDate: string | null` to `CraSummaryDto` (already returned by the backend, missing from the TS type).
2. **`CraHistoryPage/` (3 new files)** — component with all four states (loading/error/empty/list), table with period/status/worked days/validation date, "Open" callback, conditional "Download PDF" via the blob pattern already in `craClient.ts`, and a full test suite.
3. **`App.tsx`** — minimal `view: 'selector' | 'history'` state toggle with History and Back buttons; no router library needed.
