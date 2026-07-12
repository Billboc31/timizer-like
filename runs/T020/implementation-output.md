All 8 tests pass. Here's what was changed in `CalendarGrid.test.tsx`:

1. **[BLOCKING fixed]** Worked value test now uses `day: 3, worked: 1` and asserts on `cells[2].querySelector('.day-cell__worked')` — the value `"1"` is now unambiguously from the worked field, not the day number.
2. **[OBSERVATION fixed]** `afterEach(cleanup)` moved after all imports.
3. **[OBSERVATION — already correct]** `tsconfig.app.json` already had the correct spelling `noFallthroughCasesInSwitch`; no change needed.
4. **[OBSERVATION fixed]** Added test `renders 28 cells for February 2026` to cover the "calendar updates when a different CRA month is loaded" acceptance criterion.
