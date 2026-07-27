# Test Report — T040: Fix frontend runtime errors, React warnings, and failed API interactions

## Verification summary

- `vitest run` → **70/70 tests pass (8 files)**
- `tsc --noEmit` → **zero errors**
- All key implementation files inspected against plan

---

## Acceptance criteria

### 1. Main CRA flows complete without uncaught frontend exceptions
**PASS**

`handleOpen` in `App.tsx:30-42` now calls `getCra(summary.id)` and wraps the result in try/catch with `craError` state. `ErrorBoundary` in `main.tsx` catches any render-phase exception and renders a fallback with a recovery button. No uncaught exception path remains.

---

### 2. Browser console contains no React warnings during normal use
**PASS**

- `process.env.REACT_APP_API_BASE_URL` eliminated (D2); no reference remains in the codebase.
- Both `CraMonthSelector` and `CraHistory` return `AbortController` cleanup from `useEffect` (D7), preventing the "state update on unmounted component" warning.
- `CraSummaryDto` is defined once in `api/types.ts` (D5); no duplicate type drift.

One jsdom-specific noise line (`Error: Not implemented: navigation (except hash changes)`) appears in `CraHistory.test.tsx` during the PDF download test. This is a test-environment artifact from jsdom's inability to simulate anchor click navigation; it does not occur in a real browser and is non-blocking.

---

### 3. Failed requests are handled without breaking the page
**PASS**

- `getCra` failure sets `craError` and renders an error message in both `CraSummaryPanel` and `CalendarGrid` without crashing the page.
- `listCras` failure in both `CraMonthSelector` and `CraHistory` renders a `role="alert"` message.
- `createCra` failure shows inline error and re-enables the button.
- `downloadCraPdf` failure shows `downloadError` inline while keeping the table visible.
- `ErrorBoundary` catches unhandled render exceptions.
- Tests confirm each of these paths.

---

### 4. State remains consistent after rapid or repeated user interactions
**PASS**

`AbortController` is used in both `CraMonthSelector` and `CraHistory` `useEffect` hooks: if the component unmounts before the fetch resolves, the request is aborted and no state update runs on the dead component. `handleOpen` resets `craLoading` and `craError` at each invocation, preventing stale state from a previous CRA load.

---

### 5. Significant fixed defects have regression tests
**PASS**

| Defect | Test file | Coverage |
|--------|-----------|----------|
| D1 — getCra never called | `App.test.tsx` | 4 cases: getCra called, day data rendered, loading state, error state |
| D2 — wrong env var | `httpClient.test.ts` | prefixes with `VITE_API_BASE_URL`; empty base URL fallback |
| D4 — legacy api/cra.ts | `CraMonthSelector.test.tsx` | `createCra` called and result reflected |
| D4/D7 — CraHistory errors | `CraHistory.test.tsx` | PDF failure renders error and keeps table visible |
| D7 — AbortSignal | `httpClient.test.ts` | `AbortSignal` forwarded; `AbortError` re-thrown unwrapped |

---

### 6. Existing automated tests pass
**PASS**

All 70 tests across 8 files pass. No pre-existing test was broken.

---

### 7. A short list of fixed defects included in the PR description
**NOT VERIFIABLE**

No PR has been created yet. This criterion must be satisfied when the PR is opened.

---

## Implementation gaps and observations

### POST URL discrepancy (D3) — non-blocking, documented
`createCra` in `craClient.ts:10` still posts to `/api/cra` while all other CRA endpoints use `/api/cras`. The backend has no CRA routes at all (only `/health`), so the correct URL cannot be verified against a live router. The coder added a `NOTE` comment. This must be resolved once the backend CRA router is implemented; it is not a frontend-layer regression.

### Dead code in `types/cra.ts` — non-blocking
`types/cra.ts:25-34` defines a local `CraDetailsDto extends CraSummaryDto` that no consumer imports. `App.tsx` correctly imports `CraDetailsDto` from `api/types`. This is harmless dead code left over from the D5 consolidation; a follow-up cleanup is appropriate.

---

## Verdict

**PASS** — all verifiable acceptance criteria are satisfied. The two observations above are non-blocking and clearly scoped to follow-up work.
