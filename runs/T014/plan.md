The plan has been written to `runs/T014/plan.md`. Here is what it covers:

**Modified files (2):**
- `CraSummaryDto` — add `validationDate` field (nullable, required by ticket description)
- `CraDetailsMapper` — add `toSummaryDto()` and `toSummaryDtoList()` static methods using the same inline total-calculation pattern as `toDto()`

**New files (4):**
- `CraHistoryService` — fetches via existing `findAllByOrderByYearDescMonthDesc()`, maps via mapper
- `CraHistoryController` — `GET /api/cras`, delegates to service
- `CraHistoryServiceTest` — unit tests with mocked repository
- `CraHistoryControllerTest` — `@WebMvcTest` pattern, tests 200 with array and 200 with empty array

**Key invariants preserved:** repository query already exists, ordering (year desc, month desc) comes for free, existing mapper and exception handler are reused unchanged.
