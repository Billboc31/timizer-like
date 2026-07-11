# Tester Report — T004 (Create CRA repository) — attempt 1

## Decision

**VALIDATED WITH LIMITATION** — All acceptance criteria are covered by dedicated tests and the code compiles cleanly against Spring Data JPA 3.3.5 / Jakarta Persistence 3.1 / JUnit 5 / AssertJ / Spring Boot Test 3.3.5. Runtime execution of the `@DataJpaTest` suite (`./mvnw test`) is not possible on the isolated T004 branch and must be re-run once T002 (`ValidationStatus`), T003 (`CraDayEntry` invariants), and T009 (`backend/pom.xml`) are merged in.

## Scope of validation

- Branch: `ticket/T004-create-cra-repository` (HEAD `30c26e1`).
- Ticket: `runs/T004/ticket.md` (source: GitHub Issue #7).
- Plan: `runs/T004/plan.md` (approved).
- Implementation output: `runs/T004/implementation-output.md`.
- Files under test (all under `com.timizer.backend.cra`):
  - `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`
  - `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java`
  - `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`
  - `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java`

## Commands executed

Since `backend/` on this ticket branch contains only Java sources (no `pom.xml`, no `mvnw`, no `ValidationStatus` from T002), test execution was performed indirectly:

1. Copied the 4 T004 files into a temp workspace `/tmp/t004-testcompile/`.
2. Added a minimal `ValidationStatus` stub (`DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`) matching the values documented in `runs/T004/implementation-output.md` — needed only to make `javac` resolve the enum references coming from T002.
3. Assembled a classpath from the local Maven cache (`~/.m2/repository`):
   - `jakarta.persistence-api:3.1.0`
   - `jakarta.validation-api:3.0.2`
   - `spring-data-jpa:3.3.5`
   - `spring-data-commons:3.3.5`
   - `spring-context:6.1.14`, `spring-beans:6.1.14`, `spring-test:6.1.14`
   - `junit-jupiter-api:5.10.5`
   - `assertj-core:3.25.3`
   - `spring-boot-test:3.3.5`, `spring-boot-test-autoconfigure:3.3.5`
4. `javac -d out-main -cp <classpath> src/com/timizer/backend/cra/*.java` → **exit 0, no diagnostics**.
5. `javac -d out-test -cp <classpath>:out-main test/com/timizer/backend/cra/*.java` → **exit 0** (only 2 benign `unknown enum constant Status.STABLE` warnings coming from `apiguardian-api` missing docs — no functional impact).
6. Cleaned up `/tmp/t004-testcompile/`.

Full `@DataJpaTest` runtime execution (Hibernate schema bootstrap, `TestEntityManager`, transactional isolation) was **not** performed — see the "Blocking limitation" section below.

## Results — Acceptance criteria coverage

| # | Ticket acceptance criterion | Test / mechanism | Status |
|---|---|---|---|
| 1 | CRA records can be saved | `savesReportWithDayEntriesAndAssignsIdentifiers` (repository.save + flush + reload asserts non-null id and 2 persisted `CraDayEntry` children) | PASS (static) |
| 2 | CRA records can be retrieved by identifier | `findByIdReturnsReportWithDayEntries` (findById returns Optional present with day-entry dates matching) | PASS (static) |
| 3 | CRA records can be retrieved by month and year | `findByMonthAndYearReturnsMatchingReport` + `findByMonthAndYearReturnsEmptyWhenNoMatch` (both match and `Optional.empty` paths covered) | PASS (static) |
| 4 | CRA records can be listed for history display | `findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder` (year desc then month desc across 3 reports) | PASS (static) |
| 5 | CRA records can be updated | `updatingReportPersistsChangeAndAdvancesUpdatedAt` (status change persists + `updatedAt` strictly advances after `Thread.sleep(10)`) | PASS (static) |
| 6 | Existing tests still pass | Diff is strictly scoped to `com.timizer.backend.cra`. `MonthlyCraReport` T002 fields, constructor, validation, `@PrePersist`/`@PreUpdate` callbacks are untouched. T002 `MonthlyCraReportPersistenceTest` and `MonthlyCraReportTest` are not present on this ticket branch and therefore cannot be re-executed here. | PASS (structural) / UNVERIFIED at runtime |

Extra coverage beyond the ticket criteria (from the plan): cascade insert (`addingDayEntryToPersistedReportIsCascadedOnSave`) and orphan removal (`removingDayEntryFromPersistedReportTriggersOrphanRemoval`) — both statically PASS.

## Static / semantic checks performed

- `MonthlyCraReportRepository` extends `JpaRepository<MonthlyCraReport, Long>`, exposes `Optional<MonthlyCraReport> findByMonthAndYear(int, int)` and `List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc()` as declared derived queries. Method names match Spring Data JPA parsing rules — `findByMonthAndYear` → `WHERE month = ?1 AND year = ?2`; `findAllByOrderByYearDescMonthDesc` → `ORDER BY year DESC, month DESC`.
- `@OneToMany(mappedBy = "monthlyCraReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)` on `MonthlyCraReport.dayEntries` — matches the mapping expected by `CraDayEntry.monthlyCraReport` (`@ManyToOne(fetch = LAZY, optional = false)`), both directions consistent.
- `addDayEntry` / `removeDayEntry` maintain the bidirectional invariant (both sides updated, null-safe, package-private setter on the child to prevent bypass).
- `@DataJpaTest` + `TestEntityManager` + `@TestPropertySource("spring.jpa.hibernate.ddl-auto=create-drop")` — same pattern as the T002 `MonthlyCraReportPersistenceTest`, per plan.
- Scope check (`git diff --stat main..HEAD` intent): only `backend/src/*/java/com/timizer/backend/cra/*.java` + `runs/T004/*` are touched — matches "No files outside `backend/src/main/java/com/timizer/backend/cra/` and `backend/src/test/java/com/timizer/backend/cra/` are modified" in the plan.

## Anomalies detected

None on the T004 delta itself.

Non-blocking observations (already flagged by the reviewer):

- `updatingReportPersistsChangeAndAdvancesUpdatedAt` relies on `Thread.sleep(10)` for `updatedAt` monotonicity. Sufficient on JVM with millisecond `Instant.now()` resolution but slightly flaky under heavy CI contention. Not blocking.
- `getDayEntries()` returns the live mutable `ArrayList`. A future caller that mutates directly (rather than through `addDayEntry`/`removeDayEntry`) would break the bidirectional invariant. Out of scope for T004 (existing Java pattern) — flag for a later ticket if it matters.

## Blocking limitation on runtime execution

The T004 ticket branch was cut from `main` and does **not** contain:

- `backend/pom.xml` (owned by T009) → no Maven build possible, no `./mvnw test`.
- `com.timizer.backend.cra.ValidationStatus` (owned by T002) → `MonthlyCraReport.java` and `MonthlyCraReportRepositoryTest.java` reference `ValidationStatus.DRAFT` and `ValidationStatus.SIGNED_BY_PROVIDER` and will not compile without T002.
- T003's authoritative `CraDayEntry` (unique constraint `(monthly_cra_id, date)`, `WORK_VALUE_NONE/HALF/FULL` validation, `@NotNull date`) → T004's `CraDayEntry` was written in the minimal shape needed by the repository, per plan clause "annotations only". A merge conflict is expected and normal.
- T002's pre-existing `MonthlyCraReportTest` / `MonthlyCraReportPersistenceTest` → cannot re-run the "no regression on existing tests" acceptance criterion at runtime here.

This is the same isolated-ticket-branch limitation as T002 / T005, and is explicitly acknowledged in `runs/T004/implementation-output.md` and `runs/T004/reviews/review-attempt-2.md`.

## Validation

**PASS — pending post-merge runtime confirmation.**

- All 6 ticket acceptance criteria are covered by targeted tests (or by structural code invariants for criterion #6).
- Both the 3 main sources and the test source compile cleanly against the exact Spring Boot 3.3.5 dependency stack. There is no syntactic or type error blocking test execution.
- No scope leakage: only the 4 T004 files are modified, all inside `com.timizer.backend.cra`.

## Follow-up required at merge time (not T004 work)

1. Resolve the whole-file conflict on `MonthlyCraReport.java` between T002 and T004 by keeping the T004 version (which is T002 + the `@OneToMany dayEntries` delta).
2. Reconcile `CraDayEntry` between T003 (invariants, unique constraint, work-value validation) and T004 (`@ManyToOne monthlyCraReport` back-reference). Keep T004's relationship mapping; port T003's constraints on top.
3. Once T002 + T003 + T004 + T009 are all present on the integration branch, run `./mvnw -pl backend test` and confirm:
   - the 8 new tests in `MonthlyCraReportRepositoryTest` all pass;
   - the pre-existing `MonthlyCraReportTest` and `MonthlyCraReportPersistenceTest` still pass with zero regression.
