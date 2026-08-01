Now I have everything I need. Let me write the plan.

## Objective

Remove the `translateY` hover transform on `MonthMiniCard` that causes cards to visually overlap adjacent rows, and tighten the annual calendar's responsive grid so it reflows cleanly across desktop, tablet, and mobile viewports without horizontal scrolling.

## Included

### `frontend/src/components/MonthMiniCard/MonthMiniCard.css`

- Add `position: relative` to `.month-mini-card` (base rule, line 1 block).
- In `.month-mini-card:hover` (line 16): remove `transform: translateY(-2px)`; add `z-index: 1` so the elevated shadow renders above neighbours without moving the card.
- In `.month-mini-card:focus-visible` (line 21): add `z-index: 1` so keyboard focus matches hover stacking behaviour.

### `frontend/src/components/AnnualCalendar/AnnualCalendar.css`

- Add `min-width: 0` on `.annual-calendar-grid > *` (new rule after the grid block, ~line 86) so grid cells cannot overflow their column.
- Add a fourth breakpoint for narrow mobile after the existing `@media (max-width: 767px)` block:
  ```css
  @media (max-width: 399px) {
    .annual-calendar-grid {
      grid-template-columns: 1fr;
    }
  }
  ```

### `frontend/playwright.config.ts`

- Add a `tablet` project with `viewport: { width: 768, height: 1024 }` alongside the existing `desktop` and `mobile` projects.

### `frontend/e2e/visual.spec.ts`

Add three new tests scoped to the appropriate Playwright projects:

1. **`Annual calendar – desktop`** (`desktop` project only): mock `**/api/cras` with `mockCraList`, navigate to `/`, wait for `.annual-calendar-grid`, disable animations, screenshot.
2. **`Annual calendar – tablet`** (`tablet` project only): same mock + navigation, screenshot.
3. **`Annual calendar – mobile`** (`mobile` project only): same mock + navigation, screenshot.

Each test uses the existing `DISABLE_ANIMATIONS` style tag pattern already present in the file.

## Excluded

- Any change to `CalendarGrid`, `CraMonthSelector`, or other components.
- Data-fetching logic inside `AnnualCalendar.tsx`.
- Redesigning card content, colours, or typography.
- Unit tests for `AnnualCalendar.tsx` (no existing test file; out of scope for this bug fix).
- Touch gesture or pinch-zoom behaviour (browser-native, no code changes needed).

## Acceptance criteria

- Hovering any month card does not cause any other card to shift or be obscured; verified manually and by the three new visual regression screenshots.
- `transform` is absent from `.month-mini-card:hover`; `z-index: 1` is present on both `:hover` and `:focus-visible`.
- `.annual-calendar-grid > *` has `min-width: 0`.
- At viewport width ≤ 399 px the grid renders a single column; no horizontal scrollbar appears.
- Playwright visual regression tests pass on `desktop`, `tablet`, and `mobile` projects without diff failures (new baselines committed).
- `npx playwright test e2e/visual.spec.ts` exits 0 in CI for all three viewport projects.
