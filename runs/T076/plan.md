Found the root cause. The `CraDetailModal.css` sets `display: flex` unconditionally on `.cra-detail-modal`, which overrides the native `<dialog>` element's default `display: none` — making the dialog visible on every page even when `craId` is null.

## Objective

Fix the `CraDetailModal` CSS so the native `<dialog>` element is properly hidden when no CRA is selected, by moving `display: flex; flex-direction: column;` from the unconditional `.cra-detail-modal` selector to `.cra-detail-modal[open]`, which restores the browser's default `display: none` for closed dialogs.

## Included

- `frontend/src/components/CraDetailModal/CraDetailModal.css`:
  - Remove `display: flex` and `flex-direction: column` from `.cra-detail-modal`
  - Add `.cra-detail-modal[open] { display: flex; flex-direction: column; }` so the dialog is only laid out when it is actually open

## Excluded

- Refactoring `CraDetailModal` to conditional rendering (`{modalCraId !== null && <CraDetailModal … />}`) — the CSS fix alone is sufficient; conditional rendering is a separate trade-off
- Any changes to the `selector` view inline components (`CraSummaryPanel`, `CalendarGrid`, `CraValidation`) — those are correctly scoped to `view === 'selector'` and are not global
- Changes to how the modal is opened from History or the annual calendar
- State management changes in `App.tsx`

## Acceptance criteria

- No "Détail CRA" panel is visible on Home (overview), History, Settings, or CRA creation views when `modalCraId` is `null`
- The modal renders correctly and is fully functional when opened with a valid CRA id
- The × close button, Escape key, and backdrop click all correctly close the dialog and reset `modalCraId` to `null`
- After closing, no dialog chrome (header, body, backdrop) remains visible anywhere in the layout
- Navigation between pages after closing the modal does not cause the panel to reappear
- Existing CRA detail access from the calendar and history remains functional without regression
