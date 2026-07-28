All 72 unit tests pass. Here's a summary of every file created or modified:

---

## Changes summary

### Backend — new files
- `CraAlreadyClientSignedException.java` — thrown when client already signed
- `ClientSignRequestDto.java` — request body for `POST /client-sign`
- `CraClientSignService.java` — service that stores client signature
- `CraClientSignController.java` — `POST /api/cras/{craId}/client-sign`
- `CraClientSignServiceTest.java` — 6 tests: happy path, rejection on DRAFT, idempotency guard, image storage

### Backend — modified files
| File | What changed |
|---|---|
| `MonthlyCraReport.java` | +4 nullable fields: `clientSignatureDate`, `clientRepresentativeName`, `providerSignatureImage`, `clientSignatureImage` + getters/setters |
| `CraPdfProviderSignature.java` | `String signatureImageRef` → `byte[] signatureImage` |
| `CraPdfClientSignature.java` | `String signatureImageRef` → `byte[] signatureImage` |
| `CraPdfGenerator.java` | `drawProviderSignatureBlock` + `drawClientSignatureBlock` accept `PDDocument` + signature models; `embedSignatureImage` helper embeds image with aspect-ratio scaling, silently skips corrupt data; client block shows "En attente de signature" when unsigned |
| `CraPdfDownloadService.java` | Decodes base64 images, builds `CraPdfClientSignature` from entity fields |
| `CraValidationService.java` | Accepts `signatureImageBase64` as 3rd param, stores when present |
| `CraValidationController.java` | Passes image to service |
| `ValidateCraRequestDto.java` | +`signatureImageBase64` (optional) |
| `CraDetailsDto.java` | +`clientSignatureDate`, `clientRepresentativeName` |
| `CraDetailsMapper.java` | Maps both new fields |
| `CraDayUpdateService.java` | Passes 2 new null fields to `CraDetailsDto` constructor |
| `CraSummaryDto.java` | +`clientSignatureDate` for frontend list |
| `CraHistoryService.java` | Maps `clientSignatureDate` |
| `CraApiExceptionHandler.java` | +handler for `CraAlreadyClientSignedException` → 409 |
| `CraPdfGeneratorTest.java` | Updated `fullFixture` (String→null), +3 new tests |
| `CraPdfDownloadServiceTest.java` | Updated mock stubs, +3 new tests |
| Multiple existing test files | Updated `CraDetailsDto`/`CraSummaryDto`/`validate()` call sites |

### Frontend — new files
- `CraClientSign.tsx` — modal with name field, date field (defaults to today), optional image upload

### Frontend — modified files
- `types.ts` — `CraDetailsDto` +`clientSignatureDate`, `clientRepresentativeName`; `CraSummaryDto` +`clientSignatureDate`; +`ClientSignRequest` interface
- `craClient.ts` — +`clientSignCra()` function
- `types/cra.ts` — +`clientSignatureDate`, `clientRepresentativeName` on `CraDetailsDto`
- `CraHistory.tsx` — imports `CraClientSign`, adds "Signer (client)" button for VALIDATED CRAs without `clientSignatureDate`
