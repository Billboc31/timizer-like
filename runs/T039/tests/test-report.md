The TypeScript errors (`process` not typed in `httpClient.ts`) are pre-existing and unrelated to T039. All 16 tests pass. I have enough to write the full report.

---

## Test Report — T039: Redesign the CRA history page

### Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | CRAs are ordered from newest to oldest | **PASS** | Sort: `b.year - a.year`, then `b.month - a.month` (line 50). Test "sorts CRAs newest first" verifies July > June > May. |
| 2 | Period, total, status, and available actions are easy to scan | **PASS** | Card renders `period`, `totalWorkedDays`, status badge, and action buttons in a horizontal flex row with clear labels ("Days:", "Validated:"). |
| 3 | Draft and validated entries are visually distinct | **PASS** | Two CSS classes: `cra-history__badge--draft` (amber #fef3c7 / #92400e) and `cra-history__badge--validated` (mint #d1fae5 / #065f46). Tests for each badge class pass. |
| 4 | PDF download is available only when applicable | **PASS** | Download button rendered only when `cra.status === 'VALIDATED'` (line 140). Tests confirm absent for DRAFT, present for VALIDATED. |
| 5 | Empty, loading, and failure states are handled | **PASS** | Three separate render paths: `LoadingSkeleton` (with `aria-busy="true"`), `role="alert"` error banner, and empty state with icon + hint text. All three tested. |
| 6 | View works on desktop and mobile without horizontal overflow | **PASS** | Cards use `flex-wrap: wrap` and `flex: 1 1 minmax`. At 640px the card switches to `flex-direction: column`. Error banner has `max-width: 100%`. No fixed-width elements that could overflow. |
| 7 | Rows or cards are keyboard accessible | **PASS** | All buttons have `focus-visible` outline (2px blue). Both Open and Download buttons have `aria-label="Open/Download PDF for [Period]"`. Semantic `<ul role="list">` with `<li>` items. Tests verify aria-labels. |

### Regressions

None detected. The only TypeScript errors found (`process` in `httpClient.ts`, lines 3) are pre-existing and not introduced by this ticket.

### Test Suite Results

```
Tests  16 passed (16)   — CraHistory.test.tsx
```

The jsdom "Not implemented: navigation" warning during the PDF download test is expected: jsdom does not support `<a>.click()` navigation. The test still passes because it only asserts that `downloadCraPdf` was called with the correct ID, not that the browser navigation occurred.

### Minor Observations (non-blocking)

- The PDF download uses `a.click()` without appending the anchor to `document.body`. Most modern browsers handle this, but some environments require the element to be in the DOM before clicking. Low risk given the test mocking strategy.
- The validation date is displayed as a raw ISO string (`2026-07-01`) with no locale formatting. Not a criterion, but worth noting for future UX polish.

### Verdict

**PASS** — All 7 acceptance criteria are satisfied. The implementation is complete and the test suite is green.
