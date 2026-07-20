All done. Here's a summary of the changes:

---

**Files modified:**

- **`frontend/src/api/httpClient.ts`** — Added `parseFilenameFromDisposition` (handles both `filename=` plain and `filename*=UTF-8''` encoded forms) and `apiGetBlobWithMeta` which reads the `Content-Disposition` header and returns `{ blob, filename }`.

- **`frontend/src/api/craClient.ts`** — `downloadCraPdf` now calls `apiGetBlobWithMeta` and returns `Promise<{ blob: Blob; filename: string | null }>`.

- **`frontend/src/api/__tests__/craClient.test.ts`** — Replaced `mockFetchBlobOk` with `mockFetchBlobWithMetaOk` (includes `headers.get` mock); updated `downloadCraPdf` test to assert the `{ blob, filename }` shape; added a second case for absent `Content-Disposition`.

- **`frontend/src/components/CalendarGrid/CalendarGrid.tsx`** — Added `onDownload` prop, `downloading`/`downloadError` state, `handleDownload` async function (creates object URL, triggers anchor click, revokes URL, handles errors). Download button rendered only when `isValidated`, disabled during in-flight, with a `role="alert"` error span on failure.

- **`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`** — Added `CalendarGrid download` describe block with 5 tests covering: button absent for DRAFT, button present for VALIDATED, anchor triggered on success, error alert on rejection, button disabled during in-flight.

**Result:** 42 tests pass, 0 failures.
