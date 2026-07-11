The plan has been written to `runs/T014/plan.md`. It covers:

- **2 modified files**: `CraSummaryDto` (add `validationDate` field), `CraDetailsMapper` (add `toSummaryDto()` method), and `CraDtoTest` (update constructor call for the new 6-arg record).
- **4 new files**: `CraHistoryService`, `CraHistoryController`, `CraHistoryServiceTest`, `CraHistoryControllerTest`.
- The repository query `findAllByOrderByYearDescMonthDesc()` already exists — no repository changes needed.
- Ordering (year DESC, month DESC) comes for free from the existing query.
