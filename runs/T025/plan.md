The plan is written to `runs/T025/plan.md`. It covers 5 files across 3 concerns:

1. **`api/types.ts` + `types/cra.ts`** — add `validationDate: string | null` to `CraSummaryDto` (backend already returns it, the TS type is missing it).
2. **`CraHistoryPage.tsx` + `.css` + `.test.tsx`** — new component with a table, all four states (loading/error/empty/list), Open callback, and conditional Download PDF via the blob URL pattern already available in `craClient.ts`.
3. **`App.tsx`** — minimal `view` state switch (`'selector' | 'history'`) with History/Back buttons; no router library needed.
