Plan written to `runs/T024/plan.md`. It covers five files:

- **`httpClient.ts`** — new `apiGetBlobWithMeta` that reads the `Content-Disposition` filename alongside the blob.
- **`craClient.ts`** — `downloadCraPdf` updated to return `{ blob, filename }`.
- **`CalendarGrid.tsx`** — download button shown only for `VALIDATED`, hidden for `DRAFT`, with `downloading`/`downloadError` states.
- **`craClient.test.ts`** — existing test updated for the new return shape.
- **`CalendarGrid.test.tsx`** — four new test cases covering visibility per status, download trigger, filename fallback, and error display.
