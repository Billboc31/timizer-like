# T003 — Test report (attempt 1)

**Decision: VALIDATED**

## Scope of validation

Verified that the implementation on `ticket/T003-create-cra-day-entry-entity` satisfies the six acceptance criteria of the ticket. Ran the new JUnit 5 suite for `CraDayEntry` against a scratch Maven project (Java 21, Spring Boot 3.3.5 test starter). Also inspected the git diff versus `ai-dev-factory/bootstrap-agent-layout` to confirm the change surface.

## Environment

- OS: darwin 25.5.0
- JDK: OpenJDK 21.0.11 (Homebrew)
- Maven: `./mvnw` wrapper copied from `ticket/T009-bootstrap-spring-boot-backend` (Spring Boot 3.3.5)
- Working directory for the test run: `/tmp/t003-test/backend/` (out-of-tree scratch project, not committed)

## Test execution setup

The T003 branch is a source-only ticket branch: it does not carry a `pom.xml` or Maven wrapper (that comes from T009). To exercise the tests locally, I set up an out-of-tree scratch project:

1. `mkdir -p /tmp/t003-test/backend`
2. Copied `mvnw` and `.mvn/wrapper/maven-wrapper.properties` from `ticket/T009-bootstrap-spring-boot-backend`.
3. Wrote a `pom.xml` inheriting `spring-boot-starter-parent:3.3.5` with the dependencies actually required by T003 sources: `spring-boot-starter-data-jpa` (for `jakarta.persistence.*`), `spring-boot-starter-validation` (for `jakarta.validation.*`), `spring-boot-starter-test`, and `assertj-core`. Note: the current T009 `pom.xml` does **not** include these two starters — this is called out below as a follow-up risk, not a T003 blocker.
4. Copied the three T003 Java files into the matching source paths.

## Commands executed

```bash
cd /tmp/t003-test/backend && JAVA_HOME=/opt/homebrew/opt/openjdk@21 \
  PATH=/opt/homebrew/opt/openjdk@21/bin:$PATH \
  ./mvnw -Dtest=CraDayEntryTest test
```

## Results

```
[INFO] --- surefire:3.2.5:test (default-test) @ timizer-backend-t003-test ---
[INFO] Running com.timizer.backend.cra.CraDayEntryTest
[INFO] Tests run: 16, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 0.173 s
[INFO] BUILD SUCCESS
```

All 16 tests pass (compile + surefire green).

Tests exercised:
- `constructsWithWorkValueZero`, `constructsWithWorkValueHalf`, `constructsWithWorkValueFull`
- `rejectsDisallowedFractionalWorkValue`, `rejectsWorkValueAboveOne`, `rejectsNegativeWorkValue`, `rejectsNaNWorkValue`, `rejectsInfiniteWorkValue`
- `invalidWorkValueExceptionCarriesRejectedValue`
- `acceptsNullNote`, `acceptsEmptyNote`, `preservesProvidedNoteVerbatim`
- `storesMonthlyCraIdLink`, `rejectsNullMonthlyCraId`, `rejectsNullDate`
- `beanValidationAcceptsValidEntry`

## Acceptance criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | CRA day entry entity exists | **PASS** | `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java` present, `@Entity`-annotated. |
| 2 | Each day entry is linked to one monthly CRA | **PASS** | `monthlyCraId: Long` field, `@NotNull`, `nullable=false` column, `Objects.requireNonNull` in constructor. Covered by `storesMonthlyCraIdLink` and `rejectsNullMonthlyCraId`. |
| 3 | Work value supports 0, 0.5, and 1 | **PASS** | Constructor accepts each of `0.0`, `0.5`, `1.0`. Covered by `constructsWithWorkValueZero/Half/Full`. |
| 4 | Notes can be empty | **PASS** | `note` column is nullable; constructor stores `null` and `""` unchanged. Covered by `acceptsNullNote`, `acceptsEmptyNote`, `preservesProvidedNoteVerbatim`. |
| 5 | Invalid work values are rejected or prevented | **PASS** | Any value outside `{0, 0.5, 1}` (including `NaN` and `±∞`) throws `InvalidWorkValueException` at construction time. Covered by `rejectsDisallowedFractionalWorkValue`, `rejectsWorkValueAboveOne`, `rejectsNegativeWorkValue`, `rejectsNaNWorkValue`, `rejectsInfiniteWorkValue`, `invalidWorkValueExceptionCarriesRejectedValue`. |
| 6 | Existing tests still pass | **PASS (vacuous)** | The T003 branch adds the first Java sources of the ticket workflow (no prior tests exist on this branch). No pre-existing test was disturbed; diff shows only the three new domain files under `backend/**/cra/`. |

## Regressions observed

None. `git diff --name-only ai-dev-factory/bootstrap-agent-layout...HEAD` shows only additions under `backend/src/main/java/com/timizer/backend/cra/`, `backend/src/test/java/com/timizer/backend/cra/`, and the expected workflow artifacts under `runs/T003/`. No files outside the domain layer are modified.

## Blocking issues

None.

## Non-blocking observations

- **Reviewer already flagged (still valid):** `@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"monthly_cra_id", "date"}))` implements a "per-day uniqueness within a month" rule that the plan explicitly listed under *Excluded*. It has no runtime impact within T003 (no repository, no schema, no persistence test), but it is a small scope drift. Fixing it is a future concern — not a test blocker.
- **Workflow dependency (informational):** running these tests inside the mainline repo will require, at merge time, that the backend `pom.xml` (owned by T009) declares `spring-boot-starter-data-jpa` and `spring-boot-starter-validation`. The current T009 `pom.xml` on `ticket/T009-bootstrap-spring-boot-backend` declares only `spring-boot-starter-web` and `-actuator`. Either T009's pom should be extended, or a later ticket must add these starters, otherwise the T003 sources will not compile against a stock T009 base. Recorded here so it is not lost at integration time.

## Limits of validation

- Tests were run against an out-of-tree scratch pom I authored, not against the eventual mainline `pom.xml`. If the mainline pom ends up on a different Spring Boot / Jakarta version, results may differ marginally (but the code uses only stable core JPA + Bean Validation API).
- No persistence-layer test was run (out of scope for T003); the `@Entity`/`@Table`/`@UniqueConstraint` metadata is validated only structurally, not against a real database.

## Verdict

Implementation satisfies all six acceptance criteria of T003 with a fully green 16-test JUnit suite. **VALIDATED.**
