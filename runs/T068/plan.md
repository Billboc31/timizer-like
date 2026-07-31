## Objective

Embed the actual captured consultant and client signature images — with signer name, role, and timestamp — into every generated CRA PDF. Add "En attente de signature" pending state for missing signatures, per-month signature blocks on the detail pages, and safe handling of corrupt image data.

---

## Included

### A — Fix signature data storage (root cause)

**A1. `SignProviderRequestDto`** (`backend/src/main/java/com/timizerlike/backend/cra/web/SignProviderRequestDto.java`)**  
Add a required `@NotNull String signatureImageBase64` field alongside `providerSignatureDate`.

**A2. `CraSignatureController.signByProvider()`** (`…/web/CraSignatureController.java`)  
Pass `request.signatureImageBase64()` as a new argument to `transitionService.signByProvider()`.

**A3. `CraSignatureTransitionService.signByProvider()`** (`…/service/CraSignatureTransitionService.java`)  
- Accept new `String signatureImageBase64` parameter.
- Validate: throw `InvalidSignatureImageException` if blank or does not start with `data:image/`.
- Store: `cra.setProviderSignatureImage(signatureImageBase64)` before saving.

**A4. `ClientSignatureService.sign()`** (`…/service/ClientSignatureService.java`)  
After saving the audit record, propagate client signature data to the entity:
- `cra.setClientRepresentativeName(signerName)`
- `cra.setClientSignedAt(Instant.now())`
- `cra.setClientSignatureImage(signatureImageBase64)`
Then save `cra` via `craRepository.save(cra)`.

### B — Add Instant timestamp fields to entity

**B1. `MonthlyCraReport`** (`backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`)  
Add two new `@Column` fields:
- `providerSignedAt` (`Instant`, column `provider_signed_at`)
- `clientSignedAt` (`Instant`, column `client_signed_at`)

Hibernate `ddl-auto: update` will add the columns automatically; no migration file required.

**B2. Set `providerSignedAt` in `CraSignatureTransitionService.signByProvider()`**: `cra.setProviderSignedAt(Instant.now())`.

**B3. Set `clientSignedAt` in `ClientSignatureService.sign()`** (covered under A4).

**B4. Set `clientSignedAt` in `CraClientSignService.clientSign()`** (`…/service/CraClientSignService.java`): `cra.setClientSignedAt(Instant.now())`.

### C — Update PDF model records

**C1. `CraPdfProviderSignature`** (`…/pdf/model/CraPdfProviderSignature.java`)  
Add `String role`; change `signedAt` from `LocalDate` to `Instant`.

**C2. `CraPdfClientSignature`** (`…/pdf/model/CraPdfClientSignature.java`)  
Add `String role`; change `signedAt` from `LocalDate` to `Instant`.

### D — Update PDF download service

**D1. `CraPdfDownloadService.toDocument()`** (`…/service/CraPdfDownloadService.java`)  
- Provider signature:
  - name: use `cra.getProviderSignerName()` when non-null, otherwise `firstName + " " + lastName`
  - role: not applicable (no role field on provider in entity) — pass `null`
  - `signedAt`: use `cra.getProviderSignedAt()` (Instant)
- Client signature:
  - `signedAt`: use `cra.getClientSignedAt()` (Instant)
  - `role`: pass `cra.getClientContactRole()`
  - image: `decodeSignatureImage(cra.getClientSignatureImage())` (already strips data-URL prefix)

**D2. Normalize image decoding**: replace call to `decodeBase64()` for client image with `decodeSignatureImage()` so the data-URL prefix is stripped consistently for both signatures.

### E — PDF generator rendering changes

All changes in `CraPdfGenerator` (`…/pdf/CraPdfGenerator.java`):

**E1. `drawProviderSignatureBlock()`** (line 300)  
Add an `else` branch when `provider == null`: draw a box of `SIGNATURE_BOX_WIDTH × SIGNATURE_BOX_HEIGHT` with label "En attente de signature" (matching the existing client pending rendering at line 332–336).

**E2. Both signature blocks**  
After rendering signer name, render role label on the next line when non-null: italic Helvetica, 9pt.

