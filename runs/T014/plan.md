The plan is written to `runs/T014/plan.md`. It specifies four concrete changes:

1. **`CraSummaryDto`** — add `LocalDate validationDate` as 6th record component.
2. **`CraHistoryService`** (new) — `@Transactional(readOnly=true)`, calls the already-existing `findAllByOrderByYearDescMonthDesc()`, delegates totals to `CraTotalCalculationService`, maps status to `CraStatus`.
3. **`CraHistoryController`** (new) — `GET /api/cras` in `com.timizerlike.backend.cra.web`, returns `List<CraSummaryDto>` with HTTP 200.
4. **Two new test classes** following the `@WebMvcTest` / `@MockBean` pattern already used in the project.

No entity, repository, or other DTO changes are required — all infrastructure already exists.
