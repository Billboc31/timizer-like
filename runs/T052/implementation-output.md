All 135 tests pass. Here's a summary of the changes made:

**Files modified:**

- `backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java` — replaced the old two-value ternary with `CraDetailsMapper.mapStatus(report.getStatus())` and added the `CraDetailsMapper` import; dropped the unused `ValidationStatus` import.

- `backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java` — updated two tests that were asserting the old buggy behavior:
  - `mapsValidatedReportWithValidationDate`: now expects `FULLY_SIGNED` (backward-compat rule in the mapper)
  - `mapsSignedByProviderAsDraft` (renamed `mapsSignedByProviderStatus`): now expects `SIGNED_BY_PROVIDER` instead of `DRAFT`

135/135 tests pass. The blocking issue from the review is resolved.
