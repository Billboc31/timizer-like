All 70 tests pass. Here's a summary of what was changed:

---

## Files modified

### `frontend/src/components/CalendarGrid/CalendarGrid.tsx`
- Added `onDayClick?: (day: number, newValue: 0 | 0.5 | 1) => void` prop
- Month/year header rendered as `<h2>` (e.g. "July 2026")
- Switched to CSS Grid layout with 7 Mon–Sun column headers
- First day positioned at correct column via `gridColumn` style (European weekday offset)
- Click cycle: 0 → 1 → 0.5 → 0 via `nextWorkValue()`
- Keyboard support: Enter and Space trigger the same cycle
- BEM state classes: `day-cell--worked`, `day-cell--half`, `day-cell--rest`, `day-cell--weekend`, `day-cell--disabled`
- `role="button"`, `tabIndex`, and `aria-label` on interactive cells
- `<CalendarLegend />` sub-component below the grid

### `frontend/src/components/CalendarGrid/CalendarGrid.css`
- CSS Grid (7 × `minmax(0, 1fr)`) — no horizontal overflow on narrow viewports
- Distinct visual styles per state: brand blue for worked, light blue for half-day, white for rest, muted grey for weekend
- Per-state hover rules (correct specificity), `focus-visible` outline, `:active` scale
- `day-cell--disabled`: 50% opacity, `cursor: not-allowed`
- Legend flex layout with colour swatches

### `frontend/src/App.tsx`
- Imports `updateDay` from `./api/craClient`
- `handleDayClick` builds a YYYY-MM-DD date string, calls `updateDay`, then refreshes `cra` state with `dtoToDetails()`
- Passes `onDayClick={handleDayClick}` when CRA is DRAFT; `undefined` when VALIDATED (disabling all cells)

### `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`
- Existing tests preserved and still passing
- New tests: month/year header, legend labels, full click cycle (0→1→0.5→0), Enter/Space keyboard activation, weekend click blocked, disabled state classes and `tabindex`
