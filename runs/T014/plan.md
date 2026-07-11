Plan written to `runs/T014/plan.md`. The plan calls for:

- **2 files modified**: `CraSummaryDto` (add `validationDate`) and `CraDetailsMapper` (add `toSummaryDto` static method)
- **2 new production files**: `CraHistoryService` and `CraHistoryController` (`GET /api/cras`)
- **2 new test files**: service unit test and `@WebMvcTest` controller test

The repository method `findAllByOrderByYearDescMonthDesc()` already exists, so no persistence changes are needed.
