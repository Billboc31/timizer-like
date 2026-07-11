The plan has been written to `runs/T014/plan.md`. It covers:

- **`CraSummaryDto`** — add nullable `LocalDate validationDate` (6th field), mirroring the pattern already in `CraDetailsDto`
- **`CraHistoryService`** — `@Transactional(readOnly=true)` service calling `findAllByOrderByYearDescMonthDesc()` and mapping to `CraSummaryDto`
- **`CraHistoryController`** — `GET /api/cras` → `List<CraSummaryDto>`, always 200 (empty array when no records)
- **Two new test classes** — `CraHistoryServiceTest` (pure Mockito) and `CraHistoryControllerTest` (`@WebMvcTest`)
- **`CraDtoTest`** update for the new field
