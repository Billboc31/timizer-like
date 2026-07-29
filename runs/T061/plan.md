## Objective

Add a period-selection modal dialog triggered by the "New CRA" navigation button, accessible from any authenticated page without navigating away. On confirmation, a CRA is created for the selected start month and the calendar editor opens positioned on that month.

## Included

### `frontend/src/components/NewCraDialog/NewCraDialog.tsx` (new)

- Native `<dialog>` element, consistent with `CraPeriodNavigator`, `CraValidation`, and `CraClientSign` patterns.
- Props: `open: boolean`, `onConfirm: (startDate: string, endDate: string) => void`, `onCancel: () => void`, `loading?: boolean`, `error?: string | null`.
- Two `<input type="date">` fields: start date and end date.
- Default values computed on mount: first day of current month (start) and last day of current month (end), formatted as ISO strings (`YYYY-MM-DD`).
- Inline client-side validation before `onConfirm` fires:
  - Both fields must be non-empty.
  - `endDate >= startDate` (string comparison is valid for ISO dates).
  - Validation errors displayed inside the dialog; invalid form cannot be submitted.
- Cancel button and ESC key call `onCancel`; focus returns to the trigger button on close (same focus-return pattern as `CraPeriodNavigator`).
- Tab focus trap implemented with `onKeyDown` on the `<dialog>` element, mirroring the existing `handleDialogKeyDown` logic in `CraPeriodNavigator.tsx`.
- Form is disabled (inputs + buttons) when `loading` is true.
- Server error passed via `error` prop is rendered as an `role="alert"` paragraph inside the dialog.
- Dialog opened via `dialogRef.current?.showModal()` controlled by the `open` prop change (via `useEffect`).

### `frontend/src/components/NewCraDialog/NewCraDialog.css` (new)

- Minimal styles aligned with existing dialog components.

### `frontend/src/components/AppShell/AppShell.tsx` (modified)

- Add `onNewCra: () => void` to `AppShellProps`.
- "New CRA" nav button: call `onNewCra()` instead of `onNavigate('selector')`.
- `aria-current` on "New CRA" button stays bound to `activeView === 'selector'` for visual consistency.
- No change to `AppView` type; `'selector'` remains valid as the calendar/editor view state.

### `frontend/src/App.tsx` (modified)

- Add state: `newCraDialogOpen: boolean` (default `false`), `newCraLoading: boolean`, `newCraError: string | null`.
- Add ref: `newCraTriggerRef` pointing to a hidden or the nav button element, so focus can return on dialog close — or pass a callback that focuses the button from AppShell.
- `onNewCra` handler: sets `newCraDialogOpen = true`, resets `newCraError`.
- `handleNewCraConfirm(startDate: string, endDate: string)`:
  1. Parse `year` and `month` from `startDate` (e.g., `new Date(startDate + 'T00:00:00')`).
  2. Set `newCraLoading = true`.
  3. Call `listCras()` to get the current list.
  4. If an existing CRA matches that `month`/`year`: close the dialog (`newCraDialogOpen = false`), call `handleOpen(existingCra)`, set `view = 'selector'`.
  5. If no match: call `createCra(year, month)`. On success: close dialog, call `handleOpen(newSummary)`, set `view = 'selector'`. On error: set `newCraError` (dialog stays open).
  6. Set `newCraLoading = false`.
- `handleNewCraCancel`: sets `newCraDialogOpen = false`, resets `newCraError`.
- Render `<NewCraDialog>` at the root level (inside `<AppShell>` wrapper or as a sibling).
- Pass `onNewCra` to `<AppShell onNewCra={...}>`.
- Store the confirmed period in state: `selectedPeriod: { startDate: string; endDate: string } | null`. Set it on confirm, clear it when `cra` becomes `null`. (This makes the period available in state for future use without requiring the user to re-enter it.)

### `CraMonthSelector` — no change

The component remains as the content of the `'selector'` view. It is no longer the primary CRA creation entry point from the nav, but it is not removed (it still renders when `view === 'selector'` and can be used as a secondary navigation aid within the editor view).

## Excluded

- Backend changes: the `POST /api/cra` endpoint continues to accept `{ year, month }` only. Multi-month CRA data models, new API parameters, or schema migrations are out of scope.
- Multi-month calendar display: `CalendarGrid` renders a single month based on `cra.month` / `cra.year`. Spanning multiple months in the grid is not implemented.
- Reusable period presets, recurring CRA generation, and CRA business validation rule changes (as stated in the ticket).
- Removing or refactoring `CraMonthSelector` beyond making it no longer the nav entry point.
- Left-sidebar navigation redesign (referenced as a future dependency; the new `onNewCra` prop on `AppShell` is compatible with any future layout).

## Acceptance criteria

- "New CRA" button is present and clickable from every authenticated page (selector, history, settings, history-detail).
- Clicking "New CRA" opens the period selection dialog without changing the current view.
- Dialog defaults to the first and last day of the current month.
- Submitting with an empty start or end date shows an inline validation error and does not call `onConfirm`.
- Submitting with `endDate < startDate` shows an inline validation error and does not call `onConfirm`.
- Confirming a valid range with a non-existing start month creates a new CRA via `POST /api/cra` and opens the calendar on that month.
- Confirming a valid range whose start month already has a CRA opens the existing CRA without calling `createCra`.
- The calendar editor (`CalendarGrid`) displays the CRA for the start month after confirmation.
- Cancelling the dialog (Cancel button or ESC) leaves the current view and all data unchanged.
- No CRA is created or modified if the dialog is cancelled or closed.
- A server error during CRA creation is displayed inside the dialog; the dialog stays open.
- The flow works when start and end dates fall in different months (the CRA is created for the start month; the end-date value is preserved in `selectedPeriod` state).
- Focus returns to the element that triggered the dialog after it closes.
- Tab key cycles focus within the open dialog without escaping to the background page.
