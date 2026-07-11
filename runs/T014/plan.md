The plan is written to `runs/T014/plan.md`. It covers:

- **Objective**: `GET /api/cras` returning CRA summaries in reverse-chronological order
- **Included**: three new production files (`CraSummaryDto`, `CraHistoryService`, `CraHistoryController`) and two test classes, reusing the already-existing `findAllByOrderByYearDescMonthDesc()` repository method and `CraTotalCalculationService`
- **Excluded**: creation, edition, PDF, pagination, frontend, client signature
- **Acceptance criteria**: verifiable HTTP/JSON conditions + existing tests must pass
