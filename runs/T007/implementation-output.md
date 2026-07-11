Implementation complete. Summary of what was done on this third attempt:

**Precondition unblocked** — Rebased the branch onto `origin/main`, which now has T002/T003/T004/T005 merged. All 4 dependency files verified present.

**New code (all in `com.timizer.backend.cra.*`)** — 4 production files (service, mapper, controller, request DTO) + 2 test files (service test with 5 cases, `@WebMvcTest` with 6 cases) + 1 test config helper.

**Arbitrated deviations from the plan** — documented in `runs/T007/implementation-output.md`:
- Service placed in `com.timizer.backend.cra` (not `com.timizerlike.backend.cra`) because `MonthlyCraReport`'s constructor is package-private and the plan forbids modifying T002.
- Service renamed `MonthlyCraCreationService` to avoid Spring bean-name collision with a pre-existing, unrelated `CraCreationService` in `com.timizerlike.cra.service`.
- Reused existing `findByMonthAndYear` (plan `plan.md:67` allows).

**Required base fixes** (base was broken on `origin/main`, could not compile):
- `pom.xml`: added `spring-boot-starter-web`, `-data-jpa`, `-validation`, H2.
- `TimizerLikeApplication`: broadened `scanBasePackages` + `@EntityScan` + `@EnableJpaRepositories` so the app context sees the T002/T003/T004 entities/repo and the new T007 controller/service.
- Added `JpaTestConfig` (test-scope `@SpringBootConfiguration`) so `@DataJpaTest` in `com.timizer.backend.cra.*` can bootstrap.
- Added `src/test/resources/application.yml` with `hibernate.globally_quoted_identifiers=true` (H2 rejects T002's `month`/`year` column names as reserved words).
- Widened one T002 test assertion (`isInstanceOfAny(DataIntegrityViolationException, ConstraintViolationException)`) — this test had never actually run before (JPA deps were absent).

**Verification** — `mvn test`: 54/54 green (11 new + 12 pre-existing tests that previously couldn't run + 31 pre-existing green). `mvn package`: success.

Full details, deviation rationale, and acceptance-criteria mapping written to `runs/T007/implementation-output.md`.
