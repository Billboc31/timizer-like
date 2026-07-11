Implementation complete. Since the T003 branch is an isolated ticket branch (no `pom.xml` — that comes from T009), I can't compile/run tests locally here; the tests will run when the branches are merged onto a base with the Maven build. This matches the pattern used by the sibling `ticket/T002-*` branch, which also added only its scoped Java files.

## Summary

Added a pure domain entity `CraDayEntry` linked to a monthly CRA by identifier (no ORM relationship wiring), with constructor-time validation restricting the work value to `{0, 0.5, 1}`. Note field accepts null/empty/arbitrary strings.

## Files created

- `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java` — JPA `@Entity` with fields `id`, `monthlyCraId` (plain `Long` link), `date`, `workValue` (primitive `double`), `note` (nullable). Constructor uses `Objects.requireNonNull` for `monthlyCraId`/`date` and throws `InvalidWorkValueException` for any value outside `{0, 0.5, 1}` (also rejects `NaN`/`Infinity`). Unique constraint on `(monthly_cra_id, date)` at the DB layer.
- `backend/src/main/java/com/timizer/backend/cra/InvalidWorkValueException.java` — dedicated `RuntimeException` carrying the rejected value.
- `backend/src/test/java/com/timizer/backend/cra/CraDayEntryTest.java` — JUnit 5 + AssertJ + Jakarta Validation tests covering every plan requirement.

## Conventions followed (aligned with T002)

- Package `com.timizer.backend.cra`, Maven `src/main/java` / `src/test/java` layout.
- Jakarta Persistence + Bean Validation annotations, JUnit 5 + AssertJ test style, `ValidatorFactory` try-with-resources for Bean Validation checks.
- Protected no-arg constructor for JPA; public value constructor for the domain API.

## Test coverage

- Construction succeeds for each allowed work value (`0`, `0.5`, `1`).
- Construction rejects `0.25`, `2.0`, `-1.0`, `Double.NaN`, `Double.POSITIVE_INFINITY` via `InvalidWorkValueException`.
- `null` and `""` notes accepted; provided note preserved verbatim.
- `monthlyCraId` link stored and readable.
- `null` `monthlyCraId` and `null` `date` rejected with `NullPointerException`.
- Bean Validation returns no violations for a valid entry.
- Exception carries the rejected value and includes it in the message.

## Assumptions & limitations

- Chose `double` primitive for `workValue` because `0`, `0.5`, `1` are exactly representable in IEEE-754 and the plan explicitly mentions `NaN` as an invalid case — no float-comparison drift for the MVP set.
- Followed T002's JPA-annotated entity style; the `@Entity`/`@Table` mapping is metadata only (no repository, migration, or ORM relationship added, per the plan's "no persistence layer changes" constraint).
- Local compile / test-run not executed: the Spring Boot build (`pom.xml`, `mvnw`) lives on `ticket/T009-*`. The Maven build will exercise these tests once branches are merged.
