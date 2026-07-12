# Test Report — T019 CraMonthSelector

**Date**: 2026-07-12  
**Branch**: ticket/T019-create-cra-month-selector  
**Tester**: Claude (Tester role)

---

## Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | User can select a month | ✅ PASS | `<select id="month-select">` with options January–December (values 1–12) |
| 2 | User can select a year | ✅ PASS | `<input type="number" id="year-input" min={2000}>` with state binding |
| 3 | User can open an existing CRA for the selected period | ✅ PASS | "Open CRA" button appears when `cras` contains an entry matching `selectedMonth + selectedYear`; calls `onOpen(existingCra)` |
| 4 | User can create a CRA when none exists | ✅ PASS | "Create CRA" button calls `createCra(year, month)`, adds result to local list, then calls `onOpen(summary)` |
| 5 | Selected period is displayed clearly | ✅ PASS | `<h2>{periodLabel}</h2>` shows e.g. "July 2026", updates on every selection change |
| 6 | UI handles loading state | ✅ PASS | `<p>Loading...</p>` rendered while `listCras()` is pending; `<p>Creating...</p>` and disabled button while `createCra()` is pending |
| 7 | UI handles error states | ✅ PASS | Load error: `<p role="alert">{error}</p>` replaces component; create error: `<p role="alert">{createError}</p>` inline with button re-enabled |

---

## Test Execution

**Command**: `npm test` (Vitest 3.2.7, jsdom environment)  
**Result**: 9/9 tests passed in 523 ms

| Test | Result |
|------|--------|
| renders loading indicator while fetching | ✅ |
| renders error when listCras fails | ✅ |
| renders month select and year input after loading | ✅ |
| shows "Create CRA" button when no CRA exists for the period | ✅ |
| shows "Open CRA" button when a CRA exists for the current period | ✅ |
| calls onOpen with the existing CRA when "Open CRA" is clicked | ✅ |
| calls createCra then onOpen when "Create CRA" is clicked | ✅ |
| shows create error and re-enables button on failure | ✅ |
| displays the selected period as a formatted label | ✅ |

**TypeScript**: `tsc --noEmit` — no errors.

---

## Regressions

None observed. The implementation is additive (new frontend scaffold + new component); no existing code was modified.

---

## Known Limitations (non-blocking, inherited from review)

1. **Year validation is HTML-only** — `min={2000}` on the input does not prevent React state from accepting `1999`; would be passed to `createCra` if typed manually.
2. **Empty year field** — clearing the year input stores `0` in state, rendering "Create CRA" for an invalid period.
3. **API route asymmetry** — `GET /api/cras` vs `POST /api/cra` (singular/plural) to reconcile when backend is implemented.
4. **No retry on load error** — UX is blocked on network failure; not required by ticket scope.

These are pre-existing issues documented in the implementation review, not regressions introduced by this phase.

---

## Decision

**TESTS_PASSED** — All 7 acceptance criteria are satisfied. All 9 unit tests pass. No regressions detected. The 4 known limitations are minor and non-blocking per ticket scope.
