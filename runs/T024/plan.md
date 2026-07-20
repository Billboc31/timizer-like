The plan has been written to `runs/T024/plan.md`. It covers 7 touch points across 5 files (2 new):

- **`apiError.ts`** — add `'cra_not_validated'` to the error code union
- **`httpClient.ts`** — add `apiGetBlobWithFilename` that parses the `Content-Disposition` header and returns `{ blob, filename | null }`
- **`craClient.ts`** — update `downloadCraPdf` to use the new function and return `{ blob, filename }`
- **`CraDownloadButton.tsx`** (new) — hidden for DRAFT, download trigger + inline error for VALIDATED
- **`CalendarGrid.tsx`** — mount `<CraDownloadButton>` above the day grid
- **`CraDownloadButton.test.tsx`** (new) — four test cases covering visibility, download trigger, filename fallback, error display
- **`craClient.test.ts`** — update to expect new return shape
