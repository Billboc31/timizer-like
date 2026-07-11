The T002 worktree branches from `main`, which contains only the AI Dev Factory scaffolding — no backend code, no framework, no tests. The other ticket branches reveal the intended stack: T009 bootstraps Spring Boot at `backend/` under package `com.timizer.backend`. I'll write a plan under that assumption, called out explicitly, since the plan file goes verbatim to `runs/T002/plan.md`.

## Objective
Introduce the `MonthlyCraReport` JPA entity representing one CRA reporting period, with columns for `month`, `year`, provider identity and company, client identity, company and contact info, validation status, provider signature date, and timestamps, plus a table-level uniqueness constraint on `(month, year)` preventing duplicate monthly CRAs for the personal usage context. No repository, DTO, controller, or migration is added.

## Assumptions
- **Stack**: Spring Boot 3.x + Java 21 + Spring Data JPA / Hibernate, as bootstrapped by ticket T009 (`backend/` Maven project, base package `com.timizer.backend`). The current T002 base branch (`main`) does **not** contain this skeleton yet.
  - Consequence: before implementation, T002 must be rebased on top of a base that contains the T009 skeleton (either T009 merged to `main`, or T002 rebased onto `ticket/T009-bootstrap-spring-boot-backend`). The Coder must not re-bootstrap the backend inside T002.
- **Database driver**: whichever driver is configured by T001/T009 (SQLite or otherwise). The entity uses vendor-neutral JPA annotations and portable column types (`INTEGER`, `VARCHAR`, `TIMESTAMP`, `DATE`).
- **Personal usage context** = single-user app. The uniqueness constraint on `(month, year)` is therefore **global to the table** — no `user_id`/tenant column is introduced by this ticket.
- **Schema generation**: left to Hibernate `ddl-auto` as configured by the bootstrap tickets. No Flyway/Liquibase migration is added here.
- **JPA validation**: `spring-boot-starter-validation` is available (standard part of the T009 skeleton). If not, the Coder adds the dependency in `backend/pom.xml`.

## Included
- New package: `backend/src/main/java/com/timizer/backend/cra/`.
- New file `MonthlyCraReport.java` — JPA `@Entity` mapped to table `monthly_cra_report`:
  - `Long id` — `@Id @GeneratedValue(strategy = IDENTITY)`.
  - `int month` — `@Min(1) @Max(12)`, `nullable = false`.
  - `int year` — `@Min(2000)`, `nullable = false`.
  - `String providerFirstName`, `String providerLastName`, `String providerCompany` — all `@NotBlank`, `nullable = false`.
  - `String clientFirstName`, `String clientLastName`, `String clientCompany` — all `@NotBlank`, `nullable = false`.
  - `String clientContactEmail` — `@Email`, `nullable = false`.
  - `String clientContactPhone` — `nullable = true`.
  - `ValidationStatus status` — `@Enumerated(EnumType.STRING)`, `nullable = false`, initialized to `DRAFT`.
  - `LocalDate providerSignatureDate` — `nullable = true`.
  - `Instant createdAt` — `nullable = false, updatable = false`, set in `@PrePersist`.
  - `Instant updatedAt` — `nullable = false`, set in `@PrePersist` and `@PreUpdate`.
  - Class-level: `@Table(name = "monthly_cra_report", uniqueConstraints = @UniqueConstraint(name = "uk_monthly_cra_report_period", columnNames = {"month", "year"}))`.
  - `protected` no-arg constructor for JPA; a package-private full constructor; public getters; setters only for mutable business fields (status, signature date, client/provider contact fields).
- New file `ValidationStatus.java` — enum: `DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`.
- New tests under `backend/src/test/java/com/timizer/backend/cra/`:
  - `MonthlyCraReportTest.java` — plain unit tests: constructor populates required fields; `@PrePersist` sets `createdAt`/`updatedAt`; `@PreUpdate` refreshes `updatedAt`; bean-validation rejects `month = 0` and `month = 13`.
  - `MonthlyCraReportPersistenceTest.java` — `@DataJpaTest`: saving a valid entity assigns an id; saving a second entity with the same `(month, year)` triggers `DataIntegrityViolationException` on `flush()`.
- No changes expected to `TimizerBackendApplication.java` (default component scan already covers the new sub-package).

## Excluded
- Day entries (T003).
- Any repository interface or persistence-layer method (T004).
- DTOs, mappers, request/response models (T005).
- Services, business logic, total calculations (T006 and later).
- REST controllers or endpoints (T007+).
- PDF generation (T015–T017).
- Frontend code (T010, T018+).
- Client signature workflow and any client-side signing fields.
- Database migration tooling (Flyway/Liquibase).
- Bootstrapping the backend project itself — that is T009's scope.
- Introducing a `user_id`/tenant column or any multi-user handling.

## Acceptance criteria
- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java` exists, compiles, and is annotated `@Entity` with `@Table(name = "monthly_cra_report", ...)`.
- `backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java` exists as an enum with at least `DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`.
- `month` and `year` are stored as **two distinct integer columns**, not as a single `LocalDate`/`YearMonth` column.
- Provider identity (first name + last name), provider company, client identity (first name + last name), client company, and client contact email/phone are present as persistent columns.
- A `status` column stores the validation state and defaults to `DRAFT` on new instances.
- `provider_signature_date` column is present and nullable.
- `created_at` and `updated_at` columns are present, non-null, and populated automatically by JPA lifecycle callbacks.
- The generated schema (or the JPA metadata) declares a unique constraint on the pair `(month, year)`; attempting to persist a second row with the same `(month, year)` raises `DataIntegrityViolationException`.
- Running `./mvnw test` from `backend/` completes green, covering both the new `cra` tests and any tests already present from earlier tickets (e.g. T009's `HealthController` test).
- No file outside `backend/src/main/java/com/timizer/backend/cra/`, `backend/src/test/java/com/timizer/backend/cra/`, and — only if strictly required — `backend/pom.xml` (to add `spring-boot-starter-validation`) is modified.
