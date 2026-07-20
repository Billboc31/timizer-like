Plan written to `runs/T024/plan.md`. It covers 6 touch points:

- **`httpClient.ts`** — new `apiGetBlobWithFilename` helper that parses `Content-Disposition` and returns `{ blob, filename | null }`
- **`craClient.ts`** — update `downloadCraPdf` to use the new helper, returning `{ blob, filename }`
- **`CraDownloadButton.tsx`** (new) — renders nothing for DRAFT, active download button for VALIDATED, inline error on failure, filename fallback
- **`CalendarGrid.tsx`** — mount `<CraDownloadButton>` above the day grid
- **`CraDownloadButton.test.tsx`** (new) — 5 test cases: visibility by status, download trigger, filename fallback, error display
- **`craClient.test.ts`** — update to expect the new `{ blob, filename }` return shape
