The plan has been written to `runs/T024/plan.md`. It covers 7 files:

- **`httpClient.ts`** — extend `apiGetBlob` to parse `Content-Disposition` and return `{ blob, filename }`.
- **`craClient.ts`** — update `downloadCraPdf` return type accordingly.
- **`craClient.test.ts`** — update existing download test for the new return shape, add null-filename case.
- **`CraDownload/CraDownload.tsx`** (new) — download button visible only for `VALIDATED`, with loading/error state and blob-URL + temporary-anchor pattern.
- **`CraDownload/CraDownload.css`** (new) — BEM styling.
- **`CraDownload/CraDownload.test.tsx`** (new) — 7 tests covering visibility, download flow, filename fallback, and error display.
- **`App.tsx`** — add `openedCra` state and render `<CraDownload>` when a CRA is selected.
