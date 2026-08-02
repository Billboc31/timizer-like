## Objective

Make `CraDetailModal` fully interactive by wiring every editing and workflow action available in the standalone CRA view — day editing, provider validation/signature, client signature link, and PDF download for all eligible statuses — and propagating successful mutations back to the annual calendar and history list without a page reload.

## Included

### `frontend/src/components/CraDetailModal/CraDetailModal.tsx`

**New prop:**
- `onMutated?: (updated: CraDetailsDto) => void` — called after every successful mutation so the parent can refresh list views.

**Fix `dtoToCraDetails()`:**
- Include `providerSignatureImage`, `providerSignerName`, `clientRepresentativeName` (currently missing; `CraValidation` and `CraSignatureActions` need them).

**Day editing (DRAFT):**
- Add `updatingDay: number | null` and `dayUpdateError: string | null` state.
- Add `handleDayClick(day, newValue)` that calls `updateDay(cra.id, isoDate, { workValue: newValue })`, updates `cra` state with the returned DTO, and calls `onMutated?.(dto)`.
- Pass `onDayClick={cra.status === 'DRAFT' ? handleDayClick : undefined}`, `updatingDay`, `dayUpdateError` to `<CalendarGrid>`.

**Replace inline metadata section:**
- Remove the bespoke `<dl>` metadata block and `coveredPeriod` / `nameOr` helpers.
- Render `<CraSummaryPanel cra={dtoToCraDetails(cra)} loading={false} error={null} onSuccess={() => undefined} />` in its place; this brings in `CraSignatureStatus` and `CraSignatureActions` automatically.

**Add validation action:**
- Import and render `<CraValidation cra={dtoToCraDetails(cra)} onValidated={handleValidated} onGoToSettings={() => undefined} />` inside the modal body.
- `handleValidated(dto)`: `setCra(dto)` + `onMutated?.(dto)`.
- `onGoToSettings` is a no-op in the modal context (settings are a separate app view); the "go to settings" link is suppressed or replaced with a plain text hint.

**Extend PDF download:**
- Show the download button for both `VALIDATED` and `AWAITING_CLIENT_SIGNATURE` (currently `VALIDATED` only).

**Reopen action:**
- After `reopenCra()` succeeds, call `onMutated?.(freshDto)` (currently missing).

**In-flight close guard:**
- Derive `const anyActionInFlight = downloading || reopening || updatingDay !== null`.
- In `handleBackdropClick`, `handleCancel` (Esc), and the close button handler: if `anyActionInFlight`, call `window.confirm('Une action est en cours. Fermer quand même ?')` and abort close if the user cancels.

**Sticky action bar:**
- Add CSS class `cra-detail__actions--sticky` to the actions `<div>` so it stays pinned at the bottom of the modal when body content scrolls.

### `frontend/src/components/CraDetailModal/CraDetailModal.css`

- Add sticky/fixed positioning for `.cra-detail__actions` so buttons remain visible during scroll (e.g., `position: sticky; bottom: 0; background: var(--modal-bg)`).

### `frontend/src/App.tsx`

- Add `annualCalendarRefreshKey` and `historyRefreshKey` state (both start at `0`).
- Add `handleModalMutated(_: CraDetailsDto)` that increments both keys.
- Pass `onMutated={handleModalMutated}` to `<CraDetailModal>`.
- Pass `refreshKey={annualCalendarRefreshKey}` to `<AnnualCalendar>`.
- Pass `refreshKey={historyRefreshKey}` to `<CraHistory>`.

### `frontend/src/components/AnnualCalendar/AnnualCalendar.tsx`

- Add optional `refreshKey?: number` prop.
- Include `refreshKey` in the `useEffect` dependency array that fetches CRA summaries, so an external increment forces re-fetch.

### `frontend/src/components/CraHistory/CraHistory.tsx`

- Add optional `refreshKey?: number` prop.
- Include `refreshKey` in the `useEffect` dependency array that fetches the CRA list.

### Tests

**`frontend/src/components/CraDetailModal/CraDetailModal.test.tsx`** — add:
- DRAFT CRA: clicking a day calls `updateDay` and re-renders updated day state.
- DRAFT CRA: `<CraValidation>` is rendered; successful validation calls `onMutated`.
- AWAITING_CLIENT_SIGNATURE CRA: `<CraSignatureActions>` is rendered with generate-link button.
- AWAITING_CLIENT_SIGNATURE CRA: PDF download button is present.
- Close while `downloading=true`: confirm dialog is shown; close is aborted if user cancels.
- After reopen success: `onMutated` is called.

**`frontend/src/components/AnnualCalendar/AnnualCalendar.test.tsx`** — add:
- Incrementing `refreshKey` triggers a new `listCras` call.

**`frontend/src/components/CraHistory/CraHistory.test.tsx`** — add:
- Incrementing `refreshKey` triggers a new `listCras` call.

## Excluded

- Creating a new CRA from inside the modal.
- Per-day note/comment editing (not implemented in standalone view; fields exist in API type but no UI).
- Revoking client signature links (not exposed anywhere in the UI).
- Deleting a CRA (not implemented in the UI).
- Client-side signature capture inside the modal (reuses stored provider signature via `getSignature()`; same as standalone).
- Navigating to Settings from the validation no-signature flow (the modal has no navigation; an inline hint suffices).
- Redesigning or restyling `CraSummaryPanel` for the modal layout.
- Migrating the modal's internal state type from `CraDetailsDto` (api/types) to `CraDetails` (types/cra) — the current dual-type pattern is preserved.

## Acceptance criteria

- A DRAFT CRA opened from the annual calendar can have its days toggled inside the modal; each click immediately persists and updates the displayed total worked days.
- "Valider et signer" is visible for DRAFT CRAs in the modal; completing the flow updates the modal status badge and calls `onMutated`.
- "Générer le lien de signature" / "Copier le lien" are accessible inside the modal for AWAITING_CLIENT_SIGNATURE CRAs.
- The PDF download button is present for both `VALIDATED` and `AWAITING_CLIENT_SIGNATURE` CRAs.
- After any successful mutation in the modal, the annual calendar month card and history list entry refresh without a full page reload.
- Attempting to close the modal while any action is in-flight (day save, validate, reopen, download) shows a browser confirmation prompt.
- The action bar (download, reopen buttons) remains visible when the modal body scrolls.
- `onMutated` is not called when an action fails; the error message is displayed in the modal.
- All pre-existing `CraDetailModal` tests continue to pass.
- New tests cover: DRAFT editing, validation flow, AWAITING_CLIENT_SIGNATURE actions, PDF for both statuses, in-flight close guard, and `refreshKey`-triggered re-fetch for AnnualCalendar and CraHistory.
- No action currently available in the standalone CRA view is absent from the modal.
