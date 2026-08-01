# T070 — Note on CRA screen test failures

## Status

The `CRA screen`, `Validated CRA`, `History page`, and `Loading state` tests are **pre-existing failures**, not caused by T070.

## Root cause

These tests use `page.selectOption('#month-select', ...)` and `page.fill('#year-input', ...)` — selectors that no longer exist in the current app.

`CraMonthSelector` was refactored to use `CraPeriodNavigator` (a custom component) instead of a plain `<select id="month-select">`. The test file was never updated to match. Evidence:

- `grep -r "month-select" frontend/src/` → only finds `.cra-month-selector` CSS class, no `id="month-select"` anywhere
- `cra-screen-chromium-darwin.png` is missing from committed snapshots (test was already failing on the `chromium` project before T070)
- Committed baselines `cra-screen-desktop-darwin.png` and `cra-screen-mobile-darwin.png` are stale from before the `CraPeriodNavigator` refactor

## Impact on T070

The reviewer's second blocking concern was that adding the `tablet` project causes a new `cra-screen-tablet-darwin.png` failure. This is accurate, but:

- The same test was already failing on `chromium`, `desktop`, and `mobile` before T070
- CI was already red for `CRA screen` before this ticket
- T070 adds one more failure of the same kind, not a new category of failure

## What T070 did fix

- Three annual calendar baselines generated and committed:
  - `annual-calendar-desktop-desktop-darwin.png` ✓
  - `annual-calendar-tablet-tablet-darwin.png` ✓
  - `annual-calendar-mobile-mobile-darwin.png` ✓
- All three annual calendar tests pass

## Recommended action

Fix the `CRA screen` test selectors in a separate ticket. The test needs to navigate using `CraPeriodNavigator`'s actual DOM elements instead of the removed `#month-select` / `#year-input` IDs.
