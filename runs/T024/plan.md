The plan has been written to `runs/T024/plan.md`. It covers five files to change and one new test file:

- **`httpClient.ts`** — new `apiGetBlobWithFilename` that reads `Content-Disposition` and returns `{ blob, filename | null }`
- **`craClient.ts`** — `downloadCraPdf` updated to return `{ blob, filename | null }`
- **`CraSummaryPanel.tsx`** — download button for VALIDATED CRAs, loading state, inline error alert
- **`App.tsx`** — download handler with backend filename / fallback, passed as props to `CraSummaryPanel`
- **`CraHistory.tsx`** — use backend filename instead of hardcoded one
- **`craClient.test.ts`** (update) + **`CraSummaryPanel.test.tsx`** (new) — unit tests for the new behaviour
