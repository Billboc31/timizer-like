`runs/T014/plan.md` has been written. The plan covers:

- **`CraSummaryDto`** — add nullable `LocalDate validationDate` (6th field), update its existing round-trip test
- **`CraHistoryService`** — new `@Transactional(readOnly = true)` service calling `findAllByOrderByYearDescMonthDesc()` and mapping to `CraSummaryDto` via `CraTotalCalculationService`
- **`CraHistoryController`** — `GET /api/cras` returning `List<CraSummaryDto>`
- **Two new test classes** — `CraHistoryServiceTest` (Mockito) and `CraHistoryControllerTest` (`@WebMvcTest`)
