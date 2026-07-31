# T066 — Plan: Redesign the client CRA signature page

## Objective

Redesign the unauthenticated public CRA signature page (`/sign/{token}`) so it is visually polished, professionally branded, accessible, and fully responsive on desktop and mobile. The redesign covers the page layout, CRA summary, signature form, signature canvas, and the post-signature success screen, without altering any security mechanism, the token workflow, or the main authenticated application UI.

## Included

### Backend — minimal additions

- `CraPublicViewDto.java`: add fields `craId: Long` and `status: String` mapped from the CRA entity.
- `PublicCraViewController.java`: include `craId` and `status` in the public view DTO mapping.
- New `PublicCraPdfController.java`: endpoint `GET /public/cra/{craId}/pdf` — returns the CRA PDF for any CRA in `FULLY_SIGNED` or `VALIDATED` status; delegates to the existing PDF generation service; no authentication required for these two statuses only; returns 403 for all other statuses.

### Frontend — types and API client

- `frontend/src/types/craPublicView.ts`: add `craId: number` and `status: string` fields to `CraPublicView`.
- `frontend/src/api/craPublicClient.ts`: add `downloadPublicCraPdf(craId: number): Promise<Blob>` calling `GET /public/cra/{craId}/pdf`.

### Frontend — CraSignaturePage

- `frontend/src/public/CraSignaturePage.tsx`: full redesign
  - Branded header: application name, minimal CRA document identity line ("Compte Rendu d'Activité").
  - CRA summary card: formatted period (month name + year), consultant name + company, client name + company, total worked days (displayed prominently), provider signature date (localized format, e.g., "31 juillet 2026" — not ISO), status badge.
  - Worked-days table: filter out 0-value entries; format `worked` values as "Journée complète" / "Demi-journée"; format day column as a full readable date.
  - Error handler parses `ApiError.code` to produce three distinct states:
    - `token_not_found` / any 404: "Ce lien est invalide ou expiré."
    - `token_already_consumed`: "Ce lien de signature a déjà été utilisé."
    - `cra_wrong_status`: "Ce CRA a déjà été signé ou n'est plus disponible."
    - Other errors: existing generic message.
  - Loading state: styled spinner rather than raw text.
  - Pass `cra.craId`, `cra.month`, and `cra.year` to `SigningSuccessScreen` (extend `SignedState` or pass directly as props).
- `frontend/src/public/CraSignaturePage.css`: new file — page wrapper, branded header, info card, worked-days table styling, error state variants (invalid / consumed / wrong-status), loading state, responsive centered card (max-width 680px, mobile padding).

### Frontend — ClientSignatureForm

- `frontend/src/components/ClientSignatureForm/ClientSignatureForm.tsx`: redesigned form
  - Signing explanation section: short paragraph explaining what the signature validates.
  - Form fields styled with the `.input` base class from `base.css`.
  - Signature section: container with explicit `<label>` "Votre signature *"; bordered area with placeholder hint visible when canvas is empty.
  - Button layout:
    - "Effacer" (was "Effacer la signature") — `btn btn-secondary`, placed below the pad, `data-testid="clear-button"` preserved.
    - "Signer et valider le CRA" (was "Soumettre la signature") — `btn btn-primary`, full-width, `data-testid="submit-button"` preserved.
  - Error banner: styled `role="alert"` using `--color-error-light` background; drawn signature not cleared on retryable errors.
  - Submitting state: button label "Signature en cours…", button disabled, `disabled` prop forwarded to `SignatureCanvas` to block further drawing.
- `frontend/src/components/ClientSignatureForm/ClientSignatureForm.css`: new file.

### Frontend — SignatureCanvas

