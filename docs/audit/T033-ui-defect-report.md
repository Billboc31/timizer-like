# T033 — UI Defect Report

**Date:** 2026-07-27  
**Branch:** `ticket/T033-audit-the-current-frontend-ui-and-produce-a-priori`  
**Stack:** React 19 + TypeScript + Vite 8 · Backend: Spring Boot on `localhost:8081`  
**Method:** Static code analysis of all `frontend/src/` files + live API inspection via `curl`  
**Frontend dev server:** not started during audit (code-level analysis supplemented by direct API calls)

---

## Summary

| Severity | Count |
|----------|-------|
| Blocker  | 3     |
| Major    | 8     |
| Minor    | 13    |
| Cosmetic | 5     |
| **Total** | **29** |

---

## Blockers

### B-001 — CalendarGrid is entirely read-only: worked hours cannot be edited

| Field | Value |
|-------|-------|
| **Route / Component** | `CalendarGrid` / `src/components/CalendarGrid/CalendarGrid.tsx` |
| **Reproducible steps** | 1. Open any CRA. 2. Try clicking on any day cell to change worked hours. |
| **Expected** | User can toggle a day's worked value (0 → 0.5 → 1 → 0) or enter a value. |
| **Actual** | Day cells are `<div>` elements with no click handler; `updateDay()` from `craClient.ts` is declared but never called from any component. There is no UI affordance for editing. |
| **Console / Network** | `PATCH /api/cras/:id/days/:date` is never triggered. Endpoint confirmed working via direct curl test. |
| **Suggested ticket** | `T0XX — Implement day-cell editing in CalendarGrid` |

---

### B-002 — Opening a CRA always shows empty calendar: actual worked days are never fetched

| Field | Value |
|-------|-------|
| **Route / Component** | `App.tsx:27-29`, `CraMonthSelector`, `CraHistory` |
| **Reproducible steps** | 1. Click "New CRA" or "History". 2. Open any existing CRA. 3. Observe CalendarGrid and CraSummaryPanel. |
| **Expected** | Full CRA details (all days with their worked values, provider/client info) are loaded from the backend. |
| **Actual** | `handleOpen` in `App.tsx` constructs `{ ...summary, days: [] }`. The `CraDetails` object always has an empty `days` array and no provider/client fields. `getCra(id)` from `craClient.ts` is never called. Every day in CalendarGrid shows worked = 0. |
| **Root cause** | `CraSummaryDto` (the type returned by `listCras()`) has no `days` field. App.tsx spreads it directly without fetching full details. The `GET /api/cras/:id` endpoint (which would return days) also returns 404 (see B-003). |
| **Suggested ticket** | `T0XX — Fetch CRA details on open and populate CalendarGrid` |

---

### B-003 — GET /api/cras/:id returns 404 — backend endpoint not implemented

| Field | Value |
|-------|-------|
| **Route / Component** | `src/api/craClient.ts:14` — `getCra(id)` |
| **Reproducible steps** | `curl http://localhost:8081/api/cras/1` |
| **Expected** | Returns full `CraDetailsDto` including days array and provider/client fields. |
| **Actual** | `{"timestamp":"…","status":404,"error":"Not Found","path":"/api/cras/1"}` |
| **Note** | The function is annotated `// NOTE: backend endpoint GET /api/cras/:id is pending implementation`. |
| **Suggested ticket** | `T0XX — Implement GET /api/cras/:id backend endpoint` |

---

## Major

### M-001 — CraSummaryPanel always shows "—" for provider and client names

| Field | Value |
|-------|-------|
| **Route / Component** | `CraSummaryPanel` / `src/components/CraSummaryPanel/CraSummaryPanel.tsx:20-21` |
| **Reproducible steps** | Open any CRA; observe the summary panel. |
| **Expected** | Provider name, provider company, and client name show values from backend (e.g., "Provider Name", "Provider Company", "Client Contact"). |
| **Actual** | All three fields display "—" because `CraDetails` is constructed from `CraSummaryDto` which has no provider/client fields (consequence of B-002). Backend does return these values in `POST /api/cra` and `POST /api/cras/:id/validate` responses. |
| **Suggested ticket** | `T0XX — Fetch and display provider/client fields in CraSummaryPanel` (blocked by B-002/B-003) |

