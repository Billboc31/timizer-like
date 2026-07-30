Now I have enough context to write the plan.

## Objective

Replace the `CraMonthSelector` as the application's default landing view with a new `CraOverview` component that lists all existing CRA periods by status and recency, and remove the assumption that opening the app immediately starts CRA creation.

## Included

**`frontend/src/App.tsx`**
- Add `'overview'` to the `AppView` union type (alongside `'selector'`, `'history'`, `'history-detail'`, `'settings'`).
- Change the initial `useState<View>` default from `'selector'` to `'overview'`.
- Add a branch in the render logic: when `activeView === 'overview'`, render `<CraOverview onOpen={handleOpen} onNewCra={() => setView('selector')} />`.

**`frontend/src/components/AppShell/AppShell.tsx`**
- Add `overview` entry to the `pageTitles` map (e.g. `overview: 'Mes CRA'`).
- Change the "New CRA" nav button so it navigates to `'selector'` view (keep existing behaviour).
- The "New CRA" button must not be the default active item when the overview is shown; active highlight should follow `activeView`.

**`frontend/src/components/CraOverview/CraOverview.tsx`** _(new file)_
- Props: `onOpen: (cra: CraSummaryDto) => void`, `onNewCra: () => void`.
- On mount, call `listCras()` from `craClient.ts` (API already exists).
- Sort results by `year` then `month` descending so the most recent period appears first.
- Render one card per CRA showing: period label (`Month YYYY`), status badge using the French label map already present in `CraHistory`, and `totalWorkedDays`.
- Clicking a card calls `onOpen(cra)`.
- Empty state (zero CRAs): short explanatory message + a primary button that calls `onNewCra()`.
- Loading and error states identical in pattern to existing components.

**`frontend/src/types/cra.ts`** — no change needed; `CraSummaryDto` already contains `id`, `month`, `year`, `status`, `totalWorkedDays`.

## Excluded

- The dedicated "New CRA" period-selection dialog or modal (separate dependency ticket).
- PDF download, history-detail drill-down, or signature actions from the overview cards.
- Filtering, search, or pagination of CRA list.
- Any changes to the CRA editor, `CraHistoryDetail`, signature, or PDF flows.
- Backend/API changes.
- Redesigning or restructuring `CraHistory` (remains unchanged for the "History" nav item).
- Left sidebar navigation redesign (mentioned as a future dependency; AppShell header stays as-is).

## Acceptance criteria

- Navigating to `/` (root) renders the `CraOverview` instead of `CraMonthSelector`.
- The page title shown in `AppShell` is not "New CRA" when the overview is active.
- Each existing CRA appears as a card in the overview, sorted most-recent first, with a visible status badge.
- Clicking a CRA card opens its calendar/editor view (same result as clicking "Open" in CraHistory).
- When `listCras()` returns an empty array, an empty state is shown with a button that triggers the `'selector'` view.
- The "History" nav item still navigates to `CraHistory` unchanged.
- The "New CRA" nav button navigates to `CraMonthSelector` (selector view) as before.
- Refreshing the browser lands on the overview, not on a blank CRA creation screen.
- Existing CRA editing routes/state (opening a CRA by ID via `onOpen`) continue to work.
