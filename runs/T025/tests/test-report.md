No type errors. Here is the test report:

---

## Test Report — T025: CRA History Page

### Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | History page lists CRA records from the backend | **PASS** | `CraHistory` calls `listCras()` on mount; `App.tsx` routes to it via "History" nav button |
| 2 | Each CRA row displays period, status, and total worked days | **PASS** | Table renders `MONTH_NAMES[cra.month-1] + year`, `cra.status`, `cra.totalWorkedDays`; test verifies "July 2026", "DRAFT", "20" |
| 3 | User can open a CRA from history | **PASS** | "Open" button calls `onOpen(cra)`; tested with `fireEvent.click` + spy |
| 4 | User can download a PDF from history when CRA is validated | **PASS** | "Download PDF" button only shown for `status === 'VALIDATED'`; calls `downloadCraPdf(id)` and triggers anchor download; hidden for DRAFT |
| 5 | Empty history state is displayed clearly | **PASS** | Returns `<p>No CRA records found.</p>` when `cras.length === 0` |
| 6 | Loading and error states are handled | **PASS** | Loading: `<p>Loading...</p>` during fetch; Error: `<p role="alert">` with message; PDF download error shown inline while table remains visible |

### Additional Notes

- **Validation date**: shown when available, renders `—` when `null`. Not in criteria but correctly implemented.
- **Navigation warning** (`Not implemented: navigation`): jsdom noise from `a.click()` during PDF download test — not a test failure, expected in jsdom environments.
- **TypeScript**: compiles cleanly with no errors.
- **No regressions**: all 40 tests pass (12 API client, 10 CalendarGrid, 11 CraHistory, 9 CraMonthSelector).

### Result

**VALIDATED** — all 6 acceptance criteria are satisfied.