- `frontend/src/components/SignatureCanvas/SignatureCanvas.tsx`:
  - Set fixed buffer: `width={600}` `height={200}` attributes (default; props remain for override).
  - CSS on the canvas element: `width: 100%; max-width: 600px; height: auto` so display is fluid on small viewports while the buffer stays constant.
  - `getPos()`: scale pointer coordinates — `x = (e.clientX - rect.left) * (canvas.width / rect.width)`, `y = (e.clientY - rect.top) * (canvas.height / rect.height)` — to preserve accuracy after CSS scaling.
  - Add `disabled?: boolean` prop: when true, ignore pointer events and set `cursor: default`.
- `frontend/src/components/SignatureCanvas/SignatureCanvas.css`: new file — border, border-radius, background `var(--color-white)`, placeholder hint overlay (CSS `::before` on the wrapper, hidden once `has-drawn` class is added).

### Frontend — SigningSuccessScreen

- `frontend/src/components/SigningSuccessScreen/SigningSuccessScreen.tsx`:
  - Props extended: add `craId: number`, `month: number`, `year: number`.
  - Visual: success checkmark icon (Unicode ✓ styled as a circle), "CRA signé avec succès" heading in `--color-success`, signer name and localized signing date.
  - PDF download button: calls `downloadPublicCraPdf(craId)` then triggers a browser download as `cra-{year}-{padded-month}.pdf`; shows "Téléchargement…" while in progress; shows inline retry message on error; `data-testid="download-pdf-button"`.
- `frontend/src/components/SigningSuccessScreen/SigningSuccessScreen.css`: new file.

### Test updates

- `frontend/src/public/CraSignaturePage.test.tsx`:
  - Add `craId: 42` and `status: "AWAITING_CLIENT_SIGNATURE"` to `MOCK_CRA`.
  - Replace assertion `/2026-07-31/` with `/31 juillet 2026/` to match new localized date display.
  - Add tests for the three distinct error-code messages (mock `getPublicCra` rejecting with `ApiError` instances carrying specific codes).
- `frontend/src/components/ClientSignatureForm/ClientSignatureForm.test.tsx`: no changes needed — all assertions use `data-testid` selectors, not button label text.

## Excluded

- Changes to the two-party internal signing workflow (`CraClientSign`, `CraSignatureActions`, `CraValidation`, `ProviderSignatureBox`).
- Provider signature flow.
- PDF generation engine or rendering logic (handled by separate tickets).
- Backend authentication or token security mechanisms (token generation, hashing, revocation).
- Main application (authenticated) UI.
- Token expiry duration or revocation policies.
- Backend signature storage format (base64 image column).

## Acceptance criteria

- The signature page renders a professional card layout on desktop (≥768 px) and on a 375 px viewport without horizontal scrolling.
- CRA period, consultant name, client name, total worked days, and provider signature date are all visible before the signature form.
- The provider signature date is displayed in localized French format, not ISO.
- Three distinct messages are shown for: (a) invalid / expired link, (b) already-consumed link, (c) CRA in wrong status.
- The signature pad accepts mouse, touch, and stylus input via Pointer Events.
- Pointer coordinates are accurate after CSS scaling (canvas buffer 600×200, displayed fluid width).
- Page scrolling is blocked while drawing (`touch-action: none` on the canvas element).
- "Signer et valider le CRA" remains disabled until signer name is non-empty, consent is checked, and the pad is non-empty.
- Double submission is prevented: while submitting, the button and pad are both disabled.
- A retryable API error shows an inline alert without erasing the drawn signature.
- The success screen shows signer name, localized signing date, and a functioning PDF download button.
- The PDF download button triggers download of the CRA PDF (requires `FULLY_SIGNED` or `VALIDATED` status on the backend).
- All non-drawing controls are reachable and operable by keyboard alone with visible focus indicators.
- All form fields and interactive elements have explicit accessible labels.
- Existing `data-testid` attributes remain stable; existing test suites pass after the date format and mock-data updates described above.
- `GET /public/cra/{craId}/pdf` returns 200 + PDF for `FULLY_SIGNED` CRAs and 403 for all other statuses.
