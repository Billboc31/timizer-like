Plan written to `runs/T024/plan.md`. It covers 6 files:

1. **`httpClient.ts`** — extend `apiGetBlob` to parse `Content-Disposition` and return `{ blob, filename? }`
2. **`craClient.ts`** — propagate the new return type through `downloadCraPdf`
3. **`CalendarGrid.tsx`** — add download button (visible only for `VALIDATED`), `downloading`/`downloadError` state, and the blob-URL + temporary-anchor trigger with filename fallback
4. **`CalendarGrid.css`** — minimal styles for the button and error text
5. **`craClient.test.ts`** — update existing test + add filename/missing-header cases
6. **`CalendarGrid.test.tsx`** — four new tests: button visibility per status, happy-path download, and error display
