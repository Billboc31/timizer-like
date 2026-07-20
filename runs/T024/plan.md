Plan written to `runs/T024/plan.md`. It covers 7 files across the API layer, a new download utility, and a new `CraDownloadButton` component:

- **`apiError.ts`** — add `cra_not_validated` error code
- **`httpClient.ts`** — add `apiGetBlobWithFilename` that parses `Content-Disposition`
- **`craClient.ts`** — update `downloadCraPdf` to return `{ blob, filename | null }`
- **`frontend/src/utils/download.ts`** (new) — `triggerBlobDownload` utility
- **`frontend/src/components/CraDownloadButton/CraDownloadButton.tsx`** (new) — status-aware button with error display
- **`CraDownloadButton.test.tsx`** (new) — 4 test cases
- **`craClient.test.ts`** — update existing `downloadCraPdf` test for new return shape
