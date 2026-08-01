All changes are correct. Here's a summary:

---

## Changes made

### `frontend/src/components/MonthMiniCard/MonthMiniCard.css`
- Added `position: relative` to `.month-mini-card` (required for `z-index` to take effect)
- Removed `transform: translateY(-2px)` from `.month-mini-card:hover` — this was the direct cause of card overlap
- Removed `transform` from the `transition` property (no longer needed)
- Added `z-index: 1` to both `.month-mini-card:hover` and `.month-mini-card:focus-visible` so the elevated shadow renders above neighbours without physically moving any card

### `frontend/src/components/AnnualCalendar/AnnualCalendar.css`
- Added `.annual-calendar-grid > * { min-width: 0; }` to prevent grid cells from overflowing their column (CSS grid item default `min-width: auto` can cause overflow)
- Added `@media (max-width: 399px)` breakpoint with `grid-template-columns: 1fr` for narrow mobile single-column layout

### `frontend/playwright.config.ts`
- Added `tablet` project with `viewport: { width: 768, height: 1024 }`

### `frontend/e2e/visual.spec.ts`
- Added three new visual regression tests: `Annual calendar – desktop`, `Annual calendar – tablet`, `Annual calendar – mobile` — each scoped to its own project, mocking `/api/cras` with `mockCraList`, waiting for `.annual-calendar-grid`, and disabling animations before screenshot
