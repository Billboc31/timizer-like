Plan written to `runs/T024/plan.md`. It covers 5 files:

- **`httpClient.ts`** — extend `apiGetBlob` to parse `Content-Disposition` and return `{ blob, filename }`.
- **`craClient.ts`** — update `downloadCraPdf` return type accordingly.
- **`CalendarGrid.tsx`** — add "Download PDF" button (visible only for VALIDATED), with loading/error state and the standard blob-URL + temporary-anchor download pattern.
- **`craClient.test.ts`** — update existing download test for the new return shape.
- **`CalendarGrid.test.tsx`** — 4 new tests (visible, hidden, success, error).

Nothing outside the CalendarGrid feature boundary is touched.
