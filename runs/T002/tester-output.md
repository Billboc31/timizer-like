# T002 — Tester Report

**Decision: VALIDATION_BLOCKED — tests not executed**

Static verification of the code shows the implementation matches every acceptance criterion, but the "Existing tests still pass" criterion cannot be confirmed on this branch: the T002 base has no build tooling and the host has no JDK, so `./mvnw test` is impossible here. This blocker is a workflow/orchestration concern (T009 skeleton not yet merged into T002's base), not an implementation defect — but until the tests actually run green the ticket cannot be validated as-is.

## Commands executed

| # | Command | Result |
|---|---------|--------|
| 1 | `find backend -type f` | Only source and test `.java` files. **No `pom.xml`, no `mvnw`, no `.mvn/`.** |
| 2 | `ls backend/pom.xml backend/mvnw` | Both files missing (`No such file or directory`). |
| 3 | `command -v mvn / gradle / mvnw` | All not found. |
| 4 | `java -version` / `javac -version` | `Unable to locate a Java Runtime.` — no JDK on the host. |
| 5 | `find /Users/pierrebocquet/runtime/timizer-like -maxdepth 4 -name pom.xml` | `pom.xml` exists under `worktrees/T009/backend/pom.xml`, confirming the Maven skeleton belongs to T009 and is not present on this branch. |

## Static verification against acceptance criteria

Read files under review:
- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`
- `backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java`
- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportTest.java`
- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportPersistenceTest.java`

| # | Acceptance criterion | Status | Evidence |
|---|---------------------|--------|----------|
| 1 | CRA monthly report entity exists | **PASS (static)** | `MonthlyCraReport.java:23` — `@Entity` + `@Table(name = "monthly_cra_report", …)`. |
| 2 | Month and year are represented explicitly | **PASS (static)** | Two distinct integer columns: `int month` at `MonthlyCraReport.java:37-40` (`@Min(1) @Max(12)`) and `int year` at `MonthlyCraReport.java:42-44` (`@Min(2000)`). Not a merged `LocalDate`/`YearMonth`. |
| 3 | Provider and client metadata can be stored | **PASS (static)** | Provider: `providerFirstName`, `providerLastName`, `providerCompany` (`MonthlyCraReport.java:46-56`). Client: `clientFirstName`, `clientLastName`, `clientCompany`, `clientContactEmail` (`@Email`), `clientContactPhone` (nullable) (`MonthlyCraReport.java:58-76`). |
| 4 | Validation status can be stored | **PASS (static)** | `ValidationStatus status` at `MonthlyCraReport.java:78-81`, `@Enumerated(EnumType.STRING)`, non-null, defaulted to `DRAFT`. Enum defined in `ValidationStatus.java` with `DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`. |
| 5 | Duplicate monthly CRA records are prevented or clearly constrained | **PASS (static)** | Class-level `@UniqueConstraint(name = "uk_monthly_cra_report_period", columnNames = {"month", "year"})` at `MonthlyCraReport.java:26-29`. `MonthlyCraReportPersistenceTest.duplicateMonthAndYearIsRejected` asserts `DataIntegrityViolationException`. |
| 6 | Existing tests still pass | **BLOCKED — cannot execute** | No `pom.xml` / `mvnw` on the T002 base branch; no JDK on host. Neither the pre-existing tests (T009's `HealthController` test, per plan §Acceptance) nor the new `cra/*Test.java` files can be compiled or executed on this branch. |

Additional entity requirements from the ticket description, also verified by inspection:
- Provider signature date — `LocalDate providerSignatureDate`, nullable, at `MonthlyCraReport.java:83-84`. **OK**
- Timestamps — `createdAt` (non-null, `updatable = false`) and `updatedAt` (non-null) set via `@PrePersist` / `@PreUpdate` at `MonthlyCraReport.java:86-90, 120-133`. **OK**

## Anomalies

**Blocking (workflow-level, not implementation-level):**

- **Tests cannot be executed on this branch.** T002 was cut from `main`, which does not contain T009's Spring Boot skeleton (`pom.xml`, Maven wrapper, dependencies). This is documented in `plan.md §Assumptions` and re-stated in `implementation-output.md §Known limits`. Consequences:
  - The new `MonthlyCraReport*.java` files reference `jakarta.persistence.*`, `jakarta.validation.*`, `org.springframework.boot.test.autoconfigure.orm.jpa.*`, `org.springframework.dao.DataIntegrityViolationException` — none of which resolve without the T009 dependency set (`spring-boot-starter-data-jpa`, `spring-boot-starter-test`, `spring-boot-starter-validation`, a runtime DB driver).
  - `@DataJpaTest` needs a Spring Boot main class on the classpath; the plan notes T009 provides `TimizerBackendApplication.java`, but on the T002 branch it is **not present** (`find backend -type f` returns only the four `cra/*.java` files). Once T002 is rebased on top of T009, the default component scan should pick up `com.timizer.backend.cra`, but this cannot be confirmed here.
  - The plan authorised, if needed, adding `spring-boot-starter-validation` to `backend/pom.xml`. On this branch there is no `pom.xml` at all, so that authorisation is moot until rebase.

**Non-blocking observations (informational, no fix requested — all within plan scope):**

- `MonthlyCraReportTest.preUpdateRefreshesOnlyUpdatedAt` relies on `Thread.sleep(5)` and `Instant.now()` monotonicity. On a very fast/coarse-clock system this could produce equal instants and turn flaky (`isAfter` would fail). It is unlikely on macOS/Linux CI, but worth noting.
- The full constructor is package-private, which is fine for the tests in the same package. Any consumer outside `com.timizer.backend.cra` would need a factory or DTO — but that is out of T002 scope (T005/T006).
- No test explicitly asserts the presence of the unique-constraint **name** `uk_monthly_cra_report_period`. The behavioural test (`duplicateMonthAndYearIsRejected`) covers the semantic requirement, which is what the acceptance criterion asks for; the named-constraint check is a nice-to-have.

## Regressions observed

None detectable by static review. Behavioural regression check against T009's `HealthController` test (mentioned in the plan) is blocked for the same reason as criterion #6.

## Decision

- **Static implementation review:** all six acceptance criteria are satisfied at the source level.
- **Execution-level validation:** blocked. Criterion #6 ("Existing tests still pass") is unverified.
- **Recommendation:** do not mark the ticket as fully validated until T002 is rebased on top of a base containing T009's backend skeleton and `./mvnw test` (executed from `backend/`) reports **BUILD SUCCESS** with both the new `cra` tests and pre-existing tests green. Once that rebase happens, no code change is expected in this ticket's scope; the test run itself is the missing artifact.

## Reproducibility

To reproduce the blocker on any host:
```
cd worktrees/T002/backend
ls pom.xml mvnw            # both should be missing on this branch
```

To perform the actual validation once T002 is rebased on top of T009:
```
cd backend
./mvnw -q -DskipITs=false test
```
Expected: `BUILD SUCCESS`, all tests in `com.timizer.backend.cra.MonthlyCraReport*Test` green, `HealthControllerTest` (from T009) still green.
