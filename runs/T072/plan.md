## Objective

Replace the current per-entry-point CRA detail navigation (view change for history, inline render for calendar) with a single reusable modal overlay that opens from both the annual calendar and the history list, while keeping the underlying view mounted and intact.

## Included

### New component — `CraDetailModal`

- `frontend/src/components/CraDetailModal/CraDetailModal.tsx`
  - Native `<dialog>` element (consistent with `NewCraDialog` pattern).
  - Props: `craId: number | null`, `onClose: () => void`.
  - Fetches CRA detail data internally via the existing `craClient` API on `craId` change; avoids duplicate fetches by keying on `craId`.
  - Renders the existing `CraHistoryDetail` content (or its constituent parts) without the back-button / prev-next navigation controls.
  - Close triggers: visible `×` button (accessible label `"Fermer"`), `Escape` key, backdrop click (only when no unsaved changes).
  - Unsaved-changes guard: if the CRA is editable and has pending changes, intercept close and show a confirmation prompt before discarding.
  - Focus trap on open; focus returns to the triggering element on close.
  - `aria-modal="true"`, `role="dialog"`, labelled with the CRA title via `aria-labelledby`.
  - Prevents background scroll while open (`document.body.style.overflow = 'hidden'` on mount, restored on unmount).
  - Header and close button remain sticky when CRA content overflows vertically.

- `frontend/src/components/CraDetailModal/CraDetailModal.css`
  - Max-width / max-height with internal scrolling.
  - `@media (max-width: 640px)`: full-screen drawer / sheet layout.
  - Backdrop semi-transparent overlay.

### Modifications to `App.tsx`

- Add `modalCraId: number | null` state (default `null`).
- Add `modalTriggerRef: React.RefObject<HTMLElement>` to store the element that opened the modal, for focus restoration.
- Change `onOpenCra` handler (calendar entry point): set `modalCraId` instead of transitioning view to `'selector'`/detail.
- Change `onOpenDetail` handler (history entry point): set `modalCraId` instead of transitioning view to `'history-detail'`.
- Remove the `'history-detail'` branch from the view state machine.
- On modal open: call `window.history.pushState({ modalCraId }, '', `?cra=${craId}`)`.
- Listen to `popstate` event: when `event.state?.modalCraId` is absent, set `modalCraId = null` (browser back closes modal).
- On page load: read `?cra=<id>` from `window.location.search`; if present, set initial `modalCraId` so a refreshed deep link restores the overlay.
- Render `<CraDetailModal craId={modalCraId} onClose={handleModalClose} />` unconditionally (component handles null internally).
- `handleModalClose`: set `modalCraId = null`, call `window.history.back()` only if the current history entry was pushed by the modal, then restore focus to `modalTriggerRef.current`.

### Modifications to `AppShell.tsx`

- Remove `'history-detail'` from the `AppView` union type.

### Modifications to `CraHistory.tsx`

- No logic change needed; `onOpenDetail` prop already exists. Verify that each list row exposes a `ref`-forwardable element or `data-cra-id` attribute so focus can be restored to the correct row.

### Modifications to `AnnualCalendar.tsx`

- No logic change needed; `onOpenCra` callback already exists. Verify that each `MonthMiniCard` exposes enough identity for focus restoration.

### Deprecation

- `CraHistoryDetail` component: retain the file but stop rendering it as a top-level view. The modal reuses its read-only CRA display internals. If it is self-contained enough, import it inside `CraDetailModal`; otherwise inline the relevant JSX.

### Tests

- `frontend/src/components/CraDetailModal/CraDetailModal.test.tsx`:
  - Opens from calendar entry point (mock `onOpenCra` call → modal visible).
  - Opens from history entry point (mock `onOpenDetail` call → modal visible).
  - Closes via `×` button.
  - Closes via `Escape` key.
  - Browser back closes modal without navigating away from the parent view.
  - Focus returns to the triggering element on close.
  - Unsaved changes: closing is blocked and a confirmation prompt appears.
  - No previous/next CRA navigation present in the rendered modal.

## Excluded

- Editing CRA data inside the modal (the overlay is read-only / action-only as in the current `CraHistoryDetail`).
- Any change to the `CraMonthSelector` flow (new CRA creation path, `onNewCra`).
- Changing the PDF download logic or signature page routing.
- Adding pagination or filtering inside the modal.
- Migrating to React Router or any external routing library.
- Any visual redesign beyond what is needed for the modal container.

## Acceptance criteria

- Clicking a month in the annual calendar opens the corresponding CRA in a modal overlay; the annual calendar remains visible and unchanged behind the overlay.
- Clicking a CRA row in History opens the same overlay without appending content below the list or changing the active view.
- No previous/next CRA navigation controls appear inside the overlay.
- The overlay closes via the `×` button, `Escape` key, backdrop click (when no unsaved changes), and browser back.
- After closing, the annual calendar year, history pagination/filters, and scroll position are unchanged.
- Keyboard focus moves into the dialog on open and returns to the triggering month card or history row on close.
- When a CRA with unsaved changes is about to be closed, a confirmation prompt appears and closing can be cancelled.
- A `?cra=<id>` deep link opens the overlay over the appropriate parent view on page load.
- On small screens the overlay adapts to a full-screen layout.
- All automated tests in `CraDetailModal.test.tsx` pass.
