`runs/T024/plan.md` has been written with the four required sections. The plan covers five files:

- **`httpClient.ts`** — new `apiGetBlobWithFilename` that parses `Content-Disposition` and returns `{ blob, filename | null }`
- **`craClient.ts`** — `downloadCraPdf` updated to return `{ blob, filename | null }`
- **`CalendarGrid.tsx`** — download button rendered only for VALIDATED status, with in-flight state and inline error alert
- **`craClient.test.ts`** — updated mock + two new cases for filename extraction
- **`CalendarGrid.test.tsx`** — six new cases covering visibility, success path, in-flight state, and error display
