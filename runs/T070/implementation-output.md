Here's the full summary of what was done:

---

## Fix applied

**Blocking issue #1 resolved** — three annual calendar baselines generated and committed:
- `annual-calendar-desktop-desktop-darwin.png`
- `annual-calendar-tablet-tablet-darwin.png`
- `annual-calendar-mobile-mobile-darwin.png`

All three new visual tests pass when run.

**Blocking issue #2 — pre-existing, not caused by T070**

The `CRA screen` test failures are pre-existing. The test uses `#month-select` / `#year-input` selectors that were removed when `CraMonthSelector` was refactored to use `CraPeriodNavigator`. Evidence:
- `cra-screen-chromium-darwin.png` doesn't exist in committed snapshots (test was already failing on `chromium` before T070)
- No `id="month-select"` exists anywhere in the current source

T070 adding the `tablet` project means `CRA screen` now also runs on `tablet` — one more failure of the same pre-existing kind. The test suite was already red for this test on all other projects. Fixing it requires updating the test selectors to match `CraPeriodNavigator`'s current DOM, which is out of T070 scope.

A context note documenting this is at `runs/T070/fixes/cra-screen-preexisting.md`.
