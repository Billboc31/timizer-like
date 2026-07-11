## Objective

Expose a Spring Boot REST endpoint that updates a single CRA day entry (work value and/or note) for an existing CRA, rejecting invalid work values (anything other than 0, 0.5, 1) and refusing any update when the target CRA is already `VALIDATED`. The endpoint returns a clearly-shaped payload containing the updated day (and the parent CRA's post-update state), so the frontend calendar can reconcile immediately.

## Included

**Assumptions on starting state** (must hold before the Coder begins — verify first):

- Backend module `backend/` is a Spring Boot project (Maven, `com.timizerlike.cra` application).
- Entities exist under `com.timizer.backend.cra`:
  - `MonthlyCraReport` (with `ValidationStatus status`, `PreUpdate` timestamp hook).
  - `CraDayEntry` (fields `monthlyCraId`, `date`, `workValue`, `note`; constructor validates work value via `InvalidWorkValueException`).
- `ValidationStatus` enum contains `DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`.
- DTOs exist under `com.timizerlike.backend.cra.dto`: `CraDayEntryDto`, `CraDetailsDto`, `CraStatus`, etc.
- A `MonthlyCraReportRepository` (JPA) exists or will be re-used from T004; if only present on another branch and not yet merged into this ticket's base, add it as part of this ticket (minimal `JpaRepository<MonthlyCraReport, Long>`).

If any assumption above is false at ticket start, the Coder must stop and flag it before making changes; do not silently expand scope to bootstrap the missing pieces beyond a strict minimum needed for this endpoint.

**Files to add**

- `backend/src/main/java/com/timizer/backend/cra/CraDayEntryRepository.java`
  - `JpaRepository<CraDayEntry, Long>`.
  - `Optional<CraDayEntry> findByMonthlyCraIdAndDate(Long monthlyCraId, LocalDate date)`.
  - `List<CraDayEntry> findAllByMonthlyCraIdOrderByDateAsc(Long monthlyCraId)` (needed to shape the response `CraDetailsDto`).
- `backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java`
  - Method `CraDetailsDto updateDay(Long craId, LocalDate date, CraDayUpdateRequestDto request)`.
  - Loads the parent CRA; if missing → `CraNotFoundException` (new, `RuntimeException`).
  - If `status == VALIDATED` → `CraValidatedException` (new, `RuntimeException`).
  - Loads the day entry (`findByMonthlyCraIdAndDate`); if missing → `CraDayNotFoundException` (new). The endpoint operates on days that already exist in the CRA (day creation is out of scope; if the ticket must also accept a not-yet-persisted day for the same month, treat as a follow-up decision — see Risks).
  - Delegates work-value validation to `CraDayEntry`'s existing invariant: replace the value via a new instance method `updateWorkValue(double)` (added on the entity — see below), which throws `InvalidWorkValueException` on rejection.
  - Updates `note` via existing `setNote`; treats `null` as "leave unchanged" only if the request field is absent, and treats explicit empty string as "clear the note" (document the chosen semantics in the DTO Javadoc and enforce it in tests).
  - Persists via repository, then returns a fresh `CraDetailsDto` built from the parent CRA + all day entries.
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayUpdateRequestDto.java`
  - Record with `Double workValue` (nullable → "unchanged"), `String note` (nullable → "unchanged"), and a boolean/marker for "clear note" if the semantics chosen require it. Bean-validation annotations for `workValue` bounds are not sufficient (allowed set is discrete), so validation stays inside the entity.
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraDayController.java`
  - `@RestController`, base path `/api/cras/{craId}/days/{date}`.
  - `PATCH` mapping consuming `CraDayUpdateRequestDto`, producing `CraDetailsDto`.
  - `date` parsed as ISO `LocalDate` (`yyyy-MM-dd`).
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java` (or extend an existing `@RestControllerAdvice` if one already exists — check first)
  - `InvalidWorkValueException` → 400 with error body `{ "error": "invalid_work_value", "value": <n> }`.
  - `CraValidatedException` → 409 with `{ "error": "cra_validated" }`.
  - `CraNotFoundException`, `CraDayNotFoundException` → 404 with a discriminated error code.
- `backend/src/main/java/com/timizer/backend/cra/CraNotFoundException.java`, `CraValidatedException.java`, `CraDayNotFoundException.java` (each a small `RuntimeException`).

**Files to modify**

- `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java`
  - Add package-private (or public if the service is in a different package — it is) method `public void updateWorkValue(double workValue)` that reuses the existing `isAllowedWorkValue` check and throws `InvalidWorkValueException` on rejection, otherwise assigns the field. Do **not** introduce a public setter that bypasses validation.
  - Do not touch persistence mapping, unique constraints, or existing constructors.
- Nothing else in the existing entity, DTO, service, or PDF packages should change.

**Tests to add**

- `backend/src/test/java/com/timizer/backend/cra/CraDayEntryUpdateWorkValueTest.java` (pure unit) — covers the new `updateWorkValue` method: accepts 0 / 0.5 / 1, rejects other doubles, NaN, Infinity.
- `backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java` (Mockito, no Spring context) — covers:
  - Happy path: updates work value only, updates note only, updates both.
  - `note` semantics: absent field vs. explicit empty string (per the semantics chosen above).
  - Rejects when parent CRA is `VALIDATED` (also for `SIGNED_BY_PROVIDER` if the ticket's intent is "not editable after provider signature" — pick DRAFT-only editable as a conservative default and state it; see Risks).
  - Rejects invalid work values (0.25, 2, -1).
  - Throws `CraNotFoundException` / `CraDayNotFoundException` when respective lookups return empty.
  - Persists via repository exactly once on the success path.
- `backend/src/test/java/com/timizerlike/backend/cra/web/CraDayControllerTest.java` (`@WebMvcTest`) — covers HTTP-level shape:
  - `PATCH /api/cras/{id}/days/{date}` with valid body → 200 + `CraDetailsDto` payload including the updated day.
  - Invalid work value → 400 with the documented error body.
  - Validated CRA → 409.
  - Unknown CRA → 404, unknown day → 404 (different `error` code).
  - Malformed date path → 400.

**Files that must not change** (guard-rail — flag if a change appears necessary)

- `backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java`
- Anything under `backend/src/main/java/com/timizerlike/cra/pdf/**`
- `backend/pom.xml` (no new dependencies expected; Spring Web + Validation should already be present via T009 — verify, and if missing add only the minimum needed).

**Steps for the Coder**

1. Verify the "starting state" assumptions above; if `MonthlyCraReportRepository` is absent from the current base, add the minimal repository interface. Stop and escalate if the entity layout differs.
2. Add the new exception classes and the `updateWorkValue` method on `CraDayEntry` (with its unit test).
3. Add `CraDayEntryRepository`.
4. Add `CraDayUpdateRequestDto`, then `CraDayUpdateService` with its unit tests.
5. Add `CraDayController` and the exception handler (or extend the existing one), then `@WebMvcTest`.
6. Run the whole backend test suite (`mvn test` from `backend/`); all pre-existing tests must still pass.
7. Update no runtime configuration except what is strictly necessary for the endpoint to be picked up (should be automatic via component scan on `com.timizerlike.cra` / `com.timizer.backend.cra`).

## Excluded

- CRA creation (owned by T007), CRA validation flow (T013), CRA history/list (T014), CRA retrieval GET endpoint (T011).
- PDF generation and any change under `com.timizerlike.cra.pdf.**`.
- Frontend calendar, calendar day-click cycle, client signature, provider signature workflow.
- Bulk / multi-day updates in a single call — endpoint updates exactly one `(craId, date)` day.
- Creating a `CraDayEntry` on demand when the CRA has no entry for the requested date. The endpoint updates existing day entries only; day-entry provisioning is assumed to happen at CRA creation time (T007) or in a future ticket if that assumption breaks.
- Reopening a validated CRA (explicitly listed by the ticket as out of scope).
- Authentication, authorization, per-user scoping.
- Audit trail / change history for day updates.
- Cross-cutting error-model refactors: if a `@RestControllerAdvice` already exists, extend it in-place; otherwise add the smallest new one for these exceptions only.
- Renaming or restructuring the existing dual package layout (`com.timizer.backend.cra` entities vs. `com.timizerlike.backend.cra.dto` DTOs). The inconsistency is pre-existing; do not opportunistically fix it in this ticket.

## Acceptance criteria

- `PATCH /api/cras/{craId}/days/{date}` with a body updating only `workValue` returns 200 and the response `CraDetailsDto` reflects the new work value for that date and a recomputed `totalWorkedDays`.
- The same endpoint with a body updating only `note` returns 200 and the response reflects the new note (and preserves the prior work value).
- A request with `workValue = 0.25` (or any value not in `{0, 0.5, 1}`) returns HTTP 400 with an error body identifying `invalid_work_value`; the persisted day is unchanged.
- A request against a CRA whose `status` is `VALIDATED` returns HTTP 409 (or the chosen 4xx code, documented in the handler) with error code `cra_validated`; the persisted day is unchanged.
- A request against an unknown `craId` returns 404 with error code `cra_not_found`; a request against an existing CRA but unknown `date` returns 404 with error code `cra_day_not_found`.
- A malformed `date` path segment returns 400.
- The response payload is `CraDetailsDto`, exposing at minimum: CRA id, month, year, status, `totalWorkedDays`, and the list of day entries including the one just updated. The updated day is unambiguously identifiable in the response.
- New unit tests on `CraDayEntry.updateWorkValue`, `CraDayUpdateService`, and `CraDayController` (`@WebMvcTest`) all pass.
- All pre-existing tests in `backend/src/test/java/**` still pass (`mvn -q -DskipITs=false test` from `backend/`).
- No changes outside the file list in "Included" / "Files to modify"; in particular, no changes under `com.timizerlike.cra.pdf.**` and no signature changes to `CraCreationService`.
- No new runtime dependency added to `backend/pom.xml` unless the Coder documents (in the PR description) why it was unavoidable.
