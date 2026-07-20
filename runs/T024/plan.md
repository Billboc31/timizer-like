The plan is written to `runs/T024/plan.md`. It covers six files:

- **`httpClient.ts`** — new `apiGetBlobWithMeta` returning `{ blob, filename }` from `Content-Disposition`, leaving `apiGetBlob` intact.
- **`craClient.ts`** — `downloadCraPdf` updated to use `apiGetBlobWithMeta` and return `{ blob, filename }`.
- **`CraDownloadButton.tsx`** (new) — self-contained component: hidden for `DRAFT`, enabled button for `VALIDATED`, handles download trigger, filename fallback, and inline error display.
- **`App.jsx`** — mounts `<CraDownloadButton>` in the CRA detail section.
- **`craClient.test.ts`** — updated for new return shape + `Content-Disposition` absent case.
- **`CraDownloadButton.test.tsx`** (new) — four jsdom-scoped test cases covering visibility, download trigger, filename handling, and error display.
