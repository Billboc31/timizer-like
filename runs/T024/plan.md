The plan is written to `runs/T024/plan.md`. It covers five targeted changes:

1. **`httpClient.ts`** — extend `apiGetBlob` to parse `Content-Disposition` and return `{ blob, filename | null }`.
2. **`craClient.ts`** — propagate the new return shape through `downloadCraPdf`.
3. **`CalendarGrid.tsx`** — add the download button (visible only for `VALIDATED`), `downloading`/`downloadError` state, and the blob-URL + temporary-anchor download pattern with filename fallback.
4. **`craClient.test.ts`** — update existing test + add filename/null cases.
5. **`CalendarGrid.test.tsx`** — four new tests covering visibility, happy-path download, filename fallback, and error display.
