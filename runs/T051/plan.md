## Objective

Allow the provider to capture a reusable signature (drawn or uploaded) in settings, then apply it to an eligible CRA — snapshotting the image, signer name, and timestamp into that CRA so that later changes to the default signature never alter previously signed records.

## Included

### Backend

**New entity — `ProviderSignatureSettings`**
- `backend/.../signature/ProviderSignatureSettings.java`: singleton JPA entity (`id` always 1) storing `signerName (VARCHAR)` and `signatureImage (TEXT, base64 PNG)`.
- `backend/.../signature/ProviderSignatureSettingsRepository.java`: Spring Data JPA repository.
- `backend/.../signature/ProviderSignatureSettingsService.java`: `get()`, `save(signerName, image)`, `delete()`.
- `backend/.../signature/ProviderSignatureSettingsController.java`: REST endpoints `GET /api/signature`, `PUT /api/signature`, `DELETE /api/signature`.

**Extend `MonthlyCraReport` entity**
- Add columns `provider_signature_image TEXT` and `provider_signer_name VARCHAR` (nullable, set only when signing).
- Database migration: new `V{next}__add_provider_signature_to_cra.sql` (Flyway or equivalent) adding the two columns.

**Extend validation flow**
- `ValidateCraRequest` DTO: add `providerSignatureImage (String, required when validating)` and `providerSignerName (String, required)`.
- `CraValidationService.validate()`: persist `providerSignatureImage` and `providerSignerName` from the request into `MonthlyCraReport`; existing `providerSignatureDate` already stores the timestamp — no change needed there.
- `CraDetailsDto`: expose `providerSignatureImage`, `providerSignerName`, `providerSignedAt` (mapped from `providerSignatureDate`).

**PDF generation**
- Pass `MonthlyCraReport.providerSignatureImage` into `CraPdfProviderSignature.signatureImageRef` inside the existing PDF build path (`CraPdfDocument` / PDF service) so the snapshot image is rendered in the exported PDF.

**Backend tests**
- `ProviderSignatureSettingsServiceTest`: save, get, replace, delete.
- `CraValidationServiceTest`: assert `providerSignatureImage` and `providerSignerName` are stored on the CRA; assert changing settings after signing does not affect already-signed CRA record.
- `MonthlyCraReportTest`: entity constraints for new nullable columns.

### Frontend

**New `SignatureCanvas` component** (`frontend/src/components/SignatureCanvas/`)
- `SignatureCanvas.tsx`: `<canvas>` with pointer-events for mouse and touch drawing; exposes `toDataURL()` via `useImperativeHandle`; `clear()` action; accepts `onDraw` callback.
- `SignatureCanvas.test.tsx`: draw path renders pixels, clear resets, export returns non-empty data URL.

**New `SignatureSettings` section** (`frontend/src/components/SignatureSettings/`)
- `SignatureSettings.tsx`: renders `SignatureCanvas` for drawing OR a file `<input>` for upload (PNG / JPEG / SVG accepted, ≤500 KB); preview of saved signature; Replace and Delete actions; signer name text input; Save button calls `PUT /api/signature`.
- File validation: reject unsupported MIME types and files >500 KB with inline `role="alert"` error messages.
- `SignatureSettings.test.tsx`: upload valid file → persisted; upload oversized file → error shown; upload wrong type → error shown; draw + save → persisted; delete → cleared.

**Integrate `SignatureSettings` into the app shell / settings panel**
- Wire `SignatureSettings` into `AppShell` or a dedicated settings route/panel (wherever settings UI is exposed; create a minimal settings panel if none exists).

**Extend `CraValidation` component**
- Before confirming validation, fetch current signature from `GET /api/signature`; if absent, show a blocking message directing the provider to the settings page.
- If present, display a read-only preview and signer name; include them in `ValidateCraRequest` when submitting.

**API client**
- `frontend/src/api/signatureClient.ts`: `getSignature()`, `saveSignature(signerName, image)`, `deleteSignature()` wrapping `GET/PUT/DELETE /api/signature`.
- `frontend/src/api/types.ts`: add `ProviderSignatureDto { signerName: string; signatureImage: string }` and extend `ValidateCraRequest` with `providerSignatureImage: string; providerSignerName: string`.
- `frontend/src/api/errorMessages.ts`: add error codes `signature_too_large`, `signature_invalid_format`.

**Frontend types**
- `frontend/src/types/cra.ts`: extend `CraDetails` with `providerSignatureImage?: string`, `providerSignerName?: string`, `providerSignedAt?: string`.

**Frontend tests (colocated)**
- `SignatureCanvas.test.tsx` (see above).
- `SignatureSettings.test.tsx` (see above).
- `CraValidation` test: assert signature preview shown when settings present; assert blocking message when absent.

## Excluded

- Qualified or advanced electronic signature certification (e.g. eIDAS).
- External signature providers (DocuSign, HelloSign, etc.).
- Client signature workflow.
- Multi-user / multi-provider support (single provider assumed).
- Signature image optimization or server-side format conversion beyond client-side validation.
- Changes to existing PDF layout beyond passing the already-expected `signatureImageRef` into the existing `CraPdfProviderSignature` model.

## Acceptance criteria

1. `GET /api/signature` returns 404 initially; after `PUT /api/signature` with a valid payload, returns the stored `signerName` and `signatureImage`.
2. `DELETE /api/signature` removes the stored signature; subsequent `GET` returns 404.
3. Uploading a file >500 KB or with an unsupported MIME type displays an inline error and does not call the API.
4. The `SignatureCanvas` component captures pointer and touch events; drawing followed by export produces a non-empty PNG data URL (verified in unit test with jsdom/canvas mock).
5. `POST /api/cras/:id/validate` with `providerSignatureImage` and `providerSignerName` stores those values on the CRA record; `GET /api/cras/:id` returns them.
6. After signing a CRA, updating the signature via `PUT /api/signature` does not change `providerSignatureImage` or `providerSignerName` on the already-signed CRA (verified in `CraValidationServiceTest`).
7. The PDF generated for a signed CRA embeds the snapshot image (existing `signatureImageRef` field is populated).
8. `CraValidation` blocks submission and displays a guidance message when `GET /api/signature` returns 404.
9. All new unit tests (`SignatureCanvas`, `SignatureSettings`, `CraValidationService`, `ProviderSignatureSettingsService`) pass via `npm run test` and `mvn test`.
