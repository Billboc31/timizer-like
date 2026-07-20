Plan written to `runs/T024/plan.md`. Here's a summary of the key decisions:

**4 files to change, 1 to create (test additions):**

1. **`httpClient.ts`** — `apiGetBlob` return type changes from `Promise<Blob>` to `Promise<{ blob: Blob; filename: string | null }>`, parsing the `Content-Disposition` header.
2. **`craClient.ts`** — `downloadCraPdf` return type updated to match; NOTE comment about pending backend removed (endpoint exists).
3. **`craClient.test.ts`** — existing download test updated for new shape.
4. **`CalendarGrid.tsx`** — "Download PDF" button added below the grid, rendered only when `isValidated`, with `downloading` / `downloadError` local state and a blob URL + temporary anchor for the actual browser download.
5. **`CalendarGrid.test.tsx`** — 4 new tests covering visible/hidden, success path, and error display.

Nothing touches `App.tsx`, routing, or backend. The blob→anchor pattern is the standard browser download approach with no third-party dependency.
