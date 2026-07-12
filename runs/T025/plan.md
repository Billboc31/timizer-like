The plan is written to `runs/T025/plan.md`. It covers 5 files across 3 concerns:

1. **`api/types.ts`** — add `validationDate: string | null` to `CraSummaryDto` (field exists in backend response, missing from the TS type).
2. **`CraHistoryPage.tsx` + `.css` + `.test.tsx`** — new component with table rendering, all states (loading/error/empty/list), Open callback, and conditional Download PDF via blob URL pattern.
3. **`App.tsx`** — state-based view switching (`'selector' | 'history'`) with History/Back buttons; no router install needed.
