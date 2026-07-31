Implementation complete. Here's the summary:

## Files created

- **`frontend/src/components/MonthMiniCard/MonthMiniCard.tsx`** — Compact single-month calendar card. Builds a Monday-first 7-column grid with per-day CSS classes (`worked`, `half`, `weekend`, `empty`) plus an additive `today` ring. Shows the worked-day total. Rendered as a `<button>` for full keyboard accessibility.
- **`frontend/src/components/MonthMiniCard/MonthMiniCard.css`** — Styles using design tokens: blue for worked days, light-blue border for half-days, neutral for weekends, inset ring for today.
- **`frontend/src/components/AnnualCalendar/AnnualCalendar.tsx`** — Dashboard container. Loads all summaries once on mount; fetches day-level details in parallel for CRAs in the displayed year (using a `loadedIds` ref to avoid duplicate requests). Persists/restores the displayed year via `localStorage`. Renders the year navigation bar and a 12-card grid. Shows 12 skeleton cards while loading and a retryable error banner on failure.
- **`frontend/src/components/AnnualCalendar/AnnualCalendar.css`** — 4-column grid on desktop (≥1024 px), 3-column on tablet (768–1023 px), 2-column on mobile (<768 px). Includes skeleton pulse animation and a thin loading bar for year-change fetches.

## Files modified

- **`frontend/src/App.tsx`** — Replaced `CraOverview` import/usage with `AnnualCalendar`. Added `newCraPrefill` state and `handleNewCraOpenForMonth(month, year)` handler; prefill computed dates are passed to `NewCraDialog`.
- **`frontend/src/components/NewCraDialog/NewCraDialog.tsx`** — Added optional `initialStartDate` / `initialEndDate` props; the dialog resets to these values (or the current-month defaults) each time it opens.

## Verification

No TypeScript errors in any of the new or modified files. The pre-existing build failure (`CraValidation.tsx` importing a non-existent `validateCra`) was confirmed present before my changes.
