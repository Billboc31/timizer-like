## Objective

Add a "Download PDF" button to the CRA detail view (`CalendarGrid`) that is visible only for validated CRA records, triggers a browser download of the PDF returned by the backend, and uses the filename from the `Content-Disposition` response header when available.

## Included

### `frontend/src/api/httpClient.ts`
- Add `apiGetBlobWithMeta(path: string): Promise<{ blob: Blob; filename: string | null }>`.
- After asserting `res.ok`, read `Content-Disposition` header and parse the `filename=` token (handle both plain and `filename*=UTF-8''…` forms); return `null` if absent or unparseable.
- Keep `apiGetBlob` unchanged (it has existing tests and callers).

### `frontend/src/api/craClient.ts`
- Change `downloadCraPdf` to call `apiGetBlobWithMeta` instead of `apiGetBlob`.
- Update return type to `Promise<{ blob: Blob; filename: string | null }>`.

### `frontend/src/api/__tests__/craClient.test.ts`
- Update the `downloadCraPdf` test: mock `headers.get('content-disposition')` to return a fixture filename.
- Assert the returned object has `{ blob: Blob, filename: string | null }` shape.

### `frontend/src/components/CalendarGrid/CalendarGrid.tsx`
- Add `onDownload?: (craId: number) => Promise<{ blob: Blob; filename: string | null }>` to the `Props` interface (injected to keep the component testable).
- Add state: `downloading: boolean`, `downloadError: string | null`.
- Add `handleDownload` async function that creates an object URL, triggers the anchor download, and revokes the URL; sets `downloadError` on failure.
- Render a "Download PDF" button visible only when `isValidated`, disabled while `downloading`, with an alert for errors.

### `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`
- Test: button absent for DRAFT CRA.
- Test: button present for VALIDATED CRA.
- Test: click calls `onDownload` and triggers anchor programmatically.
- Test: rejected `onDownload` shows alert with error message.
- Test: button disabled during in-flight download.

## Excluded

- Backend PDF generation or endpoint.
- Email sending, client signature, preview mode.
- `CraMonthSelector` — download button belongs only in `CalendarGrid`.
- Modifying `apiGetBlob` (existing function and tests left intact).

## Acceptance criteria

- `CalendarGrid` with DRAFT CRA renders no download button.
- `CalendarGrid` with VALIDATED CRA renders a "Download PDF" button.
- Clicking the button triggers a programmatic anchor download with the filename from `Content-Disposition` when present, falling back to `cra-<year>-<month>.pdf`.
- A rejected `onDownload` causes an `[role="alert"]` element with the error message.
- Button is disabled during an in-flight download.
- `pnpm test` passes with no regressions.
