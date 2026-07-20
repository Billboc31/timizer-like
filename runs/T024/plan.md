The plan has been written to `runs/T024/plan.md`. It covers five touch points across the frontend:

- **`httpClient.ts`** — new `apiGetBlobWithName` that parses `Content-Disposition` and returns `{ blob, filename | null }`
- **`craClient.ts`** — new `downloadCraPdfFile` using the above; existing `downloadCraPdf` untouched
- **`CalendarGrid.tsx`** — download button rendered below the grid only when `isValidated`, with in-flight disabled state and inline error display
- **`CalendarGrid.test.tsx`** — five new tests covering visibility, success path, in-flight state, and error display
- **`craClient.test.ts`** — two new cases for `downloadCraPdfFile` testing header parsing

`App.tsx` and `CraMonthSelector` are explicitly out of scope.
