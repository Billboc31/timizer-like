Done. Here's the summary:

**File modified:** `frontend/src/components/CraDetailModal/CraDetailModal.css`

**Change:** Removed `display: flex; flex-direction: column;` from the unconditional `.cra-detail-modal` rule and added them under `.cra-detail-modal[open]`.

**Why it works:** A native `<dialog>` element defaults to `display: none` when not open. The CSS was overriding that with an unconditional `display: flex`, forcing the dialog to render on every page. Scoping the flex layout to `[open]` restores the browser's default behaviour — the dialog is hidden until `.showModal()` is called, and the flex column layout applies only while it's open.
