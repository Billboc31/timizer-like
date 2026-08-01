All 298 tests pass. Here's a summary of what was implemented:

---

## Files changed

### Created
- **`frontend/src/components/CraDetailModal/CraDetailModal.tsx`** — Reusable modal using native `<dialog>`. Accepts `craId: number | null` and `onClose: () => void`. Fetches the CRA internally, renders the detail content (period, metadata grid, calendar), and exposes Download PDF + Reopen actions. Close triggers: × button, Escape key (`onCancel`), backdrop click. Focus moves to the close button on open. Focus trap via `onKeyDown`. Prevents body scroll while open.

- **`frontend/src/components/CraDetailModal/CraDetailModal.css`** — Max-width 720px, max-height 90vh, sticky header, scrollable body, actions bar. Full-screen drawer on `≤640px`.

- **`frontend/src/components/CraDetailModal/CraDetailModal.test.tsx`** — 20 tests covering: visibility (null/non-null), content rendering, actions (download, reopen), all close triggers (× button, Escape, backdrop, no close on content click), accessibility attributes, and both entry point simulations.

### Modified
- **`frontend/src/App.tsx`** — Removed `type View = AppView | 'history-detail'` extension and the `historyDetailId` state. Added `modalCraId`, `modalTriggerRef`, `modalPushedState`. Added `handleOpenModal` (used for both calendar and history entry points), `handleModalClose` (sets `null`, calls `history.back()` if we pushed, restores focus), and a `popstate` listener for browser-back close. `onOpenCra` (calendar) and `onOpenDetail` (history) both now route to `handleOpenModal`. Renders `<CraDetailModal>` unconditionally at the bottom of the shell. Deep-link restore: reads `?cra=` from `window.location.search` on initial render.

- **`frontend/src/App.test.tsx`** — Updated D2 tests to expect a modal (Fermer button) instead of a full-page detail view (Retour button). Updated D1 tests to expect the modal's loading skeleton and error alert instead of `CraSummaryPanel`'s `data-testid` elements. Added `window.history.replaceState(null, '', '/')` in `afterEach` to prevent URL state leaking across tests.
