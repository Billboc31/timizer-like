## Objective

Extend `CalendarGrid` with day-click cycling, total-summary display, and VALIDATED locked state, then add Vitest tests for those three behaviours; the remaining acceptance criteria (month selection, day rendering, PDF download) are already covered by tests landed in T019/T020.

## Included

**`frontend/src/components/CalendarGrid/CalendarGrid.tsx`**

- Add optional prop `onDayClick?: (day: number, nextValue: 0 | 0.5 | 1) => void`.
- Each `.day-cell` element gets an `onClick` handler that computes `nextValue` by cycling `0 → 0.5 → 1 → 0` from the current worked value, then calls `onDayClick(day, nextValue)`.
- The component renders a `<div className="calendar-summary">` (or similar) that displays `cra.totalWorkedDays`.
- When `cra.status === 'VALIDATED'`, day cells must not fire `onDayClick` (disable clicks or omit the handler); add a visual indicator class `day-cell--locked` to every cell.

**`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`**

Add a new `describe('CalendarGrid interactions', ...)` block containing:

1. **Click cycle**: render a DRAFT CRA with `days: [{ day: 1, worked: 0 }]`, click the first cell, assert `onDayClick` is called with `(1, 0.5)`; click again from `worked: 0.5`, assert called with `(1, 1)`; click again from `worked: 1`, assert called with `(1, 0)`.
2. **Total summary**: render a CRA with `totalWorkedDays: 15`, assert the value `15` is visible in a `.calendar-summary` element.
3. **Locked state**: render a VALIDATED CRA, click a day cell, assert `onDayClick` is never called; assert each cell has class `day-cell--locked`.

Mock pattern: pass `onDayClick` as `vi.fn()`; use `fireEvent.click` on `day-cell` elements; pass a fresh `days` array per sub-case to set up initial worked values.

> **Assumption**: CalendarGrid is not expected to manage its own local `days` state. The `onDayClick` callback is the integration boundary; the parent (App or a future CraView) is responsible for calling `updateDay` and re-rendering with the updated CRA prop. This keeps the component stateless with respect to day values.

## Excluded

- Wiring `onDayClick` to `updateDay` API calls in `App.tsx` or any parent component (future ticket).
- Optimistic UI updates (local state for days inside CalendarGrid).
- Backend integration tests.
- End-to-end browser tests.
- Client signature tests.
- Visual regression tests.
- Authentication tests.
- CRA loading tests (already covered by CraMonthSelector tests from T019).
- PDF download flow tests (already covered by CalendarGrid download tests from T020).

## Acceptance criteria

- `CalendarGrid` renders an element with class `calendar-summary` showing `cra.totalWorkedDays`.
- Clicking a day cell on a DRAFT CRA calls `onDayClick` with the correct next cycled value (`0→0.5`, `0.5→1`, `1→0`).
- Clicking a day cell on a VALIDATED CRA does not call `onDayClick`; every cell carries class `day-cell--locked`.
- All three new test cases pass under `npm run test` in `frontend/`.
- All pre-existing 35 tests continue to pass (no regressions).
