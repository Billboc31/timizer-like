Now I have enough context to write the plan.

## Objective

Expose a `POST /api/cras/{craId}/validate` endpoint that transitions a CRA from `DRAFT` to `VALIDATED`, storing a validation date and a provider signature date. Once validated, the CRA is locked against day-entry modifications (already enforced by the existing `CraDayUpdateService` status check).

## Included

**New files**

- `backend/src/main/java/com/timizerlike/backend/cra/web/CraValidationController.java`
  - `POST /api/cras/{craId}/validate`
  - Accepts `ValidateCraRequestDto`, returns `CraDetailsDto` (HTTP 200)
  - Delegates to `CraValidationService`

- `backend/src/main/java/com/timizerlike/backend/cra/web/ValidateCraRequestDto.java`
  - Single field: `LocalDate providerSignatureDate` (not null, validated with `@NotNull`)

- `backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java`
  - Method: `validate(Long craId, LocalDate providerSignatureDate) → CraDetailsDto`
  - Fetches CRA by ID; throws `CraNotFoundException` if absent
  - Throws `CraValidatedException` if status is not `DRAFT`
  - Sets `status = VALIDATED`, `providerSignatureDate`, `validationDate = LocalDate.now()`
  - Saves via `MonthlyCraReportRepository`, returns mapped `CraDetailsDto`

- `backend/src/test/java/com/timizerlike/cra/service/CraValidationServiceTest.java`
  - Should validate a DRAFT CRA and persist the three fields
  - Should throw `CraNotFoundException` for unknown craId
  - Should throw `CraValidatedException` if CRA is already VALIDATED

- `backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java`
  - HTTP 200 with body on success
  - HTTP 404 when CRA not found
  - HTTP 409 when CRA already validated
  - HTTP 400 when `providerSignatureDate` is missing

**Modified files**

- `MonthlyCraReport.java`
  - Add `LocalDate validationDate` (nullable, no unique constraint)

- `CraDetailsDto.java` (record or class)
  - Add `LocalDate validationDate`
  - Add `LocalDate providerSignatureDate`
  - Update factory/mapping method to populate both fields

## Excluded

- PDF generation
- Client signature flow
- `SIGNED_BY_PROVIDER` status transition (out of scope per ticket)
- Reopening a validated CRA
- Frontend or UI changes
- Authentication / authorization
- Database migration scripts (H2 auto-DDL handles schema in dev/test)

## Acceptance criteria

- `POST /api/cras/{craId}/validate` with a valid body returns HTTP 200 and the CRA details with `status = VALIDATED`, a non-null `validationDate`, and the submitted `providerSignatureDate`.
- Sending the same request a second time returns HTTP 409 with error code `cra_validated`.
- `POST /api/cras/9999/validate` for an unknown CRA returns HTTP 404 with error code `cra_not_found`.
- `POST /api/cras/{craId}/validate` with a missing `providerSignatureDate` returns HTTP 400.
- After validation, `PATCH /api/cras/{craId}/days/{date}` returns HTTP 409 (`cra_validated`), confirming the lock is enforced.
- All pre-existing tests (`CraDayControllerTest`, `CraDayUpdateServiceTest`, `CraDayEntryTest`, etc.) continue to pass without modification.
