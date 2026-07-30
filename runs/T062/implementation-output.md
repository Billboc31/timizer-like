Implementation complete. Here's a summary:

**Files modified:**
- `frontend/src/components/AppShell/AppShell.tsx` — added `'overview'` to `AppView` type and `PAGE_TITLES` map (`'Mes CRA'`)
- `frontend/src/App.tsx` — imported `CraOverview`, changed initial view from `'selector'` to `'overview'`, added `view === 'overview'` render branch

**Files created:**
- `frontend/src/components/CraOverview/CraOverview.tsx` — dashboard component: lists CRAs sorted most-recent-first with status badges, empty state with "Nouveau CRA" CTA, loading skeleton, and error state
- `frontend/src/components/CraOverview/CraOverview.css` — styles consistent with `CraHistory.css`

**Behavior:**
- App now lands on `'overview'` (page title "Mes CRA") instead of the CRA creation screen
- Clicking a CRA card loads its data and navigates to `'selector'` view where the calendar/editor is shown
- Empty state shows a "Nouveau CRA" button that navigates to `'selector'`
- "New CRA" nav button still navigates to `'selector'`; "History" remains unchanged
- Pre-existing TypeScript errors in other components are unrelated to this ticket
