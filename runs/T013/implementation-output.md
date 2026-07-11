Implementation complete. Here's a summary:

**Files modified (4):**
- `MonthlyCraReport.java` — added `validationDate` field with getter and setter
- `CraDetailsDto.java` — added `validationDate` and `providerSignatureDate` fields to the record
- `CraDetailsMapper.java` — passes the two new fields when building the DTO
- `CraDayUpdateService.java` — passes the two new fields in `buildDto()`

**Files created (3 main + 2 test):**
- `ValidateCraRequestDto.java` — record with `@NotNull LocalDate providerSignatureDate`
- `CraValidationService.java` — `POST` logic: fetch, guard against non-DRAFT, set three fields, save, return DTO
- `CraValidationController.java` — `POST /api/cras/{craId}/validate` endpoint
- `CraValidationServiceTest.java` — 4 unit tests (sets all fields, not-found, already-validated, DTO returned)
- `CraValidationControllerTest.java` — 4 web-layer tests (200, 404, 409, 400 missing date)

**Tests updated (3):** `CraControllerTest`, `CraDtoTest`, `CraDayControllerTest` — each now passes `null, null` for the two new DTO fields. All 98 tests pass.
