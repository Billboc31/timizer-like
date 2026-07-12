# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T011/reviews/implementation-review.md
- generated at: 2026-07-12T07:09:49Z

---

I have all the information I need. Let me now write the full review.

---

## Review — T011: Create CRA retrieval API

### Summary

The two required GET endpoints are correctly implemented, the response contract matches the ticket, and the new CraControllerTest (4 tests) passes. However, the implementation contains a **scope violation that must be fixed**: it deleted several working controllers and services that existed on main and were explicitly outside T011's scope.

---

### 1. Correctness relative to ticket requirements

**PASS** — All acceptance criteria are met:

| Criterion | Status |
|---|---|
| GET /api/cra/{id} returns 200 + full DTO | ✓ |
| GET /api/cra/{year}/{month} returns 200 + full DTO | ✓ |
| Response includes all day entries | ✓ (`CraDetailsDto.days`) |
| Response includes total worked days | ✓ (`CraDetailsDto.totalWorkedDays`) |
| Missing CRA returns clear 404 | ✓ (`{"error": "cra_not_found"}`) |
| Existing tests still pass | ✓ (63/63, 0 failures) |

The controller implementation (`CraController.java:23-35`) is clean and idiomatic:
- Correct use of `Optional.orElseThrow()` with `CraNotFoundException`
- Correct path parameter order: `/{year}/{month}` mapped to `findByMonthAndYear(month, year)` — note the intentional swap, matching the repository method signature
- `CraDetailsMapper` correctly accumulates `totalWorkedDays` as a `double` loop sum (acceptable for ≤31 entries)
- `CraNotFoundException` has two constructors for id vs. year/month (line 5 and 9)

---

### 2. Scope compliance — BLOCKING VIOLATION

The plan (`runs/T011/plan.md:27`) explicitly lists in the **Excluded** section:

> Any refactor of existing controllers or services

The implementation deleted the following **working, tested code that existed on main**:

| Deleted file | Was it working? |
|---|---|
| `CraDayController.java` | Yes — `@PatchMapping` with real service injection |
| `CraValidationController.java` | Yes — tested in `CraValidationControllerTest` |
| `MonthlyCraCreationService.java` | Yes — tested in `MonthlyCraCreationServiceTest` |
| `CraDayUpdateService.java` | Yes — tested in `CraDayUpdateServiceTest` |
| `CraValidationService.java` | Yes — tested in `CraValidationServiceTest` |
| `CraDayEntryRepository.java` | Yes — used by `CraDayUpdateService` |

The commit message `fix(T011): remove out-of-scope endpoints and trim CraController to GET-only` (df57fae) reveals that the coder intentionally removed these — but this deletion is itself out of scope and not authorized by the ticket or the plan.

The original `CraController` on main had a `POST /api/cra` endpoint for creation. T011 says creation is "Out of Scope," but that means *don't add creation if it isn't there* — not *delete the creation endpoint that already exists*. The deletion removes a working feature.

**This must be fixed**: restore all deleted controllers, services, and the repository to their state on main. T011 should only have added two GET handlers to `CraController` — additive, not destructive.

---

### 3. Secondary observation — dead exception handlers

`CraApiExceptionHandler` (unchanged from main) still declares handlers for `InvalidWorkValueException`, `CraValidatedException`, and `CraDayNotFoundException`. With `CraDayController` and `CraValidationController` deleted, nothing in the codebase can currently throw these exceptions, making those handlers dead code. This is a consequence of the scope violation above and will be resolved when the deleted controllers are restored.

---

### 4. Code quality

The code that was added (CraController, CraNotFoundException constructors, CraControllerTest) is clean:
- No magic, no hidden behavior
- Follows Spring REST conventions
- Test covers both happy-path and not-found for both endpoints
- No hardcoded secrets, no dangerous patterns

No issues here.

---

### 5. Fix required

Restore the following files to their state on `ai-dev-factory/bootstrap-agent-layout`:

- `backend/src/main/java/com/timizerlike/backend/cra/web/CraDayController.java`
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraValidationController.java`
- `backend/src/main/java/com/timizerlike/backend/cra/web/ValidateCraRequestDto.java`
- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraCreationService.java`
- `backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java`
- `backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java`
- `backend/src/main/java/com/timizer/backend/cra/CraDayEntryRepository.java`
- `backend/src/main/java/com/timizer/backend/cra/api/CreateCraRequest.java`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.java`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayUpdateRequestDto.java`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraSummaryDto.java`
- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraCreationServiceTest.java`
- `backend/src/test/java/com/timizerlike/backend/cra/web/CraDayControllerTest.java`
- `backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java`
- `backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java`
- `backend/src/test/java/com/timizerlike/cra/service/CraValidationServiceTest.java`

Also restore the `POST /api/cra` endpoint in `CraController.java` if it existed on main.

The two GET endpoints added by T011 should coexist with the restored code — they are purely additive.

---

IMPLEMENTATION_FIX_REQUIRED
