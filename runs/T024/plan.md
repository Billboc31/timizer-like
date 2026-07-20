Plan written to `runs/T024/plan.md`. It covers five change points:

- **`httpClient.ts`** — new `apiGetBlobWithMeta` that captures the `Content-Disposition` filename alongside the blob.
- **`craClient.ts`** — `downloadCraPdf` updated to return `{ blob, filename }`.
- **`CalendarGrid.tsx`** — download button visible for `VALIDATED`, hidden for `DRAFT`; loading and error states inline.
- **`craClient.test.ts`** — updated to match the new return shape.
- **`CalendarGrid.test.tsx`** — four new test cases covering visibility, trigger, filename fallback, and error display.