---

### M-002 — No error boundary: any render error crashes the entire app to a blank screen

| Field | Value |
|-------|-------|
| **Route / Component** | `App.tsx` (root), `main.tsx` |
| **Reproducible steps** | Trigger any unhandled JavaScript error in a component (e.g., null dereference). |
| **Expected** | A fallback UI is displayed; other parts of the app remain functional. |
| **Actual** | No `<ErrorBoundary>` wrapping in `App.tsx` or `main.tsx`. Any thrown error during render propagates to React root, unmounting the entire tree and leaving a blank screen. |
| **Suggested ticket** | `T0XX — Add React ErrorBoundary to App root` |

---

### M-003 — CalendarGrid layout breaks at mobile widths: cells wrap by pixel width, not by week

| Field | Value |
|-------|-------|
| **Route / Component** | `CalendarGrid` / `src/components/CalendarGrid/CalendarGrid.css` |
| **Reproducible steps** | Resize browser to 375 px width; open a CRA. |
| **Expected** | Calendar shows 7 columns (one per weekday) or a clear mobile-optimized layout. |
| **Actual** | `flex-wrap: wrap` + `min-width: 64px` causes cells to wrap by available space. At 375 px, approximately 4–5 cells fit per row (depending on padding). Day 1 of a month may be on any weekday, so cells do not align with weekday columns across rows. The display is unreadable as a calendar. |
| **Breakpoints verified** | 375 px: broken. 768 px: marginal (6–7 cells/row depending on scrollbar). 1280 px: acceptable. |
| **Suggested ticket** | `T0XX — Fix CalendarGrid responsive layout for mobile` |

---

### M-004 — Duplicate API clients with different env-var names and different error handling

| Field | Value |
|-------|-------|
| **Route / Component** | `src/api/cra.ts` and `src/api/httpClient.ts` |
| **Reproducible steps** | Code review. |
| **Expected** | Single API layer with consistent error handling and environment configuration. |
| **Actual** | Two separate modules exist with overlapping functions (`listCras`, `createCra`, `downloadCraPdf`). `httpClient.ts` reads `process.env.REACT_APP_API_BASE_URL` (CRA-style — unavailable in Vite; always resolves to `""`). `cra.ts` reads `import.meta.env.VITE_API_BASE_URL` (Vite-style). `cra.ts` throws generic `Error` objects; `craClient.ts` throws typed `ApiError`. Components use `cra.ts` for list/create/download and `craClient.ts` for validate — inconsistent behavior. |
| **Suggested ticket** | `T0XX — Consolidate API client modules and unify error handling` |

---

### M-005 — CraDetailsDto in api/types.ts missing provider/client fields; validate flow loses them

| Field | Value |
|-------|-------|
| **Route / Component** | `src/api/types.ts:9-18`, `App.tsx:10-18` — `dtoToDetails()` |
| **Reproducible steps** | 1. Open a DRAFT CRA. 2. Click "Valider le CRA" and confirm. |
| **Expected** | After validation, CraSummaryPanel shows provider/client info from the response. |
| **Actual** | `CraDetailsDto` in `api/types.ts` declares no `providerFirstName`, `providerLastName`, `providerCompany`, `clientFirstName`, `clientLastName`, `clientCompany` fields. `dtoToDetails()` only maps `id`, `month`, `year`, `totalWorkedDays`, `status`, and `days`. Provider/client info present in the backend's validate response is silently dropped. |
| **Suggested ticket** | `T0XX — Add provider/client fields to CraDetailsDto and dtoToDetails mapping` |

---

### M-006 — CraValidation error message shows raw error code, not human-readable text

| Field | Value |
|-------|-------|
| **Route / Component** | `CraValidation` / `src/components/CraValidation/CraValidation.tsx:39-43` |
| **Reproducible steps** | 1. Trigger a network error during validation (e.g., stop backend). 2. Observe error message. |
| **Expected** | User-readable error (e.g., "Network error. Please check your connection."). |
| **Actual** | `ApiError` sets `this.message = code` via `super(code)` (see `apiError.ts:15`). When the code is a known non-`unknown_error` code, `e.message` equals the raw code string (e.g., `"network_error"`, `"cra_validated"`). This technical string is shown directly to the user. The French fallback `"Une erreur est survenue. Veuillez réessayer."` is only used for `unknown_error` — the most common error codes show machine-readable text instead. |
| **Suggested ticket** | `T0XX — Map ApiError codes to user-readable messages in CraValidation` |

