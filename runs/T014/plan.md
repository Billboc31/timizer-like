Plan written to `runs/T014/plan.md`. It covers:

- **`CraSummaryDto`** — add the missing `validationDate` field the ticket requires
- **`CraSummaryMapper`** (new) — mirrors `CraDetailsMapper`, maps entity → summary DTO
- **`CraHistoryController`** (new) — `GET /api/cras`, injects repository directly (no service layer needed), calls the existing `findAllByOrderByYearDescMonthDesc()` query
- **`CraHistoryControllerTest`** (new) — `@WebMvcTest` pattern, two cases (empty + populated)
