The plan has been written to `runs/T024/plan.md`. It covers three files to modify and one new test file:

- **`httpClient.ts`** — new `apiGetBlobWithMeta` returning `{ blob, filename | null }` via `Content-Disposition` parsing
- **`craClient.ts`** — `downloadCraPdf` updated to return `{ blob, filename | null }`
- **`CraMonthSelector.tsx`** — download button (VALIDATED only), loading state, inline error alert
- **`CraMonthSelector.test.tsx`** (new) — tests for visibility, error display, and download trigger

Key design decision: the download button lives in `CraMonthSelector` because that is the only component that renders CRA records in the current codebase — no separate CRA detail view exists yet. This is flagged as an explicit assumption in the plan.