---

### M-007 — CraSummaryDto in api/types.ts missing validationDate; type definitions are duplicated

| Field | Value |
|-------|-------|
| **Route / Component** | `src/api/types.ts:20-26` vs `src/types/cra.ts:1-8` |
| **Reproducible steps** | Code review; compare the two `CraSummaryDto` definitions. |
| **Expected** | Single authoritative type definition matching the backend contract. |
| **Actual** | `api/types.ts` defines `CraSummaryDto` without `validationDate`. `types/cra.ts` defines `CraSummaryDto` with `validationDate: string \| null`. Backend always returns `validationDate` in list responses. The app currently uses `types/cra.ts` version (via `cra.ts`), so no runtime error today, but the `api/types.ts` type is a documentation mismatch that will mislead future contributors. |
| **Suggested ticket** | `T0XX — Consolidate and deduplicate frontend type definitions` |

---

### M-008 — CraSummaryPanel shows "Client company" field but it is never populated

| Field | Value |
|-------|-------|
| **Route / Component** | `CraSummaryPanel` / `src/components/CraSummaryPanel/CraSummaryPanel.tsx:40-46` |
| **Reproducible steps** | Open any CRA; inspect the summary panel. |
| **Expected** | Client company is shown alongside provider company. |
| **Actual** | `CraSummaryPanel` renders Provider / Provider company / Client — but not Client company, even though `CraDetails.clientCompany` exists in the type. Conversely, because B-002 means `CraDetails` is always built from `CraSummaryDto`, `clientCompany` is always `undefined` even when the backend provides it. The asymmetry (provider company shown, client company not shown) is an additional display inconsistency. |
| **Suggested ticket** | `T0XX — Add client company to CraSummaryPanel display` (blocked by B-002) |

---

## Minor

### Min-001 — App.css is never imported: header/main padding rules are dead code

| Field | Value |
|-------|-------|
| **Route / Component** | `src/App.tsx`, `src/App.css` |
| **Steps** | Code review. |
| **Expected** | `App.css` rules apply to the app layout. |
| **Actual** | `App.tsx` does not import `./App.css`. The `header { padding: 1rem }` and `main { padding: 1rem }` rules never apply. Additionally, `App.tsx` renders a plain `<div>`, not `<header>` or `<main>` elements, so the selectors would not match even if imported. |
| **Suggested ticket** | `T0XX — Fix App.css import and layout structure` |

---

### Min-002 — Navigation has no active state: selected view is invisible

| Field | Value |
|-------|-------|
| **Route / Component** | `App.tsx:38-41` |
| **Steps** | Click the "History" button; observe both buttons. |
| **Expected** | Active view button is visually distinct (bold, underline, different background, etc.). |
| **Actual** | Both nav buttons are unstyled `<button>` elements with identical appearance. No `aria-current`, no CSS class difference based on `view` state. |
| **Suggested ticket** | `T0XX — Add active state to navigation buttons` |

---

### Min-003 — Year input has no maximum bound

| Field | Value |
|-------|-------|
| **Route / Component** | `CraMonthSelector` / `src/components/CraMonthSelector/CraMonthSelector.tsx:86-92` |
| **Steps** | In the month selector, type a year of 9999. |
| **Expected** | Input rejects or warns for unreasonable years. |
| **Actual** | Input has `min={2000}` but no `max` attribute. User can enter any year and attempt to create a CRA for it. |
| **Suggested ticket** | `T0XX — Add max year constraint to CraMonthSelector` |

---

### Min-004 — CraHistory download error is never cleared before a retry attempt

| Field | Value |
|-------|-------|
| **Route / Component** | `CraHistory` / `src/components/CraHistory/CraHistory.tsx:34-48` |
| **Steps** | 1. Click "Download PDF" on a validated CRA with backend unavailable → error appears. 2. Restore backend. 3. Click "Download PDF" again. |
| **Expected** | Previous error clears before the new attempt starts. |
| **Actual** | `setDownloadError(null)` is never called at the start of `handleDownloadPdf`. Old error remains visible while new download is in progress, and replaces itself with the same error on repeated failure. |
| **Suggested ticket** | `T0XX — Clear download error on retry in CraHistory` |

