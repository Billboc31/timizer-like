## Summary

### Files modified

**`frontend/src/components/CalendarGrid/CalendarGrid.tsx`**
- Added `nextWorked` helper: cycles `0 → 0.5 → 1 → 0`
- Added `onDayClick?: (day: number, nextValue: 0 | 0.5 | 1) => void` to `Props`
- Added `<div className="calendar-summary">{cra.totalWorkedDays}</div>`
- Each day cell now sets `onClick` to call `onDayClick` with the cycled next value — suppressed entirely when `isValidated`
- Validated cells get `day-cell--locked` class appended

**`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`**
- Added `describe('CalendarGrid interactions', ...)` with 3 tests:
  1. **Click cycle** — verifies `0→0.5`, `0.5→1`, `1→0` with fresh renders per step
  2. **Total summary** — asserts `.calendar-summary` shows `totalWorkedDays: 15`
  3. **Locked state** — asserts `onDayClick` never fires and all cells carry `day-cell--locked` on a VALIDATED CRA

### Verification

38/38 tests pass (35 pre-existing + 3 new), no regressions.
