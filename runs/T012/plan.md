Now I have a full picture of the codebase. The implementation is complete and approved. The plan to write for `runs/T012/plan.md` should accurately reflect the implementation design. Let me write it.

## Objective

Expose a Spring Boot `PATCH /api/cras/{craId}/days/{date}` endpoint that updates the `workValue` and/or `note` of an existing `CraDayEntry` for a given CRA. The endpoint must reject work values outside `{0, 0.5, 1}` and refuse any mutation when the parent CRA status is not `DRAFT`.

## Included

**New files**

- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayUpdateRequestDto.java`
  - Record with `Double workValue` (nullable = leave unchanged) and `String note` (nullable = leave unchanged, empty string = clear note).
- `backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java`
  - `@Transactional` method `updateDay(Long craId, LocalDate date, CraDayUpdateRequestDto)`.
  - Loads `MonthlyCraReport` via `MonthlyCraReportRepository`; throws `CraNotFoundException` if absent.
  - Rejects status != `DRAFT` with `CraValidatedException` (covers `SIGNED_BY_PROVIDER` and `VALIDATED`).
  - Loads `CraDayEntry` via `CraDayEntryRepository.findByMonthlyCraReport_IdAndDate`; throws `CraDayNotFoundException` if absent.
  - Delegates work-value mutation to `CraDayEntry.updateWorkValue(double)` (throws `InvalidWorkValueException` on rejection).
  - Updates note when non-null; empty string clears note.
  - Returns `CraDetailsDto` built from the parent CRA and all day entries sorted by date.
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraDayController.java`
  - `@RestController`, `PATCH /api/cras/{craId}/days/{date}` consuming `CraDayUpdateRequestDto`, producing `CraDetailsDto`.
  - Path variable `date` parsed as ISO `LocalDate` (`yyyy-MM-dd`).
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java`
  - `@RestControllerAdvice` mapping:
    - `InvalidWorkValueException` → 400 `{ "error": "invalid_work_value", "value": <n> }`
    - `CraValidatedException` → 409 `{ "error": "cra_validated" }`
    - `CraNotFoundException` → 404 `{ "error": "cra_not_found" }`
    - `CraDayNotFoundException` → 404 `{ "error": "cra_day_not_found" }`
    - `MethodArgumentTypeMismatchException` (malformed date) → 400

**Files to modify**

- `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java`
  - Add `public void updateWorkValue(double value)` reusing existing `isAllowedWorkValue()` guard; throws `InvalidWorkValueException` on rejection. No new public setter that bypasses validation.

**Tests to add**

- `CraDayEntryUpdateWorkValueTest.java` (unit) — `updateWorkValue` accepts 0 / 0.5 / 1, rejects other doubles, NaN, Infinity.
- `CraDayUpdateServiceTest.java` (Mockito, no Spring context) — happy paths (workValue only, note only, both); null/empty note semantics; rejection when status is `VALIDATED` or `SIGNED_BY_PROVIDER`; rejection on invalid work values; `CraNotFoundException` / `CraDayNotFoundException` on missing entities; repository called exactly once on success.
- `CraDayControllerTest.java` (`@WebMvcTest`) — 200 + `CraDetailsDto` on valid request; 400 on invalid work value; 409 on non-DRAFT CRA; 404 on unknown CRA or unknown date; 400 on malformed date path segment.

## Excluded

- CRA creation, CRA validation flow, CRA retrieval GET endpoint, PDF generation, client/provider signature workflow.
- Bulk or multi-day updates in a single call.
- Creating a `CraDayEntry` on demand when no entry exists for the requested date (day provisioning happens at CRA creation time).
- Reopening a validated CRA.
- Authentication, authorization, per-user scoping.
- Renaming or restructuring the pre-existing dual-package layout (`com.timizer.backend.cra` entities vs. `com.timizerlike.backend.cra` web/dto). Do not opportunistically fix it.
- Any change under `com.timizerlike.cra.pdf.**` or to `CraCreationService`.
- New runtime dependencies in `pom.xml`; Spring Web and Validation are already present.

## Acceptance criteria

- `PATCH /api/cras/{craId}/days/{date}` with `{"workValue": 0.5}` returns 200 and the response `CraDetailsDto` reflects the new work value and a recomputed `totalWorkedDays`.
- Same endpoint with `{"note": "some text"}` returns 200 and preserves the prior work value while updating the note; `{"note": ""}` clears the note.
- A request with `workValue` not in `{0, 0.5, 1}` (e.g. 0.25, -1, 2) returns 400 with `{"error": "invalid_work_value", "value": <n>}`; the persisted entry is unchanged.
- A request against a CRA whose status is `VALIDATED` or `SIGNED_BY_PROVIDER` returns 409 with `{"error": "cra_validated"}`; the persisted entry is unchanged.
- Unknown `craId` → 404 `{"error": "cra_not_found"}`; existing CRA but unknown `date` → 404 `{"error": "cra_day_not_found"}`.
- Malformed `date` path segment (e.g. `2024-13-01`, `not-a-date`) returns 400.
- Response payload is `CraDetailsDto` with at minimum: `id`, `month`, `year`, `status`, `totalWorkedDays`, and `days[]` including the updated entry.
- All new unit and `@WebMvcTest` tests pass.
- All pre-existing tests in `backend/src/test/java/**` still pass (`mvn test` from `backend/`).
- No files outside the "Included" list are modified; no changes under `com.timizerlike.cra.pdf.**`; `CraCreationService` signature unchanged.
