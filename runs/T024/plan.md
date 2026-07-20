The plan is written to `runs/T024/plan.md`. It covers:

- **`httpClient.ts`** — new `apiGetBlobWithMeta` that parses `Content-Disposition` for the filename
- **`apiError.ts`** — add `cra_not_validated` error code
- **`craClient.ts`** — update `downloadCraPdf` to return `{ blob, filename | null }`
- **`CraPage/CraPage.tsx`** *(new)* — wraps `CalendarGrid` and adds the status-aware download button with error display
- **`App.tsx`** — wire `selectedCra` state and render `CraPage` when a CRA is open
- **`CraPage/CraPage.test.tsx`** *(new)* — tests for button visibility, download trigger, and error display
- **`craClient.test.ts`** — update existing download test for the new return shape
