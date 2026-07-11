## Objective

Add a `GET /api/cras` endpoint that returns an ordered list of CRA summaries, each carrying the period (month + year), status, total worked days, and validation date when available.

## Included

**`backend/src/main/java/com/timizerlike/backend/cra/dto/CraSummaryDto.java`**
- Add a nullable `LocalDate validationDate` field.
- Hypothesis: `validationDate` maps to `MonthlyCraReport.providerSignatureDate`; if the entity already has a dedicated `validatedAt` field, use that instead.

**`backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java`** *(new)*
- Annotate `@Service`, `@Transactional(readOnly = true)`.
- Inject `MonthlyCraReportRepository` and `CraTotalCalculationService`.
- Single method `List<CraSummaryDto> listHistory()`: call `findAllByOrderByYearDescMonthDesc()`, map each `MonthlyCraReport` to `CraSummaryDto`.

**`backend/src/main/java/com/timizerlike/backend/cra/web/CraHistoryController.java`** *(new)*
- `@RestController`, `@RequestMapping("/api/cras")`.
- `GET /api/cras` → `ResponseEntity<List<CraSummaryDto>>`, always HTTP 200.

**Two new test classes** — `CraHistoryServiceTest` (pure Mockito) and `CraHistoryControllerTest` (`@WebMvcTest`).

**`CraDtoTest`** — extend to cover `validationDate` (null and non-null).

## Excluded

CRA creation/edition/deletion, PDF, frontend, client signature, pagination, auth changes, day-level DTOs/controllers.

## Acceptance criteria

- `GET /api/cras` → HTTP 200, JSON array (never null).
- Each item: `month`, `year`, `status`, `totalWorkedDays`, `validationDate` (ISO date or null).
- Ordered descending by year then month.
- Empty history → `[]`.
- `./mvnw test` passes, new test classes pass.
