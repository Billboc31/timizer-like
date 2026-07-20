Plan written to `runs/T024/plan.md`. It covers 6 touch points:

- **`httpClient.ts`** — update `apiGetBlob` to parse `Content-Disposition` and return `{ blob, filename | null }`.
- **`craClient.ts`** — propagate the new return shape from `downloadCraPdf`.
- **`apiError.ts`** — add `'cra_not_validated'` to the error code union.
- **`CalendarGrid.tsx`** — download button visible for VALIDATED, hidden for DRAFT, inline error display.
- **`CalendarGrid.test.tsx`** — four new test cases (visibility, trigger, filename fallback, error display).
- **`httpClient.test.ts`** — two new test cases for filename extraction.