**E3. `drawClientSignatureBlock()`** (line 319)  
When signed, add validation wording below signer name and date: `"Lu et approuvé les éléments ci-dessus"` in regular 9pt.

**E4. `embedSignatureImage()`** (line 339)  
In the `catch (Exception e)` block, instead of silently skipping: draw the text `"Signature illisible"` (regular 9pt, centred in the already-drawn box) so the failure is visible in the PDF.

**E5. `renderPage2()`** (line 358)  
Group `document.page2Days()` by `YearMonth`. For each group, in ascending order:
  1. Draw a month section header: period label (bold 12pt, MMMM yyyy format).
  2. Draw the day entries table for that month (reuse existing table logic).
  3. Draw total row for that month.
  4. Call `drawProviderSignatureBlock()` then `drawClientSignatureBlock()` with `document.signatures()`.
  5. Apply page-overflow guard before each signature block: if remaining vertical space < `SIGNATURE_BOX_HEIGHT + 50f`, open a new page before rendering the block.

**E6. Remove `drawClientValidationBlock()`** (line 447)  
Delete the method and its call at line 439. The per-month signature blocks added in E5 replace it.

### F — Tests

**F1. `CraPdfGeneratorTest`** (`…/cra/pdf/CraPdfGeneratorTest.java`)  
Add or update tests for:
- Provider not signed → PDF text contains "En attente de signature" in provider section.
- Both signed with `MINIMAL_PNG` images → no exception; both blocks contain signer names.
- Corrupt image bytes (`new byte[]{0x00}`) passed to provider block → PDF contains "Signature illisible".
- Role label present in provider and client blocks when non-null role is supplied.
- Multi-month day entries → each month section ends with "Signature prestataire" and "Signature client" blocks.

**F2. `CraPdfDownloadServiceTest`** (`…/service/CraPdfDownloadServiceTest.java`)  
Update fixture to supply `providerSignedAt` and `clientSignedAt` Instant values; assert `toDocument()` maps them to the model's `signedAt` fields.

**F3. `CraSignatureTransitionServiceTest`** (create if absent or extend existing)  
Assert that `signByProvider()` stores `providerSignatureImage` and `providerSignedAt` on the entity.

**F4. `ClientSignatureServiceTest`** (create if absent or extend existing)  
Assert that `sign()` propagates `clientRepresentativeName`, `clientSignedAt`, and `clientSignatureImage` to `MonthlyCraReport`.

---

## Excluded

- Frontend changes (provider sign form with signature canvas, download button updates).
- Revoking or rolling back a signature once captured (the workflow is forward-only; no revert-to-DRAFT path exists).
- `clientContactRole` display in PDF for the provider party (no role field on provider in the entity).
- `CraDetailsDto` / `CraDetailsMapper` signature field exposure changes (not needed for PDF).
- Any change to the cover page or Page 1 party-info sections.
- Replacing the SQLite `ddl-auto: update` strategy with explicit migration files (out of project scope).

---

## Acceptance criteria

- `POST /api/cras/{id}/sign-provider` with a valid base64 image → `MonthlyCraReport.providerSignatureImage` and `providerSignedAt` are non-null.
- `POST /public/cra-link/{token}/sign` → `MonthlyCraReport.clientSignatureImage`, `clientRepresentativeName`, and `clientSignedAt` are non-null.
- `GET /api/cras/{id}/pdf` after provider sign only → PDF contains "Signature prestataire" with provider name and date-time; client section shows "En attente de signature".
- `GET /api/cras/{id}/pdf` after both signatures → PDF embeds both images, names, roles (where non-null), and timestamps.
- Supplying corrupt bytes as `signatureImageBase64` in the provider block → PDF renders "Signature illisible" inside the box; no 500 error.
- Multi-month day-entry set → each month's detail section ends with both signature blocks; no block is split across pages.
- `clientContactRole` is displayed beneath the client signer name when non-null.
- "Lu et approuvé les éléments ci-dessus" appears in the client signature block when the client has signed.
- All four test classes in F1–F4 pass; existing PDF tests remain green.
- Cover page, Page 1 party-info, and daily detail table content are unchanged.
