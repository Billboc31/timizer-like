Now I have everything I need. Let me write the plan.

## Objective
Extend the CRA PDF to render provider and client signatures — signer name, signing date, and optional embedded image — in their respective areas. A provider-only signed CRA shows a "pending client signature" state; a fully signed CRA shows both signatures and is stable across repeated downloads. Introduce the client-signing persistence layer, API endpoint, and a minimal frontend trigger.

## Included

### Backend — persistence (`MonthlyCraReport.java`)
Add 4 nullable fields and their getters/setters (Hibernate `ddl-auto: update` propagates the columns automatically):
- `clientSignatureDate` (`LocalDate`, nullable) — date the client representative signed
- `clientRepresentativeName` (`String`, nullable) — name captured at client-signing time
- `providerSignatureImage` (`String`, nullable) — base64-encoded image supplied at provider validation
- `clientSignatureImage` (`String`, nullable) — base64-encoded image supplied at client signing

### Backend — PDF model records
- `CraPdfProviderSignature.java`: replace `String signatureImageRef` with `byte[] signatureImage` (nullable)
- `CraPdfClientSignature.java`: replace `String signatureImageRef` with `byte[] signatureImage` (nullable)

These are internal rendering models; callers decode base64 → `byte[]` before constructing them.

### Backend — PDF renderer (`CraPdfGenerator.java`)
- Change `drawProviderSignatureBlock(PDPageContentStream, float, CraPdfSignatures)` → `drawProviderSignatureBlock(PDDocument, PDPageContentStream, float, CraPdfProviderSignature)`: embed image via `PDImageXObject.createFromByteArray` when non-null, preserving aspect ratio inside the fixed `SIGNATURE_BOX_WIDTH × SIGNATURE_BOX_HEIGHT` bounding box; fall back to an empty rectangle when null.
- Change `drawClientSignatureBlock(PDPageContentStream, float)` → `drawClientSignatureBlock(PDDocument, PDPageContentStream, float, CraPdfClientSignature)`: render name + "Signé le {date}" + image when `client != null && client.signedAt() != null`; render "En attente de signature" + empty rectangle otherwise.
- Add private `embedSignatureImage(PDDocument, PDPageContentStream, byte[], float x, float y, float w, float h)`: wraps `PDImageXObject.createFromByteArray` + `cs.drawImage` in a try/catch so corrupt data never aborts PDF generation.
- Update `renderPage1` to pass `pdf` (already a parameter) and the client signature to both helpers.

### Backend — download service (`CraPdfDownloadService.java`)
In `toDocument(MonthlyCraReport)`:
- Decode `cra.getProviderSignatureImage()` (Base64 → `byte[]`, null-safe) when building `CraPdfProviderSignature`.
- Build `CraPdfClientSignature` from `cra.getClientRepresentativeName()`, `cra.getClientSignatureDate()`, and decoded `cra.getClientSignatureImage()`; pass `null` when all three are absent.

### Backend — provider validation (additive, backwards-compatible)
- `ValidateCraRequestDto.java`: add optional `signatureImageBase64` (`String`, may be null/absent).
- `CraValidationService.validate(...)`: store `providerSignatureImage` when the field is present in the request.

### Backend — client-signing API (new)
- `ClientSignRequestDto.java`: record with `clientRepresentativeName` (`String`, required), `clientSignatureDate` (`LocalDate`, required), `signatureImageBase64` (`String`, optional).
- `CraClientSignService.java`: load CRA, assert status == `VALIDATED` (throws `CraNotValidatedException` / new `CraAlreadyClientSignedException` if not), set `clientRepresentativeName`, `clientSignatureDate`, `clientSignatureImage`, save.
- `CraClientSignController.java`: `POST /api/cras/{craId}/client-sign` → 200 `CraDetailsDto`.

### Backend — DTOs and mapper
- `CraDetailsDto.java`: add `clientSignatureDate` (`String`, nullable), `clientRepresentativeName` (`String`, nullable).
- `CraDetailsMapper.java`: map both new fields.

### Frontend
- `frontend/src/api/types.ts` (or `cra.ts`): add `clientSignatureDate: string | null`, `clientRepresentativeName: string | null` to the CRA DTO type.
- Add `clientSignCra(craId, payload)` function in `craClient.ts`.
- New `CraClientSign.tsx`: minimal modal with a text input for the representative's name, a date field defaulting to today, and an optional file input for a signature image (base64-encoded before sending). No canvas drawing; image is optional.
- `CraHistory.tsx`: show a "Signer (client)" button next to "Download PDF" for VALIDATED CRAs where `clientSignatureDate === null`.

### Tests
- `CraPdfGeneratorTest.java`:
  - Update `fullFixture()` to replace the `String "provider-signature-ref"` with `byte[]` (e.g. a minimal valid 1×1 PNG byte array, or `null` to test text-only path).
  - Add `generatesPdfWithPendingClientSignature()`: provider signature present, client signature `null` → page 1 text contains `"En attente de signature"`.
  - Add `generatesPdfWithBothSignatures()`: both signatures with name and date → page 1 text contains both signer names and both dates.
  - Add `handlesMissingSignatureImageGracefully()`: pass invalid bytes as `signatureImage`; `generate()` must not throw.
- `CraPdfDownloadServiceTest.java`:
  - Update `validatedCra()` mock to stub `getClientSignatureDate()`, `getClientRepresentativeName()`, `getClientSignatureImage()` (return `null` for all).
  - Add `populatesProviderSignatureFromCra()` and `populatesNullClientSignatureWhenNotSigned()`.
- New `CraClientSignServiceTest.java`:
  - Happy path: VALIDATED CRA → client fields stored.
  - Rejection when CRA is `DRAFT`.
  - Idempotency or rejection when client already signed.

## Excluded
- Canvas-based handwritten signature capture in the frontend (the API accepts an optional base64 image; the UI provides a plain file input or omits the image).
- A separate immutable snapshot table — the frozen `MonthlyCraReport` entity (immutable after VALIDATED) serves as the snapshot.
- Revoking or replacing signatures after client has signed.
- Emailing the PDF.
- Cryptographic PDF certificates and third-party e-signature standards.
- Holiday detection for day-type classification (pre-existing gap in `resolveDayType`).

## Acceptance criteria
- `CraPdfGeneratorTest.generatesPdfWithPendingClientSignature` passes: page 1 extracted text contains `"En attente de signature"` and the provider's name and date.
- `CraPdfGeneratorTest.generatesPdfWithBothSignatures` passes: page 1 extracted text contains provider name, provider date, client representative name, and client date.
- `CraPdfGeneratorTest.handlesMissingSignatureImageGracefully` passes: `generate()` does not throw when `signatureImage` bytes are corrupt or null.
- `CraPdfDownloadService.toDocument` maps `clientRepresentativeName` and `clientSignatureDate` from the entity into `CraPdfClientSignature`; no NPE when those fields are null.
- `POST /api/cras/{id}/client-sign` with valid payload returns 200 and stores `clientRepresentativeName`, `clientSignatureDate` in the DB; subsequent `GET /api/cras/{id}/pdf` renders the client signature area.
- `POST /api/cras/{id}/client-sign` on a `DRAFT` CRA returns 4xx (not-validated guard).
- Two consecutive `GET /api/cras/{id}/pdf` calls on a fully signed CRA return identical page 1 content (deterministic rendering).
- Providing `null` for `signatureImageBase64` in both the provider-validate and client-sign requests succeeds; the PDF is generated without embedded images.
