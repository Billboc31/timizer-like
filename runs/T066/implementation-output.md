All 291 tests pass. Here's what was implemented:

## Summary

### Backend (5 files)
- **`CraPublicViewDto.java`** — added `craId: Long` and `status: String` fields
- **`CraSignatureTokenService.java`** — `toPublicViewDto()` now includes `craId`/`status`; `resolveToken()` throws `CraWrongStatusException` instead of `TokenNotFoundException` when CRA is in wrong status
- **`CraWrongStatusException.java`** — new exception (new file)
- **`CraApiExceptionHandler.java`** — added handler mapping `CraWrongStatusException` → `cra_wrong_status` (HTTP 409)
- **`PublicCraPdfController.java`** — new `GET /public/cra/{craId}/pdf` endpoint; returns 403 for non-FULLY_SIGNED/VALIDATED statuses (new file)

### Frontend (13 files)
- **`apiError.ts`** — added `token_not_found` and `cra_wrong_status` to `ApiErrorCode`
- **`httpClient.ts`** — added same codes to the `known` array
- **`craPublicView.ts`** — added `craId: number` and `status: string`
- **`craPublicClient.ts`** — added `downloadPublicCraPdf(craId)`
- **`SignatureCanvas.tsx/.css`** — fixed coordinate scaling after CSS scaling, added `disabled` prop, default buffer now 600×200
- **`ClientSignatureForm.tsx/.css`** — redesigned with explanation text, styled inputs, signature pad label, "Effacer"/"Signer et valider le CRA" buttons, error banner, submitting state forwarded to canvas
- **`SigningSuccessScreen.tsx/.css`** — extended with `craId`/`month`/`year` props; PDF download button with progress state
- **`CraSignaturePage.tsx/.css`** — full redesign: branded header, CRA summary card with status badge and localized dates, filtered worked-days table, three distinct error states, spinner loading state
- **`CraSignaturePage.test.tsx`** — added `craId`/`status` to mock, updated date assertion, added 3 new error-code tests
