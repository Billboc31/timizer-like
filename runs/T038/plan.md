## Objective

Redesign the CRA summary panel and monthly validation area to add visual hierarchy, status badges, a prominent worked-days total, and a proper confirmation dialog before an irreversible validation action.

## Included

### `frontend/src/components/CraSummaryPanel/CraSummaryPanel.tsx`
- Wrap content in `<section className="cra-summary-panel">` with a named panel header.
- Display `totalWorkedDays` as a prominent hero figure (large font, bold) with the label "Total worked days" below it.
- Display the selected period (month + year) as a section subtitle directly under the header.
- Replace the raw `cra.status` text with a styled badge: amber for `DRAFT`, green for `VALIDATED`.
- Preserve all existing `data-testid` attributes (`summary-period`, `summary-status`, `summary-total`, `summary-provider`, `summary-provider-company`, `summary-client`) so existing test assertions stay valid.
- Style the loading and error states consistently with the panel (replace bare `<p>` tags with styled containers).

### `frontend/src/components/CraSummaryPanel/CraSummaryPanel.css` _(new file)_
- `.cra-summary-panel`: card-style container (border, border-radius, padding, background).
- `.cra-summary-panel__hero`: large figure for total worked days (font-size ≥ 2rem, font-weight bold).
- `.cra-summary-panel__badge`: status badge base styles.
- `.cra-summary-panel__badge--draft`: amber background/text for DRAFT.
- `.cra-summary-panel__badge--validated`: green background/text for VALIDATED.
- `.cra-summary-panel__meta`: flex/grid layout for provider, client, company info rows — wraps to one column below 480 px.
- `.cra-summary-panel__loading`, `.cra-summary-panel__error`: skeleton/alert variants for the two transient states.

### `frontend/src/components/CraValidation/CraValidation.tsx`
- Replace the inline state-swap confirmation UI with a native `<dialog>` element (no library).
- On "Valider le CRA" click: call `dialogRef.current.showModal()` and set `uiState = 'confirming'`.
- Inside the `<dialog>`: warning text (updated to mention that validated CRAs become read-only), "Confirmer" (destructive) and "Annuler" buttons.
- On cancel: call `dialogRef.current.close()` and reset `uiState = 'idle'`.
- On confirm: `uiState = 'loading'`, disable both dialog buttons, call `validateCra`, then either call `onValidated` + close dialog on success, or show error inside the dialog + reset `uiState = 'idle'` on failure (preserving all panel data).
- On validation failure: error stays visible inside the dialog and the dialog remains open so the user can retry or cancel — no screen data is lost.
- Primary "Valider le CRA" button styled as a full-width or block-level primary CTA.
- Return `null` when `cra` is null or `cra.status === 'VALIDATED'` (unchanged).

### `frontend/src/components/CraValidation/CraValidation.css`
- `dialog.cra-validation-dialog`: max-width, border-radius, padding, `::backdrop` semi-opaque overlay.
- `.cra-validation__button` (primary CTA): full-width, blue, large touch target (min-height 44 px).
- `.cra-validation__warning`: keep existing amber warning box; update copy to mention read-only consequence.
- `.cra-validation__confirm:disabled`, `.cra-validation__cancel:disabled`: opacity + `cursor: not-allowed` (already present, verify retained).
- Media query `@media (max-width: 480px)`: dialog takes 95 vw, action buttons stack vertically.

### `frontend/src/components/CraSummaryPanel/CraSummaryPanel.test.tsx`
- Add test: DRAFT status renders an element with class `badge--draft` (or `data-status="DRAFT"`).
- Add test: VALIDATED status renders an element with class `badge--validated` (or `data-status="VALIDATED"`).
- Existing assertions on `data-testid` values remain unchanged.

### `frontend/src/components/CraValidation/CraValidation.test.tsx`
- Update `'clicking validate button shows confirmation UI'`: query the `<dialog>` via `getByRole('dialog')` in addition to existing text/button queries.
- Update `'displays error and re-enables validate button on API error'`: assert the dialog is still open (error shown inside dialog) and the "Valider le CRA" button is still accessible (dialog keeps the confirm/cancel buttons active).
- Existing tests for null/validated rendering, loading state, and `onValidated` callback are structurally unchanged.

## Excluded

- Changing the `totalWorkedDays` calculation or rounding logic (backend or frontend).
- Changing the `validateCra` API call signature or the `POST /api/cras/{id}/validate` contract.
- Adding client signature functionality.
- Changing month/year selection (CraMonthSelector), the calendar grid (CalendarGrid), or the history list (CraHistory).
- Adding or removing CRA fields from the API types.
- Introducing a third-party component library or CSS framework.
- Any logic to make a VALIDATED CRA actually read-only (if not already enforced by the backend).

## Acceptance criteria

- `summary-total` displays the numeric total (e.g., `12.5`) prominently; its font size is larger than surrounding label text.
- `summary-status` element carries a visible color difference between DRAFT and VALIDATED states (verifiable via class name or computed style in tests).
- `summary-period` displays the month name and year (existing test passes unchanged).
- Clicking "Valider le CRA" opens a `<dialog>` (accessible via `getByRole('dialog')`).
- The dialog warning text references irreversibility and potential read-only behaviour.
- Clicking "Annuler" inside the dialog closes it and leaves `uiState` as `'idle'`; `validateCra` is not called.
- Clicking "Confirmer" disables both dialog buttons and changes the confirm button label to "Validation…" during the in-flight request.
- On API success, `onValidated` is called with the updated DTO and the dialog closes.
- On API failure, an error alert appears inside the dialog, both buttons re-enable, and the page data is unchanged.
- All existing `CraSummaryPanel` tests pass without modification to their assertions.
- All existing `CraValidation` tests pass (with structural updates for `<dialog>` as noted in Included).
- At 375 px viewport width, the summary panel meta rows stack in a single column and the dialog fits within the viewport without horizontal scroll.
