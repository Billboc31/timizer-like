Now I have all the information needed to produce the test report. Let me write it up.

---

## T024 — Test Report: Create PDF download UI

### Environment

- Test suite: Vitest 4.1.10
- TypeScript: clean (`tsc --noEmit` exits 0)
- Tests run: 35 total across 3 files

---

### Acceptance Criteria

#### AC1 — Download action is visible for validated CRA records

**PASS** (unit)

`CalendarGrid.tsx:59` renders the download button inside `{isValidated && (...)}`. The test `"download button present for VALIDATED CRA"` confirms this. TypeScript is clean.

---

#### AC2 — Download action is disabled or hidden for draft CRA records

**PASS** (unit)

Same conditional: the button is not rendered when `status !== 'VALIDATED'`. The test `"download button absent for DRAFT CRA"` confirms absence via `queryByRole`.

---

#### AC3 — Clicking download retrieves the PDF from the backend

**FAIL** (integration gap)

At the component level, `handleDownload` correctly calls `onDownload(cra.id)` and the test confirms `downloadCraPdf` call flow. However, **`CalendarGrid` is never rendered anywhere in the app**, and **`downloadCraPdf` is never passed as `onDownload` to any component**.

`App.tsx` only renders `<CraMonthSelector onOpen={handleOpen} />` where `handleOpen` just calls `console.log`. There is no CRA detail view, no page that mounts `CalendarGrid`, and no wiring of `downloadCraPdf`. The download feature is unreachable in the running application.

Secondary issue: `craClient.ts:3` reads `process.env.REACT_APP_API_BASE_URL` (CRA-style), which is inert in a Vite project. The fallback `''` makes requests relative, which may work in dev — but the env var convention is wrong.

---

#### AC4 — Browser downloads the PDF file

**PASS** (unit) / **BLOCKED** (integration)

The anchor-click pattern in `handleDownload` (lines 42–49 of `CalendarGrid.tsx`) is correct and tested. Verified at the unit level. Cannot verify end-to-end because the component is not mounted in the app (see AC3).

---

#### AC5 — Download errors are displayed clearly

**PASS** (unit)

On rejection, `downloadError` state is set and rendered as `<span role="alert">`. The test `"rejected onDownload shows alert with error message"` confirms the error text appears.

---

#### AC6 — Existing frontend checks still pass

**PASS**

All 35 tests pass. TypeScript is clean.

---

### Regressions

None found. The 28 pre-existing tests (calendar rendering, day cells, worked values, error/loading/empty states, `createCra`, `getCra`, `updateDay`, `validateCra`, `listCras`, error-mapping) all pass unchanged.

---

### Blocking Issues

| # | Severity | Issue |
|---|----------|-------|
| 1 | **Blocking** | `CalendarGrid` is never mounted in the app — the download button is unreachable by a user |
| 2 | **Blocking** | `downloadCraPdf` is never passed as `onDownload` — clicking the button would silently do nothing even if the component were rendered |

### Non-blocking Observations

| # | Severity | Issue |
|---|----------|-------|
| 3 | Minor | `craClient.ts` uses `process.env.REACT_APP_API_BASE_URL` (CRA-style), which is ignored by Vite; should be `import.meta.env.VITE_API_BASE_URL` |
| 4 | Minor | Two parallel API client files (`api/cra.ts` used by `CraMonthSelector`, `api/craClient.ts` used by new functions) with inconsistent error handling |

---

### Verdict

**REFUSE — implementation incomplete.**

The component and API function are correctly built and tested in isolation, but are not integrated into the application. A user cannot access the download feature. AC3 fails at the integration level. The implementation requires a CRA detail view that renders `<CalendarGrid ... onDownload={downloadCraPdf} />` to be considered done.