---

### Min-005 — PDF anchor element not appended to DOM before click (Firefox compatibility)

| Field | Value |
|-------|-------|
| **Route / Component** | `CraHistory` / `src/components/CraHistory/CraHistory.tsx:37-43` |
| **Steps** | Download a PDF in Firefox. |
| **Expected** | File downloads. |
| **Actual** | `a.click()` is called on a detached `<a>` element (not appended to `document.body`). This pattern is unreliable in Firefox, which requires the element to be in the DOM for programmatic click to trigger a download. |
| **Suggested ticket** | `T0XX — Fix PDF download trigger for Firefox` |

---

### Min-006 — Accessibility: CalendarGrid day cells have no aria-label

| Field | Value |
|-------|-------|
| **Route / Component** | `CalendarGrid` / `src/components/CalendarGrid/CalendarGrid.tsx:35-46` |
| **Steps** | Navigate the calendar with a screen reader. |
| **Expected** | Each cell is announced as e.g. "Monday 7 July, worked: 1 day". |
| **Actual** | Each cell is three `<span>` elements with no grouping semantics. Screen reader reads "7", "Mon", "1" as separate items with no context. |
| **Suggested ticket** | `T0XX — Add aria-label to CalendarGrid day cells` |

---

### Min-007 — Accessibility: navigation buttons have no aria-current

| Field | Value |
|-------|-------|
| **Route / Component** | `App.tsx:38-41` |
| **Steps** | Navigate with a screen reader or keyboard only. |
| **Expected** | Active view button has `aria-current="page"` or similar. |
| **Actual** | No ARIA attributes on navigation buttons. Screen reader cannot announce which view is active. |
| **Suggested ticket** | `T0XX — Add aria-current to active navigation button` |

---

### Min-008 — CraValidation disappears after validation with no success feedback

| Field | Value |
|-------|-------|
| **Route / Component** | `CraValidation` / `src/components/CraValidation/CraValidation.tsx:19` |
| **Steps** | Successfully validate a CRA. |
| **Expected** | Success confirmation message ("CRA validated successfully") is shown. |
| **Actual** | `if (!cra \|\| cra.status === 'VALIDATED') return null` — component unmounts silently. No toast, no inline confirmation. The user is left with no feedback that the action succeeded. |
| **Suggested ticket** | `T0XX — Show success message after CRA validation` |

---

### Min-009 — `lru-cache` is listed as a runtime dependency but is never imported

| Field | Value |
|-------|-------|
| **Route / Component** | `frontend/package.json` |
| **Steps** | Search for `lru-cache` imports across `src/`. |
| **Expected** | All declared dependencies are used. |
| **Actual** | No file in `src/` imports `lru-cache`. It adds ~50 KB to the bundle unnecessarily. |
| **Suggested ticket** | `T0XX — Remove unused lru-cache dependency` |

---

### Min-010 — Dark mode declared but not implemented: hardcoded colours may be unreadable

| Field | Value |
|-------|-------|
| **Route / Component** | `src/index.css:4`, component CSS files |
| **Steps** | Enable system dark mode; open the app. |
| **Expected** | Either dark mode is fully supported or `color-scheme` is set to `light` only. |
| **Actual** | `color-scheme: light dark` permits the browser to apply native dark colours to form elements. However, component CSS files use hardcoded hex values (e.g., `#ccc`, `#888`, `#fef3c7`, `#2563eb`) with no `@media (prefers-color-scheme: dark)` overrides. Custom elements may show unreadable contrast (e.g., light text on light background) in dark mode. |
| **Suggested ticket** | `T0XX — Add dark mode support or restrict color-scheme to light` |

---

### Min-011 — CraHistory "Open" action does not indicate CRA is read-only after validation

