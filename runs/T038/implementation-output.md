All 63 tests pass. Here's a summary of what was implemented:

---

## Changes made

### New file
- `frontend/src/components/CraSummaryPanel/CraSummaryPanel.css` — card layout, hero total (2.5rem bold), amber/green status badges, responsive 2-col meta grid (1-col below 480px), loading/error states

### Modified files

**`CraSummaryPanel.tsx`**
- Imports the new CSS
- Wraps content in `<section className="cra-summary-panel">`
- Adds a header with title and period as subtitle
- Renders `totalWorkedDays` as a `<strong>` hero figure (2.5rem)
- Replaces raw status text with a colored badge (`--draft` amber / `--validated` green)
- Keeps all `data-testid` attributes unchanged

**`CraSummaryPanel.test.tsx`**
- Added 2 tests: draft badge class and validated badge class

**`CraValidation.tsx`**
- Replaces state-swapping UI with a native `<dialog ref={dialogRef}>`
- Main "Valider le CRA" button is always rendered (full-width CTA)
- Dialog holds warning (mentioning read-only), error alert, and confirm/cancel buttons
- On click: `showModal()` + `uiState = 'confirming'`
- On cancel: `close()` + reset to idle
- On confirm: disables buttons, calls API; success closes dialog then calls `onValidated`; failure keeps dialog open with error and re-enables buttons

**`CraValidation.css`**
- Full-width primary button (min-height 44px), dialog with `::backdrop`, responsive stack at 480px

**`CraValidation.test.tsx`**
- `'clicking validate button shows confirmation UI'` — added `getByRole('dialog')` assertion
- `'displays error and re-enables validate button on API error'` — updated to assert dialog stays open and confirm/cancel re-enable

**`setupTests.ts`**
- Added JSDOM polyfill for `HTMLDialogElement.showModal()` and `.close()` (sets/removes the `open` attribute), required for `getByRole('dialog')` to work in tests
