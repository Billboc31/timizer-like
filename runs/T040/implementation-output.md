**70/70 tests pass.** Here's a summary of every change made:

---

## Files modified

| File | Defect |
|------|--------|
| `src/api/httpClient.ts` | D2: `REACT_APP_API_BASE_URL` → `VITE_API_BASE_URL`; D7: optional `signal` on `apiGet`/`apiGetBlob`, re-throws `AbortError` |
| `src/api/types.ts` | D5: added `validationDate: string \| null` to `CraSummaryDto` |
| `src/types/cra.ts` | D5: removed duplicate `CraSummaryDto`, re-exported from `api/types` |
| `src/api/craClient.ts` | D7: added optional `signal` to `listCras` and `downloadCraPdf` |
| `src/App.tsx` | D1: `handleOpen` now calls `getCra(id)`; `craLoading`/`craError` state replaces hardcoded `false`/`null` props |
| `src/main.tsx` | D6: wrapped `<App />` in `<ErrorBoundary>` |
| `src/components/CraMonthSelector/CraMonthSelector.tsx` | D4: imports from `craClient`; D7: `useEffect` returns `AbortController` cleanup |
| `src/components/CraHistory/CraHistory.tsx` | D4: imports from `craClient`; D7: `useEffect` returns `AbortController` cleanup |
| `src/components/CraMonthSelector/CraMonthSelector.test.tsx` | D4: mock target updated to `../../api/craClient` |
| `src/components/CraHistory/CraHistory.test.tsx` | D4: mock target updated to `../../api/craClient` |
| `src/api/__tests__/craClient.test.ts` | Updated 3 `toHaveBeenCalledWith` assertions to include `undefined` second arg (consequence of D7) |

## Files created

| File | Defect |
|------|--------|
| `src/components/ErrorBoundary/ErrorBoundary.tsx` | D6: class component with `getDerivedStateFromError`/`componentDidCatch` and a "Try again" reset |
| `src/App.test.tsx` | Regression tests for D1 (4 cases) |
| `src/api/__tests__/httpClient.test.ts` | Regression tests for D2 + D7 (5 cases) |

## Files deleted

| File | Reason |
|------|--------|
| `src/api/cra.ts` | D4: zero active callers after migration to `craClient.ts` |
