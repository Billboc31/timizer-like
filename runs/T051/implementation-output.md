All tasks complete. Here's a summary of everything implemented:

---

## Summary

**Backend — 14 files created/modified**

- **New**: `ProviderSignatureSettings` entity + repository (`com.timizer.backend.cra.signature`)
- **New**: `ProviderSignatureSettingsService`, `ProviderSignatureSettingsController`, `ProviderSignatureDto` (`com.timizerlike.cra.signature`) — REST endpoints `GET/PUT/DELETE /api/signature`
- **Extended** `MonthlyCraReport` — added `providerSignatureImage`, `providerSignerName` columns + getters/setters
- **Extended** `ValidateCraRequestDto` — added `@NotBlank providerSignatureImage`, `@NotBlank providerSignerName`
- **Extended** `CraValidationService.validate()` — accepts and persists the snapshot fields
- **Extended** `CraValidationController` — passes new fields to service
- **Extended** `CraDetailsDto` — added `providerSignatureImage`, `providerSignerName`
- **Extended** `CraDetailsMapper` + `CraDayUpdateService` — map new fields
- **Extended** `CraPdfDownloadService` — passes `providerSignatureImage` into `CraPdfProviderSignature.signatureImageRef`
- **Updated tests**: `ProviderSignatureSettingsServiceTest` (new), `CraValidationServiceTest`, `CraValidationControllerTest`, `CraDtoTest`, `CraDayControllerTest`, `CraControllerTest`, `CraWorkflowIntegrationTest` — all 124 tests pass

**Frontend — 13 files created/modified**

- **New**: `signatureClient.ts` — `getSignature`, `saveSignature`, `deleteSignature`
- **Extended**: `apiError.ts` — `signature_too_large`, `signature_invalid_format` codes; `errorMessages.ts` — French messages; `httpClient.ts` — `apiPut`, `apiDelete`; `types.ts` — `ProviderSignatureDto`, extended `ValidateCraRequest` and `CraDetailsDto`; `types/cra.ts` — signature snapshot fields on `CraDetails`
- **New**: `SignatureCanvas` component (pointer/touch drawing, `forwardRef` handle) + tests
- **New**: `SignatureSettings` component (draw/upload tabs, file validation, save/replace/delete) + CSS + tests
- **Extended** `AppShell` — added "Paramètres" nav item
- **Extended** `App.tsx` — settings view, passes `onGoToSettings` to `CraValidation`
- **Extended** `CraValidation` — fetches signature before confirming, shows blocking message if none configured, includes signature snapshot in validate request
- **Updated**: `CraValidation.test.tsx`, `CraValidation.axe.test.tsx` — all 135 tests pass (2 pre-existing import failures in unrelated axe tests remain)
