All 6 tests pass again. Here is the full test report:

---

## Test Report — T044: Visual Regression Coverage

### Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC1 | Main CRA screen has a **desktop** visual baseline | **PASS** | `cra-screen-desktop-darwin.png` exists; `[desktop] CRA screen` ✓ |
| AC2 | Main CRA screen has a **mobile** visual baseline | **PASS** | `cra-screen-mobile-darwin.png` exists; `[mobile] CRA screen` ✓ |
| AC3 | History page has a visual baseline | **PASS** | `history-desktop-darwin.png` exists; `[desktop] History page` ✓ |
| AC4 | At least one loading or error state has a visual baseline | **PASS** | Both `loading-state-desktop-darwin.png` and `error-state-desktop-darwin.png` exist; both tests ✓ |
| AC5 | Test data and selected month are deterministic | **PASS** | `cra-fixtures.ts` hardcodes March 2024; API routes mocked; animations suppressed with CSS injection |
| AC6 | Visual tests can be executed with one documented command | **PASS** | `npm run test:visual` in `package.json`; documented in `README.md` with `npx playwright install chromium` prerequisite |
| AC7 | A genuine layout change causes the test to fail | **PASS** | `CalendarGrid.css` gap `8px→40px` caused 3 failures (desktop+mobile CRA screen, desktop validated CRA); reverted cleanly |

### Regressions

None observed. The suite runs in isolation (Vite dev server auto-started by Playwright) with no impact on existing unit tests.

### Observations (non-blocking)

- The `Validated CRA` test also fails on layout changes (expected, not in scope), meaning coverage is slightly broader than the ACs require — this is a bonus.
- Mobile variants of `History`, `Loading`, and `Error` states are intentionally skipped by design (desktop-only). This is a scope decision already documented in the ticket's out-of-scope section.
- The `maxDiffPixelRatio: 0.001` threshold is strict; a sub-1% pixel difference triggers failure, which aligns well with the goal of detecting unintended changes.

### Verdict

**VALIDATED** — all 7 acceptance criteria satisfied.
