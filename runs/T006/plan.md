## Objective

Add a Spring service that computes the total number of worked days for a monthly CRA by summing the `workValue` (0, 0.5, or 1) of every `CraDayEntry` associated with the report. The service exposes a single, pure calculation method with no persistence or transport concerns.

## Included

- **`backend/src/main/java/com/timizer/backend/cra/CraTotalCalculationService.java`** — new class annotated with `@org.springframework.stereotype.Service`.
  - Public method: `double calculateTotalWorkedDays(Collection<CraDayEntry> dayEntries)`.
  - Behaviour:
    - Returns `0.0` when `dayEntries` is empty.
    - Rejects `null` (throws `NullPointerException` via `Objects.requireNonNull`) — matches the null-hostile style already used by `CraDayEntry`.
    - Iterates the collection and sums each `getWorkValue()`.
    - Skips `null` elements defensively (throws `IllegalArgumentException` with a clear message).
  - No state, no field, no dependency injection needed. Constructor is the default.
  - Package-private helper constants are unnecessary; `CraDayEntry` already exposes the valid work values.
  - Precision note: values are constrained to `0.0`, `0.5`, `1.0`, each exactly representable in IEEE-754 `double`. A plain `+=` sum is used — `BigDecimal` is not required and would add noise.

- **`backend/src/test/java/com/timizer/backend/cra/CraTotalCalculationServiceTest.java`** — JUnit 5 unit tests (no Spring context, plain `new CraTotalCalculationService()`).
  - `returnsZeroForEmptyCollection`.
  - `sumsFullDaysOnly` — five entries of `1.0` → `5.0`.
  - `sumsHalfDaysOnly` — three entries of `0.5` → `1.5`.
  - `ignoresNonWorkedDays` — five entries of `0.0` and two of `1.0` → `2.0`.
  - `matchesAcceptanceExample` — twenty-one entries of `1.0` and one of `0.5` → `21.5` (exact assertion, `Offset.offset(0.0)` or `assertEquals(21.5, actual)` since inputs are exact).
  - `rejectsNullCollection` — asserts `NullPointerException`.
  - `rejectsNullEntryInCollection` — asserts `IllegalArgumentException`.
  - All entries are built via the existing `CraDayEntry(Long, LocalDate, double, String)` constructor, using distinct dates to remain semantically valid (though uniqueness is not required by the service itself).

## Excluded

- REST controller, DTO, or endpoint exposing the total (belongs to a later API ticket).
- Persistence, JPA queries, or repository changes; the service consumes an in-memory `Collection<CraDayEntry>` supplied by the caller.
- Any change to `CraDayEntry`, `MonthlyCraReport`, `MonthlyCraReportRepository`, or database schema.
- PDF generation and frontend total display.
- Filtering by month, weekend detection, or client signature handling.
- Locale-aware number formatting; the service returns a raw `double`.
- Rebasing or merging code from prerequisite tickets (T002/T003/T004) into the T006 branch — assumed to be handled by the workflow’s integration step, not by this plan.

**Assumption (explicit):** `com.timizer.backend.cra.CraDayEntry` (introduced by T003) is present on the branch when this ticket is implemented; the Coder must not re-create it. If it is absent at implementation time, the workflow’s conflict-resolver / integration step must reconcile before the Coder starts.

## Acceptance criteria

- `CraTotalCalculationService.calculateTotalWorkedDays` returns `21.5` when given twenty-one entries with `workValue = 1.0` and one entry with `workValue = 0.5`.
- The method returns `0.0` for an empty collection.
- Half-day entries (`0.5`) contribute exactly `0.5` each to the total.
- Non-worked entries (`0.0`) do not change the total.
- Passing `null` as the collection triggers `NullPointerException`; a `null` element inside the collection triggers `IllegalArgumentException`.
- All new tests in `CraTotalCalculationServiceTest` pass under `mvn test`.
- No pre-existing test in `backend/src/test/**` is modified or fails.
- No file outside `backend/src/main/java/com/timizer/backend/cra/CraTotalCalculationService.java` and `backend/src/test/java/com/timizer/backend/cra/CraTotalCalculationServiceTest.java` is added or changed.