| Field | Value |
|-------|-------|
| **Route / Component** | `CraHistory` / `src/components/CraHistory/CraHistory.tsx:81` |
| **Steps** | View a VALIDATED CRA from history; click "Open". |
| **Expected** | UI indicates that the CRA cannot be edited (since it is VALIDATED). |
| **Actual** | The "Open" button label is identical for DRAFT and VALIDATED CRAs. Once opened, the CraValidation component returns null (correct), but CalendarGrid would still show cells as if editing were possible (when editing is implemented). No read-only indicator on the CRA view. |
| **Suggested ticket** | `T0XX — Show read-only indicator for VALIDATED CRAs` |

---

### Min-012 — MONTH_NAMES constant duplicated in three components

| Field | Value |
|-------|-------|
| **Route / Component** | `CraMonthSelector.tsx:5-8`, `CraSummaryPanel.tsx:3-6`, `CraHistory.tsx:6-9` |
| **Steps** | Code review. |
| **Expected** | Shared constant in a utility file. |
| **Actual** | Identical 12-element array defined three times. Risk of divergence (e.g., locale change applied in only two places). |
| **Suggested ticket** | `T0XX — Extract MONTH_NAMES to shared utility` |

---

### Min-013 — CraMonthSelector error message shows raw HTTP error text to the user

| Field | Value |
|-------|-------|
| **Route / Component** | `CraMonthSelector` / `src/components/CraMonthSelector/CraMonthSelector.tsx:31-33` |
| **Steps** | Load app with backend unavailable. |
| **Expected** | User-friendly error ("Could not load CRA list. Please check your connection."). |
| **Actual** | `setError(err instanceof Error ? err.message : 'Failed to load CRAs')` — if `cra.ts` throws `new Error('Failed to list CRAs: 500')`, the raw string including the HTTP status code is rendered directly in the UI. |
| **Suggested ticket** | `T0XX — Improve user-facing error messages in CraMonthSelector` |

---

## Cosmetic

### C-001 — App heading "Timizer Like" appears to be a placeholder

| Field | Value |
|-------|-------|
| **Route / Component** | `App.tsx:37` |
| **Note** | `<h1>Timizer Like</h1>` — "Like" suggests a placeholder or prototype name. |
| **Suggested ticket** | `T0XX — Update app title and h1 to final product name` |

---

### C-002 — CalendarGrid weekend cells have no legend or label

| Field | Value |
|-------|-------|
| **Route / Component** | `CalendarGrid` |
| **Note** | Gray cells represent weekends but there is no caption, legend, or tooltip explaining this. New users may be confused. |
| **Suggested ticket** | `T0XX — Add weekend legend to CalendarGrid` |

---

### C-003 — Worked hours shown as raw decimal, no unit

| Field | Value |
|-------|-------|
| **Route / Component** | `CalendarGrid`, `CraSummaryPanel` |
| **Note** | CalendarGrid cells show "0", "0.5", "1"; CraSummaryPanel shows "23.0" for total worked days — no unit label ("day", "days", "j"). |
| **Suggested ticket** | `T0XX — Add unit labels to worked hours display` |

---

### C-004 — "No CRA data available" empty state is ambiguous on first load

| Field | Value |
|-------|-------|
| **Route / Component** | `CalendarGrid` / `src/components/CalendarGrid/CalendarGrid.tsx:20-21` |
| **Note** | Before any CRA is opened, CalendarGrid renders "No CRA data available." This message appears below a fully visible CraMonthSelector, making it look like an error rather than an expected empty state. |
| **Suggested ticket** | `T0XX — Improve CalendarGrid empty state copy and placement` |

---

### C-005 — CraSummaryPanel "Total worked days" shows backend float (e.g., "23.0")

| Field | Value |
|-------|-------|
| **Route / Component** | `CraSummaryPanel` / `src/components/CraSummaryPanel/CraSummaryPanel.tsx:32-34` |
| **Note** | Backend returns `totalWorkedDays: 23.0`. Displayed as "23.0" — the trailing zero is visually noisy. Should format as integer when applicable. |
| **Suggested ticket** | `T0XX — Format totalWorkedDays without unnecessary decimal in CraSummaryPanel` |

---

## Browser Console Errors (code-level analysis)

