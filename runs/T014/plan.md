`runs/T014/plan.md` is written. The plan covers:

- **`GET /api/cras`** — new controller in `com.timizerlike.backend.cra.web`
- **`CraHistoryItemDto`** — new DTO with `id`, `month`, `year`, `status`, `totalWorkedDays`, `validationDate`
- **`CraHistoryService`** — fetches via `MonthlyCraReportRepository.findAllByOrderByYearDescMonthDesc()`, delegates totals to the existing `CraTotalCalculationService`
- **Repository** — one derived-query method added to `MonthlyCraReportRepository`
- **Tests** — `@WebMvcTest` for the controller + Mockito unit test for the service
- Pagination, auth, PDF, frontend, and CRA mutation are all explicitly excluded
