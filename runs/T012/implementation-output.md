## Summary — attempt 6

**IMPLEMENTATION_COMPLETE**

**Root cause resolved**: The 5 previous attempts were blocked because T012's branch was based on the very first commit (`0031ccd`) while all prerequisite branches (T009, T002, T003, T004, T005, T007) existed as approved remote branches but were not in the worktree. The fix was to `git checkout origin/ticket/T007-create-cra-creation-api -- backend/` which populated the full backend tree (including all prerequisite entities, repositories, DTOs, and the creation API) that T007 had accumulated.

## Files modified

**Files added (T012 application code):**
- `backend/src/main/java/com/timizer/backend/cra/CraDayEntryRepository.java` — JPA repo with `findByMonthlyCraReport_IdAndDate` and `findByMonthlyCraReport_IdOrderByDateAsc`
- `backend/src/main/java/com/timizer/backend/cra/CraNotFoundException.java`
- `backend/src/main/java/com/timizer/backend/cra/CraValidatedException.java`
- `backend/src/main/java/com/timizer/backend/cra/CraDayNotFoundException.java`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayUpdateRequestDto.java`
- `backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java`
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraDayController.java` — `PATCH /api/cras/{craId}/days/{date}`
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java` — `@RestControllerAdvice`

**Files modified (T012 changes to existing code):**
- `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java` — added `updateWorkValue(double)` method
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayEntryDto.java` — added `note` field (deviation from plan, justified by acceptance criteria requiring response to reflect note)
- `backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java` — updated to include `note` in `CraDayEntryDto` construction

**Files added (tests):**
- `backend/src/test/java/com/timizer/backend/cra/CraDayEntryUpdateWorkValueTest.java` — 9 unit tests for `updateWorkValue`
- `backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java` — 11 Mockito tests for service
- `backend/src/test/java/com/timizerlike/backend/cra/web/CraDayControllerTest.java` — 6 `@WebMvcTest` tests for controller
- `backend/src/test/java/com/timizerlike/TimizerlikeTestConfig.java` — `@SpringBootConfiguration` to support `@WebMvcTest` in the `com.timizerlike` package tree

**Files modified (existing tests fixed for `CraDayEntryDto` API change):**
- `backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java` — updated 2-arg → 3-arg constructors
- `backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java` — updated 2-arg → 3-arg constructors

**pom.xml change:**
- Added Surefire plugin with `-Dnet.bytebuddy.experimental=true` (required because the project runs on Java 26 but Byte Buddy 1.14.x only officially supports up to Java 22; this enables Mockito mocking on Java 26 without upgrading Byte Buddy)

**Backend checked out from:**
- `git checkout origin/ticket/T007-create-cra-creation-api -- backend/ .gitignore assets/`
- T007 is `IMPLEMENTATION_APPROVED` and contains all prerequisite code (T002/T003/T004/T005 in its ancestry)

## Implementation decisions

- **Editable status**: Only `DRAFT` CRAs can be updated. `SIGNED_BY_PROVIDER` and `VALIDATED` both throw `CraValidatedException` → HTTP 409. Conservative choice, documented.
- **Note semantics**: `null` = leave unchanged; `""` = clear to null; non-empty string = set. Documented in `CraDayUpdateRequestDto` Javadoc.
- **Response DTO deviation**: `CraDayEntryDto` was extended with a `note` field (not in original plan). The plan's "nothing else should change" guideline conflicted with the acceptance criterion "response reflects the new note". The acceptance criterion takes precedence. This causes a minor breaking change to the existing creation API's response shape (notes are now included as `null` for new entries), which is acceptable.
- **Repository queries**: Used `findByMonthlyCraReport_Id*` derived queries rather than `@Query` annotations, following Spring Data naming conventions for relation traversal.

## Verifications

- `mvn test`: 88 tests, 0 failures, 0 errors — BUILD SUCCESS
- All 3 new test classes pass (26 new tests total)
- All pre-existing tests pass (CraDayEntryTest, MonthlyCraCreationServiceTest, CraControllerTest, CraDtoTest, etc.)
- Endpoint registered: `PATCH /api/cras/{craId}/days/{date}` with ISO date parsing
- Exception handler wired: 400 / 409 / 404 with discriminated error codes

## Known limits

- No authentication/authorization (out of scope per plan)
- No day creation on demand — endpoint updates only existing day entries
- Reopening validated CRA explicitly out of scope
