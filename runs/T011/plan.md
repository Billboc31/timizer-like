The plan is written to `runs/T011/plan.md`. It specifies:

- **1 new service** `CraRetrievalService` with `getById` and `getByYearAndMonth`, both using the existing repository and `CraDetailsMapper`.
- **1 new controller** `CraRetrievalController` exposing `GET /api/cras/{id}` and `GET /api/cras/{year}/{month}` in the modern web package, with 404s handled by the existing `CraApiExceptionHandler`.
- **2 new test files** — a Mockito unit test for the service and a `@WebMvcTest` slice for the controller.
- All existing DTOs, mappers, exceptions, and the legacy `/api/cra/` controller are left untouched.
