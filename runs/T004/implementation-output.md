All four files created. Here is the implementation summary.

## Summary of changes

Implemented the T004 `MonthlyCraReportRepository` per the approved plan. The T004 branch was cut from the shared bootstrap commit and, following the same "isolated ticket-branch" convention used by T002/T005, the source files are written to compile once T002 (`MonthlyCraReport` base), T003 (`CraDayEntry`), and T009 (backend Maven skeleton) are integrated on top.

### Files created

- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java` — starts from T002's version and adds only the T004 delta:
  - `@OneToMany(mappedBy = "monthlyCraReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) private List<CraDayEntry> dayEntries`
  - `addDayEntry(...)` / `removeDayEntry(...)` helpers keeping both sides of the association consistent
  - `getDayEntries()` accessor
  - No change to existing fields, constructor, validation, or lifecycle callbacks
- `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java` — minimal JPA-mapped entity holding `id`, `monthlyCraReport` (`@ManyToOne`), `date`, `workValue`, `note`, matching the `mappedBy` on the parent. Fields align with T003's planned shape; per T004 plan, only annotations were added to make persistence work.
- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java` — `@Repository` interface extending `JpaRepository<MonthlyCraReport, Long>`, exposing `findByMonthAndYear(int, int)` and `findAllByOrderByYearDescMonthDesc()` as derived queries (no `@Query`).
- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java` — `@DataJpaTest` + `TestEntityManager` following the T002 `@TestPropertySource("spring.jpa.hibernate.ddl-auto=create-drop")` pattern. Covers: save with day entries, `findById` returns with entries, `findByMonthAndYear` (match + empty), `findAllByOrderByYearDescMonthDesc` ordering, status update + `updatedAt` advance, cascade insert on `addDayEntry`, orphan removal on `removeDayEntry`.

### Verifications performed

- Files placed under the plan-mandated paths in `com.timizer.backend.cra` (main + test); no files outside that package were touched.
- Cross-checked each acceptance criterion in `plan.md` against a corresponding test method.
- Confirmed the plan's example `ValidationStatus.SUBMITTED` does not exist in T002 (values are `DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`) — used `SIGNED_BY_PROVIDER` in the update test.

### Known limits / assumptions

- **Tests not executed on this branch.** T004 was cut from `main`, which does not contain T009's `backend/pom.xml`, T002's base entity, or T003's `CraDayEntry`. There is no Maven wrapper to invoke; `./mvnw test` cannot run here. The code is ready to compile and pass once T002/T003/T009 are integrated (same pattern used explicitly by T002's implementation output).
- **`MonthlyCraReport.java` full copy.** Because the T004 branch cannot start "from" T002's file, this branch contains the full file (T002 content + T004 additions). Merging with T002 will produce a whole-file conflict resolved by keeping the T004 version.
- **`CraDayEntry.java` created here.** T003 has only a plan, no code. The entity is written with T003's planned fields (`date`, `workValue`, `note`) plus the JPA back-reference (`monthlyCraReport`) T004 requires. T003's `monthlyCraId` plain-identifier design is subsumed by the `@ManyToOne`; a merge with T003 will need reconciliation (expected — anticipated by the T004 plan clause allowing minimal JPA mapping).
- No REST controller, service layer, DTO, mapper, `CraDayEntryRepository`, migration tooling, or `pom.xml` change was introduced.
