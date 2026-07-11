## Objective

Introduce a minimal, immutable set of Java DTOs describing monthly CRA data (summary, full details, day entry) and the payload used to create or update a monthly CRA, so that later tickets (repository queries, REST controllers, PDF data model, frontend types) can rely on stable shapes. No REST, persistence, PDF or frontend wiring is done here.

## Included

Assumption (must be validated by reviewer before coding): the backend module is a standard Maven Spring Boot 3 / Java 17+ project rooted at `backend/`. If the Coder finds a different backend layout already in place (from T009 or an earlier ticket), the paths below must be adapted 1‑for‑1 without changing the DTO shapes. If no backend module exists at all, the Coder creates the minimal directory skeleton listed below — nothing else (no `pom.xml`, no `Application.java`, no config).

### New files (Java records, one class per file)

Package: `com.timizerlike.backend.cra.dto`
Root directory: `backend/src/main/java/com/timizerlike/backend/cra/dto/`

1. `CraStatus.java`
   - `public enum CraStatus { DRAFT, VALIDATED }`
   - Kept in the same package to avoid creating a wider domain layer in this ticket.
   - `VALIDATED` chosen (not `SIGNED`) because client signature is explicitly out of scope.

2. `CraDayEntryDto.java`
   - Record fields:
     - `int day` — day of month, 1..31
     - `double worked` — worked fraction for the day (`0.0`, `0.5`, `1.0`); kept as `double` to match the MVP’s half-day granularity without introducing a domain enum.
   - No validation annotations in this ticket (validation belongs with the controller ticket).

3. `CraSummaryDto.java` — for list views
   - Record fields:
     - `Long id`
     - `int month` (1..12)
     - `int year`
     - `double totalWorkedDays`
     - `CraStatus status`
   - No `days` list here (list endpoints must stay lightweight).

4. `CraDetailsDto.java` — for the "open one CRA" view and PDF flow
   - Record fields:
     - `Long id`
     - `int month`
     - `int year`
     - `double totalWorkedDays`
     - `CraStatus status`
     - `List<CraDayEntryDto> days` — the caller is expected to pass an immutable list; the record does not defensively copy in this ticket.

5. `CraCreateOrUpdateRequestDto.java` — request payload
   - Record fields:
     - `int month`
     - `int year`
     - `List<CraDayEntryDto> days`
   - `id`, `status` and `totalWorkedDays` are intentionally absent: creation is driven by `(month, year)`, status transitions live in a dedicated validation ticket (T013), and the total is a computed value (T006).

### Package convention

- All five files live in the same DTO package. No sub-packages (`request/`, `response/`) — the MVP scope is too small to justify the split.
- All DTOs are Java `record` types → immutability, `equals`/`hashCode`/`toString` for free, and no Lombok dependency introduced.
- No Jackson, Bean Validation, OpenAPI or MapStruct annotations are added; those belong with the tickets that actually need them.

### Tests

- New file: `backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java`
- Unit test covers only construction and accessor round-trip for each DTO plus the enum values. Purpose: give the ticket a runnable acceptance signal ("existing tests still pass" + one new test class compiles and runs) without pretending to test behaviour that does not exist yet.
- No mocking, no Spring context, no persistence.

## Excluded

- Any REST controller, `@RestController`, routing or HTTP mapping (T007, T011, T012, T013, T014, T017).
- Any JPA / persistence entity or repository code (T002, T003, T004).
- Total-worked-days computation logic (T006). `totalWorkedDays` here is a passive field only.
- Status transition rules / validation workflow (T013).
- PDF data model and PDF templates (T015, T016).
- Frontend TypeScript types or API client (T010, T018).
- Client signature DTOs (explicitly listed in the ticket).
- Bean Validation annotations (`@NotNull`, `@Min`, …), Jackson customisation, OpenAPI/Swagger annotations.
- Any refactor of files outside `backend/src/main/java/com/timizerlike/backend/cra/dto/` and the one new test file.
- Bootstrapping the Spring Boot application itself (T009). If no `pom.xml` exists yet, the Coder must stop and escalate rather than silently bootstrapping the project inside this ticket.

## Acceptance criteria

- The five files listed above exist under `backend/src/main/java/com/timizerlike/backend/cra/dto/`, each declaring the exact type name and fields listed in the "Included" section.
- `CraSummaryDto`, `CraDetailsDto`, `CraDayEntryDto`, `CraCreateOrUpdateRequestDto` and `CraStatus` are all `public`, in the same package, and contain no logic beyond accessors / enum constants.
- `CraDetailsDto` exposes a `List<CraDayEntryDto> days` field; `CraSummaryDto` does not.
- `CraCreateOrUpdateRequestDto` does not expose `id`, `status`, or `totalWorkedDays`.
- No file outside the DTO package (and the one new test file) is created or modified.
- No new runtime dependency is added to the build file (Lombok, MapStruct, Jackson modules, validation-api, etc.).
- `CraDtoTest` compiles and passes; any pre-existing test suite still passes (`./mvnw test` — or the equivalent already used in the repo — returns success).
- A reviewer can open each DTO and confirm every field listed in the ticket ("month, year, total worked days, status, and day values") appears "where appropriate" and nowhere it should not.
