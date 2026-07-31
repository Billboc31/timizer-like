## Objective

Replace the home-page `CraOverview` list with an `AnnualCalendar` dashboard that renders all twelve months of the selected year as compact mini-calendar cards, with worked days highlighted per day, year navigation, and click-to-open navigation into the detailed CRA editor.

## Included

### New files

**`frontend/src/components/AnnualCalendar/AnnualCalendar.tsx`**  
Main dashboard container:
- On mount: calls `listCras()` to get all summaries; for each CRA whose year matches `displayedYear`, calls `getCra(id)` in parallel to retrieve day-level data.
- When `displayedYear` changes: repeats the per-year detail fetch for CRAs in the new year (re-uses already-loaded summaries).
- Manages `displayedYear` state initialised from `localStorage` key `annual-calendar-year`, defaulting to `new Date().getFullYear()`. Writes back to `localStorage` on every change.
- Renders a year navigation bar: `◀ {year} ▶` buttons and an "Aujourd'hui" button (disabled/hidden when already on the current year).
- Renders a 12-card CSS grid (`AnnualCalendar.css`), one `MonthMiniCard` per month (January–December), passing the matching `CraDetailsDto | undefined`.
- On card click: if a CRA exists, calls `onOpenCra(craSummary)`; if no CRA, calls `onNewCra(month, year)` to trigger the creation dialog pre-filled with that month/year without creating anything silently.
- Shows 12 skeleton placeholder cards while loading and an error banner with a retry button on failure.

**`frontend/src/components/AnnualCalendar/AnnualCalendar.css`**
- `.annual-calendar-header`: flex row, centred year navigation.
- `.annual-calendar-grid`: CSS grid — `repeat(4, 1fr)` on desktop (≥1024 px), `repeat(3, 1fr)` on tablet (768–1023 px), `repeat(2, 1fr)` on mobile (<768 px).
- Skeleton cards: pulsing placeholder blocks matching card dimensions.

**`frontend/src/components/MonthMiniCard/MonthMiniCard.tsx`**  
Read-only compact single-month calendar card:
- Props: `month: number`, `year: number`, `cra: CraDetailsDto | undefined`, `today: Date`, `onClick: () => void`.
- Renders month name as card header (e.g. "Janvier 2026").
- Builds a 7-column mini-grid (Mon → Sun), Monday-first European layout:
  - Lead-in blank cells for days before the 1st weekday of the month.
  - For each calendar day, applies exactly one CSS class: `worked` (`worked === 1`), `half` (`worked === 0.5`), `weekend` (Saturday or Sunday with `worked === 0`), `today` (current date when month and year match), or `empty` (weekday with no work recorded or month has no CRA).
- Displays total worked days below the grid: "12 j travaillés" (0 when no CRA).
- The entire card is a `<button>` for keyboard accessibility and correct click semantics.

**`frontend/src/components/MonthMiniCard/MonthMiniCard.css`**
- Card: white background, `var(--shadow-sm)`, `var(--radius-lg)`, hover lift transition.
- Day cells: ~20 × 20 px, tight `gap: 2px`.
- Color mapping:
  - `worked` → background `var(--color-primary)`, text white.
  - `half` → background `var(--color-primary-light)`.
  - `weekend` → background `var(--color-neutral-200)`.
  - `today` → border `2px solid var(--color-primary)` ring (no fill conflict).
  - `empty` / unworked weekday → background `var(--color-neutral-50)`.

### Modified files

**`frontend/src/App.tsx`**
- Import `AnnualCalendar` and remove `CraOverview` import.
- Replace `<CraOverview … />` in the `overview` view branch with `<AnnualCalendar … />`.
- Update `onNewCra` (or add `onNewCraForMonth(month, year)`) so that when called with a month/year, the CRA creation dialog/selector opens pre-filled on that period rather than defaulting to today.
- No changes to other view branches.

**`frontend/src/types/cra.ts`** _(if needed)_
- No new types expected; `CraDetailsDto` already carries `days: CraDayEntryDto[]`.

## Excluded

- Changes to the detailed CRA editor (`CalendarGrid`, `CraMonthSelector`, `CraSummaryPanel`).
- Changes to `CraHistory`, `CraValidation`, PDF download, or signature flows.
- New backend API endpoints (existing `listCras` + `getCra` are sufficient).
- Drag-and-drop or inline day editing from the annual view.
- Animations beyond hover transitions.
- Dark-mode or theme changes.
- Any refactor of `CraPeriodNavigator` (it stays unchanged, used only in the detail view).

## Acceptance criteria

1. The `overview` route renders `AnnualCalendar`; `CraOverview` is no longer shown.
2. All 12 months of the displayed year are visible, with no month missing, even when the month has no CRA data.
3. Worked days (`worked === 1`) appear highlighted in blue in the correct month on the correct date.
4. Half-days (`worked === 0.5`) appear in a visually distinct lighter blue.
5. Weekend cells are visually distinct from weekday cells.
6. Today's date cell has a visible ring/outline when the current year is displayed.
7. Each month card shows its worked-day count ("0 j travaillés" when no CRA exists).
8. `◀` / `▶` buttons change the displayed year and re-render all 12 cards; the "Aujourd'hui" button returns to the current year and is disabled when already there.
9. Clicking a month card with an existing CRA opens the detailed CRA editor on that month (same behaviour as the old `CraOverview` cards).
10. Clicking a month card with no existing CRA opens the new-CRA creation dialog pre-filled with that month/year; no CRA is created silently.
11. Refreshing the page restores the previously displayed year.
12. The grid shows ≥ 4 columns on desktop, ≥ 3 on tablet, ≥ 2 on mobile; all 12 months remain reachable on every breakpoint.
13. A loading skeleton is shown while data is fetching; a retry-able error message is shown on API failure.
