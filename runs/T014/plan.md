The plan is written to `runs/T014/plan.md`. It covers:

- **2 modified files**: `CraSummaryDto` (add nullable `validationDate`), `CraDetailsMapper` (add `toSummaryDto()` method)
- **3 new files**: `CraHistoryService`, `CraHistoryController`, `CraHistoryControllerTest`
- Reuses the existing `findAllByOrderByYearDescMonthDesc()` repository method — no repository change needed
- No DB migration required since `validationDate` is already persisted on the entity
