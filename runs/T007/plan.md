## Objective

Expose a `POST /api/cra` REST endpoint in the Spring Boot backend that creates a `MonthlyCraReport` for a given `(year, month)` and pre-populates one `CraDayEntry` per calendar day of that month, with default work value `1` for weekdays (Mon–Fri) and `0` for weekends (Sat/Sun). A second call for the same `(year, month)` must not create a duplicate: it must return the existing CRA. The endpoint returns the full CRA details.

## Included

### Files to create

- `backend/src/main/java/com/timizerlike/backend/cra/api/CraController.java`
  - `@RestController`, base path `/api/cra`.
  - `POST /` accepting a validated JSON body `{ "year": int, "month": int }`.
  - Returns `CraDetailsDto` (from T005).
  - HTTP `201 Created` when a new CRA is created, HTTP `200 OK` with the existing CRA when one already exists for `(year, month)` (distinguished by status code so the frontend can react unambiguously).
  - Delegates to `CraCreationService`.
- `backend/src/main/java/com/timizerlike/backend/cra/api/CreateCraRequest.java`
  - Simple immutable request record with `@NotNull`, `@Min(2000)`/`@Max(2100)` on `year`, `@Min(1)`/`@Max(12)` on `month`.
- `backend/src/main/java/com/timizerlike/backend/cra/service/CraCreationService.java`
  - Method `CraCreationResult create(int year, int month)` returning a small record `CraCreationResult(CraDetailsDto cra, boolean created)`.
  - Algorithm:
    1. Query `MonthlyCraReportRepository.findByYearAndMonth(year, month)`.
    2. If present → map to `CraDetailsDto` and return `created = false`.
    3. Otherwise, build a new `MonthlyCraReport`, iterate `YearMonth.of(year, month).atDay(1)` through `atEndOfMonth()`, creating one `CraDayEntry` per date with `defaultWorkValue(date)`:
       - `date.getDayOfWeek() == SATURDAY || SUNDAY` → `0`.
       - Otherwise → `1`.
    4. Save via repository, map to `CraDetailsDto`, return `created = true`.
  - Method is `@Transactional`.
- `backend/src/main/java/com/timizerlike/backend/cra/service/CraDetailsMapper.java` (only if a mapper does not already exist in the merged base)
  - Static helper to convert `MonthlyCraReport` + its day entries into `CraDetailsDto` / `CraDayEntryDto`.
- `backend/src/test/java/com/timizerlike/backend/cra/service/CraCreationServiceTest.java`
  - Unit tests with a mocked `MonthlyCraReportRepository`:
    - 28-day month (Feb 2025) → 28 entries with correct defaults.
    - 31-day month (Jan 2025) → 31 entries, weekend defaults are `0`, weekdays are `1`.
    - Leap year February (Feb 2024) → 29 entries.
    - Duplicate call → repository `save` not invoked, existing CRA returned, `created = false`.
- `backend/src/test/java/com/timizerlike/backend/cra/api/CraControllerTest.java`
  - `@WebMvcTest(CraController.class)` with a mocked `CraCreationService`:
    - `POST /api/cra` with valid body and `created = true` → status 201, body matches expected `CraDetailsDto`.
    - Same route with `created = false` → status 200, body matches existing CRA.
    - Invalid body (`month = 13`, missing field, non-integer) → status 400.

### Files to modify

- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java` (from T004)
  - Add (if missing) `Optional<MonthlyCraReport> findByYearAndMonth(int year, int month);`.

### Behavior details

- Weekend rule is fixed: Saturday and Sunday only. Public holidays are treated as weekdays for this ticket (no holiday calendar is loaded).
- Day generation uses `java.time.YearMonth` — no timezone assumption.
- Response payload uses the existing `CraDetailsDto` shape from T005 so the frontend contract is stable.
- Duplicate handling: **existing CRA is returned as-is with HTTP 200**, no update, no error. This satisfies the "rejected or returns the existing CRA clearly" clause while remaining idempotent.

### Implementation steps

1. Confirm the base branch includes T002 (`MonthlyCraReport`), T003 (`CraDayEntry`), T004 (`MonthlyCraReportRepository`), T005 (DTOs). If any are missing, block and escalate — do not re-implement them.
2. Add `findByYearAndMonth` to the repository (Spring Data derived query).
3. Implement `CraCreationService` with the algorithm above.
4. Implement `CraController` + `CreateCraRequest`.
5. Write unit tests for the service.
6. Write `@WebMvcTest` tests for the controller.
7. Run `./mvnw test` locally to confirm all existing + new tests pass.

### Risks

- **Package inconsistency** in the current base: earlier tickets used `com.timizer.backend.cra`, later tickets used `com.timizerlike.backend.cra`. The controller and new code will live under `com.timizerlike.backend.cra` (matches T005 DTOs). If the merged base actually uses only `com.timizer.backend.cra`, the coder must adjust package + imports uniformly — no cross-package split.
- **Missing upstream tickets**: T002–T005 must be merged into the branch base before this ticket is coded, otherwise compilation fails.
- **Repository query name**: if `MonthlyCraReportRepository` already exposes a differently-named lookup (e.g. `findByMonth`), reuse it instead of adding a duplicate.

### Assumptions

- The CRA is scoped to a single provider/user in the MVP — no provider ID in the request (auth is out of scope per the ticket).
- `MonthlyCraReport` owns its `CraDayEntry` list via a JPA cascade defined in T003 — if not, a separate `CraDayEntryRepository.saveAll` will be used inside the service.
- No configurable default rule is required for this ticket; the fixed weekday/weekend rule is sufficient.

## Excluded

- Updating day entry values (T012).
- CRA validation workflow (T013).
- PDF generation (T016, T017).
- Frontend UI (T019–T024).
- Authentication and any per-user scoping.
- Client signature capture.
- Public holiday defaults or any configurable default rule (out of scope; may be added in T026).
- Adding provider/client metadata to the created CRA.
- Bulk creation, listing, deletion, or historical queries (covered by T011, T014).

## Acceptance criteria

- `POST /api/cra` with `{"year": 2025, "month": 3}` returns HTTP 201 and a `CraDetailsDto` whose day entries cover 2025-03-01 through 2025-03-31 (31 entries).
- In the returned CRA, every Saturday and Sunday has default work value `0`; every other day has default work value `1`.
- A second `POST /api/cra` with the same `(year, month)` returns HTTP 200 with the CRA created by the first call — no duplicate row is inserted, and no error is raised.
- February 2024 produces 29 day entries; February 2025 produces 28.
- Invalid input (`month` outside `[1,12]`, `year` outside `[2000,2100]`, missing field, non-numeric value) returns HTTP 400 and no CRA is created.
- The endpoint is reachable through the existing Spring Boot application context (no separate wiring required).
- `./mvnw test` passes: all pre-existing tests still pass, and the new unit + `@WebMvcTest` tests pass.
- No changes are made to files outside `backend/src/main/java/com/timizerlike/backend/cra/…`, `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`, and the corresponding test directories.
