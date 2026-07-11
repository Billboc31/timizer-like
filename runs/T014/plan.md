The plan has been written to `runs/T014/plan.md`. It covers:

- **`CraSummaryDto`** — add `LocalDate validationDate` (6th component) and update its existing round-trip test
- **`CraHistoryService`** (new) — `@Transactional(readOnly=true)` service that calls the already-declared `findAllByOrderByYearDescMonthDesc()`, computes totals via `CraTotalCalculationService`, and maps status via `CraDetailsMapper.mapStatus()`
- **`CraHistoryController`** (new) — `GET /api/cras` returning `List<CraSummaryDto>` with HTTP 200
- **`CraHistoryServiceTest`** and **`CraHistoryControllerTest`** (both new) following the `@WebMvcTest`/`@MockBean` pattern already used in the project

No entity, repository, or other existing DTO changes are required.