| ID | Description | Severity |
|----|-------------|----------|
| CE-001 | **React StrictMode double-invokes effects**: `listCras()` fires twice on mount in development (both `CraMonthSelector` and `CraHistory`). Causes duplicate GET `/api/cras` requests in dev. Expected React 19 behaviour but worth knowing. | Cosmetic (dev-only) |
| CE-002 | **`createRoot(…getElementById('root')!)`**: non-null assertion without fallback. If `#root` is absent, React throws a cryptic error at startup. | Minor |

---

## Network Errors (confirmed via API inspection)

| ID | Endpoint | HTTP Status | Error Body | Severity |
|----|----------|-------------|------------|----------|
| NE-001 | `GET /api/cras/:id` | 404 Not Found | Spring default error page | **Blocker** |
| NE-002 | `GET /api/cras/:id/pdf` (DRAFT CRA) | 422 Unprocessable Entity | `{"error":"cra_not_validated"}` | Minor (button hidden for DRAFT) |
| NE-003 | `POST /api/cras/:id/validate` (already VALIDATED) | 409 Conflict | `{"error":"cra_validated"}` | Minor (CRA validated guard works) |
| NE-004 | `PATCH /api/cras/:id/days/:date` with invalid workValue | 400 | `{"error":"invalid_work_value","value":2.0}` | Minor (never triggered from UI) |
| NE-005 | `cra_not_validated` error code (from NE-002) | — | Not listed in `ApiErrorCode` type in `apiError.ts` | Minor |

---

## Accessibility Violations (static analysis)

| ID | Description | WCAG | Severity |
|----|-------------|------|----------|
| A-001 | CalendarGrid day cells: three unlabelled `<span>` elements, no group `aria-label` | 1.3.1 Info and Relationships | Minor |
| A-002 | Navigation buttons: no `aria-current` on active view | 4.1.2 Name, Role, Value | Minor |
| A-003 | `<h2>{periodLabel}</h2>` in `CraMonthSelector` is inside the selector, not at section level — heading hierarchy may confuse screen readers (`h1` → `h2` directly but nothing semantically separates sections) | 1.3.1 | Cosmetic |
| A-004 | Error messages (`<p role="alert">`) in `CraMonthSelector` and `CraHistory` show technical HTTP text | 3.3.3 Error Suggestion | Minor |

---

## Responsiveness Summary

| Breakpoint | CalendarGrid | CraMonthSelector | CraSummaryPanel | CraHistory |
|------------|-------------|-----------------|-----------------|------------|
| 375 px | **Broken** — cells wrap 4–5/row with no week alignment | Acceptable — stacks vertically | Acceptable — `<dl>` blocks | Acceptable — table overflows horizontally |
| 768 px | Marginal — 6–7 cells/row, week alignment inconsistent | OK | OK | OK but table may overflow |
| 1280 px | Acceptable — all cells in a few rows | OK | OK | OK |

CraHistory table has no horizontal scroll wrapper; at 375 px the table overflows the viewport without scrollbar styling.

---

## Inspection Checklist

| View / Flow | Inspected | Defects found |
|-------------|-----------|--------------|
| App root (routing, layout) | ✅ | Min-001, Min-002, M-002, C-001 |
| CraMonthSelector (selector, create) | ✅ | Min-003, Min-013, CE-001, M-004 |
| CalendarGrid (day display, weekends) | ✅ | B-001, B-002, M-003, Min-006, C-002, C-003, C-004 |
| CraSummaryPanel (summary fields) | ✅ | M-001, M-008, C-005 |
| CraValidation (validate flow) | ✅ | M-005, M-006, Min-008 |
| CraHistory (list, open, PDF download) | ✅ | Min-004, Min-005, Min-011, CE-001 |
| API client layer | ✅ | B-003, M-004, M-005, M-007, NE-001–NE-005 |
| Browser console errors | ✅ (code analysis) | CE-001, CE-002 |
| Network panel | ✅ (curl) | NE-001–NE-005 |
| Responsiveness 375 px | ✅ (CSS analysis) | M-003 (CalendarGrid), table overflow |
| Responsiveness 768 px | ✅ (CSS analysis) | M-003 (marginal) |
| Responsiveness 1280 px | ✅ (CSS analysis) | No defect |
| Accessibility | ✅ (code analysis) | A-001–A-004, Min-007 |
