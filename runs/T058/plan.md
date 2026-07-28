Now I have enough context to write the plan. Let me produce it.

## Objective

Replace the loosely positioned provider signature area in both the CRA interface and generated PDF with a clearly bordered rectangular block that shows an empty state when unsigned and a signed state displaying the signature image, signer name, and signing date.

## Included

### Frontend — new `ProviderSignatureBox` component

- `frontend/src/components/ProviderSignatureBox/ProviderSignatureBox.tsx` (new)
  - Props: `cra: CraDetails` (to read `providerSignatureDate`, `providerName`) and `onSignClick: () => void` (delegate to existing `CraValidation` flow)
  - **Empty state** (when `providerSignatureDate` is null): full-width bordered rectangle with an invitation label ("Cliquez pour signer") and a touch-friendly click target triggering `onSignClick`
  - **Signed state** (when `providerSignatureDate` is set): rectangle containing — from top to bottom — an `<img>` of the stored provider signature with `object-fit: contain` and internal padding so it never touches the border, signer name below, signing date formatted as dd/MM/yyyy below that
  - Component must use the same CSS custom properties (`var(--...)`) and BEM naming pattern as the rest of the codebase (`provider-signature-box`, `provider-signature-box__img`, `provider-signature-box__name`, `provider-signature-box__date`)
  - No hardcoded colours; use design tokens from `frontend/src/styles/tokens.css`

- `frontend/src/components/ProviderSignatureBox/ProviderSignatureBox.css` (new)
  - `.provider-signature-box`: `border: 1px solid var(--color-border)`, fixed minimum height (≥ 120 px), `border-radius: var(--radius-md)`, padding `var(--spacing-4)`
  - `.provider-signature-box--empty`: cursor pointer, dashed border style, muted invitation text colour
  - `.provider-signature-box--signed`: solid border
  - `.provider-signature-box__img`: `max-width: 100%`, `object-fit: contain`, `display: block`, `margin: 0 auto`
  - Responsive block: on `max-width: 480px` ensure the box fills the column width
  - Companion `provider-signature-box__footer` row for name + date side-by-side on wide viewports, stacked on narrow

- `frontend/src/App.tsx` (modify)
  - Replace or wrap the existing inline position of `<CraValidation>` so that `<ProviderSignatureBox>` is visible in the CRA view at all times, with `onSignClick` wired to open the `CraValidation` dialog

- `frontend/src/components/ProviderSignatureBox/ProviderSignatureBox.test.tsx` (new)
  - Empty-state test: renders invitation text and calls `onSignClick` when the box is clicked (keyboard + pointer)
  - Signed-state test: renders the `<img>`, signer name, and formatted date; image has `alt` attribute set
  - Responsive test: verify `provider-signature-box--empty` / `--signed` class is toggled correctly based on props
  - Accessibility test (axe): no violations in either state

### Backend — improved PDF provider signature block

- `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java` (modify)
  - In `drawProviderSignatureBlock()` (lines 138–158): draw the outer rectangle first using `drawRectangle()` with consistent padding on all sides (`SIGNATURE_BOX_PADDING` constant, suggested 8 pt)
  - Inside the box, render signature image (when `signatureImageRef` is non-null) scaled to fit within `(SIGNATURE_BOX_WIDTH - 2 × padding) × (SIGNATURE_BOX_HEIGHT - padding - text_area_height)` while preserving aspect ratio (`PDImageXObject.getWidth() / getHeight()`)
  - Below the image area: render signer name and date within the same box, in a smaller font, respecting the padding margin
  - When `signatureImageRef` is null, render only the empty rectangle (current behaviour preserved)
  - Add a `SIGNATURE_BOX_PADDING` float constant alongside the existing dimension constants (lines 35–36)

- `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java` (modify)
  - Add a test verifying that the signed provider block text (`name`, formatted date) appears correctly in extracted PDF text when `signatureImageRef` is set
  - Keep existing tests passing (null-safe path already covered)

## Excluded

- Canvas-based in-browser handwritten signature drawing (no `<canvas>` pad, no signature-drawing libraries)
- Changing the validation workflow (`CraValidation` dialog logic, API call, state machine) — this ticket is display-only
- Client signature block implementation (only the visual language is prepared so a future ticket can align beside it)
- Qualified electronic signature certification
- Decorative handwritten fonts
- Signature image upload or management UI
- Backend changes outside `CraPdfGenerator.java` (no model, service, or controller changes needed)

## Acceptance criteria

- In the CRA interface with an unsigned CRA: a bordered dashed rectangle is visible with an invitation text; clicking it (pointer or touch) opens the existing `CraValidation` dialog
- In the CRA interface with a validated CRA: the same rectangle renders in solid-border style containing the stored signature image (aspect ratio preserved, no overflow), signer name, and signing date in dd/MM/yyyy format
- The box minimum height is at least 120 px; the signature image has padding so it never touches any border edge
- Axe reports zero accessibility violations in both states
- On a 375 px viewport the box fills the column width without horizontal overflow
- In the generated PDF, the provider signature block is a closed rectangle with internal padding; signature image (when present) is scaled to fit without crossing any border; name and date are rendered inside the box
- `ProviderSignatureBox.test.tsx` tests pass: empty state, signed state, click interaction, axe
- `CraPdfGeneratorTest.java` tests pass including the new signed-block assertion
- No changes to `CraValidation.tsx`, backend models, or backend services
