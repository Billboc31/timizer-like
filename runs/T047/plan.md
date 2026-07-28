## Objective

Replace the raw `<select>` + `<input type="number">` period controls in `CraMonthSelector` with a polished `CraPeriodNavigator` component that shows the selected period as a prominent heading, exposes previous/next month buttons, and offers a direct-jump dialog using native selects — all while keeping keyboard, touch, and 320 px support.

## Included

### New component — `CraPeriodNavigator`

**`frontend/src/components/CraPeriodNavigator/CraPeriodNavigator.tsx`**

Props interface:
```ts
interface CraPeriodNavigatorProps {
  month: number;       // 1–12
  year: number;
  disabled?: boolean;  // true while CRA list is loading or creating
  onChange: (month: number, year: number) => void;
}
```

Structure:
- Container `<div class="cra-period-navigator">` (flex row, centered)
- `<button class="cra-period-navigator__prev">` — navigates to previous month; wraps `December year-1` when current month is January
- `<button class="cra-period-navigator__label">` — shows the period label (e.g., "July 2026") at prominent size; clicking opens the jump dialog via `dialogRef.current?.showModal()`
- `<button class="cra-period-navigator__next">` — navigates to next month; wraps `January year+1` when current month is December
- `<dialog class="cra-period-navigator__dialog">` — accessible direct-jump dialog (follows the `CraValidation` native dialog pattern with `showModal()` / `close()`, focus trap, Escape key)
  - Contains a `<select id="jump-month">` for month (1–12, labelled "Month")
  - Contains an `<input type="number" id="jump-year">` for year (min 2000, labelled "Year")
  - "Go" confirm button that calls `onChange(jumpMonth, jumpYear)` and closes dialog
  - "Cancel" button that closes dialog without calling `onChange`
  - Dialog state (`jumpMonth`, `jumpYear`) initialised from current props when dialog opens; not propagated until "Go" is confirmed

All three `<button>` elements must be `disabled` when `disabled` prop is true.

**`frontend/src/components/CraPeriodNavigator/CraPeriodNavigator.css`**

- `.cra-period-navigator`: `display: flex; align-items: center; gap: var(--space-2); width: 100%`
- `.cra-period-navigator__label`: `font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); flex: 1; text-align: center; background: none; border: none; cursor: pointer; border-radius: var(--radius-md); padding: var(--space-1) var(--space-2)`
- `.cra-period-navigator__prev`, `.cra-period-navigator__next`: compact icon buttons (≥ 44 × 44 px tap target), `border-radius: var(--radius-full)`
- `:focus-visible` ring on all interactive elements using `--focus-ring`
- `:disabled`: `opacity: 0.4; cursor: not-allowed`
- `.cra-period-navigator__dialog`: reuse `.dialog` and `.dialog-overlay` base classes for backdrop and box-shadow
- `@media (max-width: 320px)`: ensure label truncates or wraps, no overflow

### Modified component — `CraMonthSelector`

**`frontend/src/components/CraMonthSelector/CraMonthSelector.tsx`**

- Import and render `<CraPeriodNavigator>` in place of the `<h2>`, the month `<select>`, and the year `<input>` block (lines 94–117 of the current file)
- Pass `month={selectedMonth}`, `year={selectedYear}`, `disabled={loading || creating}`, `onChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }}`
- Keep the action button ("Create CRA" / "Open CRA") and all loading/error/creating states unchanged
- Remove the now-redundant `<h2>{periodLabel}</h2>` (the navigator's label button serves this role)

**`frontend/src/components/CraMonthSelector/CraMonthSelector.css`**

- Remove `.cra-month-selector__controls` and `.cra-month-selector__field` blocks (replaced by navigator styles)
- Keep `.cra-month-selector` wrapper padding

### Tests

**`frontend/src/components/CraPeriodNavigator/CraPeriodNavigator.test.tsx`** (new)

Cover:
- Renders month and year in the label button
- Clicking prev decrements month (e.g., March → February); calls `onChange`
- Clicking prev from January wraps to December of previous year; calls `onChange`
- Clicking next increments month; calls `onChange`
- Clicking next from December wraps to January of next year; calls `onChange`
- All buttons disabled when `disabled={true}`
- Clicking the label button opens the dialog (dialog becomes visible / `open` attribute)
- "Cancel" closes dialog without calling `onChange`
- "Go" closes dialog and calls `onChange` with the selected jump values

**`frontend/src/components/CraPeriodNavigator/CraPeriodNavigator.axe.test.tsx`** (new)

- Axe scan in default state (no violations)
- Axe scan with dialog open (no violations)
- Axe scan in disabled state (no violations)

**`frontend/src/components/CraMonthSelector/CraMonthSelector.test.tsx`** (updated)

- Replace `fireEvent.change(screen.getByLabelText('Month'), ...)` interactions with `fireEvent.click(screen.getByRole('button', { name: /prev/i }))` or dialog interactions
- Tests that previously expected `screen.getByLabelText('Month')` to be in the document now open the dialog first before querying it
- All other test assertions (loading, error, retry, create success/error, `onOpen`) remain structurally unchanged

## Excluded

- Changing the one-CRA-per-month business rule
- Loading several months simultaneously or pre-fetching adjacent months
- Backend changes
- Replacing the "Create CRA" / "Open CRA" action button design (not part of this ticket)
- Adding a full date-picker calendar widget (the dialog with native `<select>` + `<input type="number">` is the direct-jump mechanism)
- Animations or transitions beyond CSS `:hover`/`:focus-visible` states
- Changes to `AppShell`, `CraSummaryPanel`, `CalendarGrid`, or `CraValidation`

## Acceptance criteria

- The period label button (e.g., "July 2026") is rendered at `--font-size-xl` bold weight and is the primary visible heading for the selector screen.
- Clicking the previous-month button from February 2026 emits `onChange(1, 2026)`; clicking it from January 2026 emits `onChange(12, 2025)`.
- Clicking the next-month button from November 2026 emits `onChange(12, 2026)`; clicking it from December 2026 emits `onChange(1, 2027)`.
- Opening the jump dialog, selecting a different month and year, and clicking "Go" emits `onChange` with the chosen values and closes the dialog; "Cancel" leaves period unchanged.
- All three navigator buttons have `disabled` attribute when `CraMonthSelector` is in loading or creating state.
- A `focus-visible` outline is visible when navigating the component by keyboard; the dialog traps focus while open and closes on Escape.
- The component renders without horizontal overflow at a 320 px viewport width.
- Changing the selected period never causes the action button state ("Create CRA" vs "Open CRA") to lag behind — it is always derived from `cras` list + current period without intermediate stale state.
- `CraPeriodNavigator.test.tsx` passes all month-change and year-boundary tests.
- `CraPeriodNavigator.axe.test.tsx` reports zero violations in all three states.
- `CraMonthSelector.test.tsx` passes without regression after interaction-pattern updates.
- `npm run typecheck` and `npm test` both pass with no new errors.
