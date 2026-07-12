`runs/T011/plan.md` is written. The plan covers:

- **1 new service** `CraRetrievalService` (`com.timizerlike.cra.service`) with `getById` and `getByYearAndMonth`, both `@Transactional(readOnly = true)`, using the existing `MonthlyCraReportRepository` + `CraDayEntryRepository` and assembling `CraDetailsDto` via the same `buildDto` pattern already in `CraDayUpdateService`.
- **1 new controller** `CraRetrievalController` (`com.timizerlike.backend.cra.web`) with `GET /api/cras/{id}` and `GET /api/cras/{year}/{month}`, delegating 404s to the existing `CraApiExceptionHandler`.
- **2 new test files** — a Mockito unit test for the service and a `@WebMvcTest` slice for the controller.
- Everything else (DTOs, repositories, exceptions, legacy controller) is left untouched.
