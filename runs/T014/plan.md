The plan has been written to `runs/T014/plan.md`. It covers:

- **2 new files**: `CraHistoryService` (fetches and delegates mapping) and `CraSummaryMapper` (static utility mirroring `CraDetailsMapper` pattern)
- **2 modified files**: `CraController` (adds `GET /api/cra`) and `CraControllerTest` (adds GET coverage)
- **No new DTOs** — `CraSummaryDto` and `CraStatus` already exist and match the requirements exactly
- The repository method `findAllByOrderByYearDescMonthDesc()` is already in place, so ordering comes for free
