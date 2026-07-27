## Objective

Redesign the `CalendarGrid` component to provide clear visual states for all day types (worked, half-day, not-worked, weekend, out-of-month), add a compact legend, and wire interactive click-cycling (0 → 1 → 0.5 → 0) with full keyboard and touch support.

## Included

### `frontend/src/components/CalendarGrid/CalendarGrid.tsx`
- Add `onDayClick: (day: number, newValue: 0 | 0.5 | 1) => void` prop (optional; cells are read-only when absent).
- Add prominent month/year header above the grid (e.g. `"July 2026"`).
- Add weekday column headers row (Mon–Sun or Sun–Sat aligned with the first day of the month).
- Implement click-cycle handler: worked value cycles 0 → 1 → 0.5 → 0.
- Add `role="button"`, `tabIndex={0}` (or `tabIndex={-1}` for weekend/disabled), `aria-label` (`"<weekday> <day> — <state>"`) on each interactive cell.
- Handle `onKeyDown` for Enter and Space to trigger the same cycle as a click.
- Apply BEM modifier class reflecting current state: `day-cell--worked`, `day-cell--half`, `day-cell--rest`, `day-cell--weekend`, `day-cell--disabled`.
- Render a compact `<CalendarLegend />` sub-component (inline in same file) below the grid with one swatch per state.
- Preserve loading and error states unchanged.

### `frontend/src/components/CalendarGrid/CalendarGrid.css`
- **State modifiers** — distinct background/border/text combos:
  - `.day-cell--worked`: strong filled style (e.g. solid brand colour, white text).
  - `.day-cell--half`: medium filled style (e.g. lighter tint or pattern, dark text).
  - `.day-cell--rest`: neutral/white style (default).
  - `.day-cell--weekend`: muted background, slightly different text colour; NOT greyed-out unless actually disabled.
  - `.day-cell--disabled`: reduced opacity, `cursor: not-allowed`, no hover effect.
- **Interaction states** on non-disabled interactive cells:
  - `:hover` — subtle lift or border highlight.
  - `:focus-visible` — visible outline (keyboard navigation).
  - `:active` — pressed scale or colour shift.
- **Grid layout** — CSS grid, 7 columns, `min-width: 0` on cells, no horizontal overflow on viewport ≥ 320px.
- **Legend** — `.calendar-legend` flex row with colour swatches and labels.
- Remove or replace existing generic `.day-cell--weekend` rule so it no longer doubles as a worked-state indicator.

### `frontend/src/App.tsx`
- Pass `onDayClick` to `<CalendarGrid>` calling `updateDay(cra.id, date, { workValue: newValue })` then refreshing the selected CRA.
- Keep the existing `VALIDATED` status check: cells in a validated CRA must remain disabled (pass `disabled` prop or omit `onDayClick`).

### `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`
- Update existing tests to use the new modifier class names (`day-cell--rest`, `day-cell--worked`, etc.).
- Add: clicking a cell cycles the worked value 0 → 1 → 0.5 → 0 and calls `onDayClick` with the correct arguments.
- Add: pressing Enter or Space on a focused cell triggers `onDayClick`.
- Add: weekend cells do NOT call `onDayClick` when `onDayClick` is absent.
- Add: legend is rendered with all four state labels.
- Add: month/year header is visible with the correct text.
- Add: disabled cells do not call `onDayClick`.

## Excluded

- Changes to CRA business rules (total day calculation, validation workflow).
- Hourly time entry or any granularity beyond 0 / 0.5 / 1.
- Backend changes (the `updateDay` PATCH endpoint is already correct).
- Month navigation controls (handled by `CraMonthSelector`).
- Responsive behaviour below 320 px viewport width.
- `CraMonthSelector`, `CraSummaryPanel`, `CraHistory`, or `CraValidation` components.

## Acceptance criteria

- `CalendarGrid` with a `CraDetails` of July 2026 renders a header reading "July 2026".
- Clicking an unworked weekday cell calls `onDayClick(day, 1)`; clicking again calls `onDayClick(day, 0.5)`; clicking a third time calls `onDayClick(day, 0)`.
- Pressing Enter or Space on a focused cell produces the same call as a click.
- Each state (worked, half-day, not-worked, weekend) has a visually distinct CSS class and the legend lists all four.
- Weekend cells that have no `onDayClick` prop applied do not respond to click/keyboard events.
- Cells of a validated CRA (no `onDayClick` prop) carry `day-cell--disabled` and have `tabIndex={-1}`.
- All existing CalendarGrid tests continue to pass after class-name updates.
- New tests pass: cycle, keyboard, legend, header, disabled.
- On a 375 px viewport the calendar fits without horizontal scrollbar (manual or screenshot check).
