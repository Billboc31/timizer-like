Good — the `VITE_API_BASE_URL` env var is consistent with the Vite toolchain used (plan mentioned CRA but implementation correctly uses Vite). All core checks are complete. Let me produce the test report.

---

## Test Report — T020 Create CRA Calendar Grid

### Execution summary

| Check | Result |
|---|---|
| TypeScript compilation (`tsc --noEmit`) | **PASS** — no errors |
| Test suite (`npm test`) | **PASS** — 8/8 tests |

### Acceptance criteria

**1. Calendar displays every day of the selected month**
- PASS. `daysInMonth = new Date(cra.year, cra.month, 0).getDate()` correctly computes month length. Verified by two test cases: July 2026 → 31 cells, February 2026 → 28 cells.

**2. Weekday labels are visible**
- PASS. Each cell renders `<span className="day-cell__weekday">{WEEKDAY_ABBR[weekdayIndex]}</span>` using a local `['Sun','Mon',…,'Sat']` array derived from `Date.getDay()`.

**3. Current work value is visible for each day**
- PASS. Each cell renders `<span className="day-cell__worked">{worked}</span>`. Falls back to `0` for days absent from `cra.days` via `dayMap.get(day)?.worked ?? 0`. Both cases tested.

**4. Weekends are visually distinguishable**
- PASS. CSS class `day-cell--weekend` applied on Saturday (index 6) and Sunday (index 0). Distinct background (`#f0f0f0`) and muted text (`#888`) in CSS. Test explicitly checks all 31 days of July 2026 against known weekend set `{4,5,11,12,18,19,25,26}`.

**5. Calendar updates when a different CRA month is loaded**
- PASS. The component is fully reactive: it derives all cells from props (`cra.month`, `cra.year`) with no internal state. Confirmed by the February 2026 test case (28 cells). No month-switching UI exists per plan's explicit exclusion, but the component correctly re-renders for any prop change.

**6. Empty and loading states are handled**
- PASS. Three distinct states handled and tested:
  - `loading=true` → `<div className="calendar-loading">Loading...</div>`
  - `error` non-null → `<div className="calendar-error">{error}</div>`
  - `cra=null`, not loading → `<div className="calendar-empty">No CRA data available.</div>`

### Regressions

None — this is a new frontend with no prior code.

### Observations (non-blocking)

- The plan described bootstrapping via Create React App but the implementation uses Vite + React. This is a better choice and all acceptance criteria are met. The env variable prefix was correctly updated from `REACT_APP_` to `VITE_` accordingly.
- `App.tsx` has `fetchCra(2026, 7)` hard-coded with no month-switching UI, which is explicit in the plan's exclusions and matches the ticket's out-of-scope list.

### Verdict

**VALIDATED** — all 6 acceptance criteria pass, TypeScript is clean, and all 8 automated tests pass.
