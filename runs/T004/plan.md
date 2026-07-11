## Objective

Introduce a Spring Data JPA repository for `MonthlyCraReport` so that monthly CRA records — together with their day entries — can be persisted to SQLite, retrieved by identifier or by (month, year), listed for history, and updated. Existing entity behaviour and prior test suites remain intact.

## Included

- Ensure the JPA mapping between `MonthlyCraReport` and its day entries is wired for cascading persistence and retrieval:
  - In `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`, add a `@OneToMany` collection field (e.g. `List<CraDayEntry> dayEntries`) targeting the entity introduced in T003, with `mappedBy = "monthlyCraReport"` (or an owning-side foreign key column, matching the T003 mapping), `cascade = CascadeType.ALL`, `orphanRemoval = true`, and a `FetchType.LAZY` fetch strategy.
  - Provide a small API on `MonthlyCraReport` to attach / detach day entries (`addDayEntry(CraDayEntry)`, `removeDayEntry(CraDayEntry)`) that keeps both sides of the association consistent. No behavioural change beyond wiring.
  - If T003 introduced `CraDayEntry` without a JPA `@Entity` mapping or without a `monthlyCraReport` reference, add the minimal mapping required on that class to make the relationship work (annotations only — no field rename, no validation change, no new business rule).
  - Only touch these two entity files; do not modify unrelated fields, constructors, or validation.
- Create `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`:
  - Interface extending `org.springframework.data.jpa.repository.JpaRepository<MonthlyCraReport, Long>`.
  - Declared query method `Optional<MonthlyCraReport> findByMonthAndYear(int month, int year)`.
  - Declared query method `List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc()` for history listing (most recent period first).
  - No custom `@Query` unless a derived method cannot express the need.
  - Annotate with `@Repository` for clarity (optional under Spring Data but keeps convention consistent with the existing package).
- Add repository-level tests in `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java` using `@DataJpaTest` and `TestEntityManager` (aligned with `MonthlyCraReportPersistenceTest.java`):
  - Save a report (with at least one attached `CraDayEntry`) and assert that both the parent id and the child entries are persisted after flush + clear + reload.
  - `findById` returns the saved report with its day entries populated.
  - `findByMonthAndYear` returns the report for a matching (month, year) and returns `Optional.empty()` when no match.
  - `findAllByOrderByYearDescMonthDesc` returns multiple saved reports ordered by year desc then month desc.
  - Update path: load a report, mutate a mutable field already exposed on the entity (e.g. `setStatus(ValidationStatus.SUBMITTED)`), save, reload, and assert the change persisted and `updatedAt` advanced.
  - Add or remove a day entry on a persisted report and assert the change is reflected after reload (covers `cascade` and `orphanRemoval`).
  - Reuse the existing `spring.jpa.hibernate.ddl-auto=create-drop` `@TestPropertySource` pattern from `MonthlyCraReportPersistenceTest`.
- Do not introduce a service layer, DTOs, mappers, controllers, or new configuration classes. The repository is consumed directly by future tickets.
- Package remains `com.timizer.backend.cra`. No new sub-package.

## Excluded

- REST controllers, HTTP endpoints, request/response DTOs.
- Business service layer, transactional orchestration beyond what Spring Data provides by default.
- PDF generation, expense handling, client signature workflow.
- Frontend / calendar UI changes.
- Authentication, authorization, security configuration.
- Database migration tooling (Flyway/Liquibase) — schema continues to be produced by JPA `ddl-auto` as in existing tests.
- Any change to the `ValidationStatus` enum, to entity validation constraints, or to the `MonthlyCraReport` constructor signature.
- A dedicated `CraDayEntryRepository` — day entries are managed through the aggregate root via cascade in this ticket.
- Query methods beyond the ones listed above (no pagination, no filtering by status, no search).

## Acceptance criteria

- `MonthlyCraReportRepository` exists in `com.timizer.backend.cra`, extends `JpaRepository<MonthlyCraReport, Long>`, and exposes `findByMonthAndYear(int, int)` and `findAllByOrderByYearDescMonthDesc()`.
- A `MonthlyCraReport` with attached `CraDayEntry` instances can be saved and reloaded, with both the parent id and the day entries persisted.
- Loading a report by identifier returns the same entity with its day entries accessible.
- Looking up a report by month and year returns the persisted instance; a lookup with no match returns `Optional.empty()`.
- Listing all reports returns them ordered by year descending, then month descending.
- Reloading a persisted report, mutating an already-exposed field, and saving results in the change being visible on the next load, with `updatedAt` advanced.
- Adding or removing a day entry on a managed report and saving is reflected on reload (cascade insert / orphan removal).
- New repository tests pass under `@DataJpaTest`.
- The pre-existing backend test suite (including `MonthlyCraReportTest` and `MonthlyCraReportPersistenceTest`) still passes with no regression.
- No files outside `backend/src/main/java/com/timizer/backend/cra/` and `backend/src/test/java/com/timizer/backend/cra/` are modified.
