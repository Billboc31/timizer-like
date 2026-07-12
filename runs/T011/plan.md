Plan written to `runs/T011/plan.md`. It specifies:

- **1 new service** (`CraRetrievalService`) with `findById` and `findByMonthAndYear`, both delegating to the existing repository and mapper.
- **1 new controller** (`CraRetrievalController`) exposing `GET /api/cras/{id}` and `GET /api/cras/{year}/{month}` under the modern package, relying on the existing `CraApiExceptionHandler` for 404s.
- **2 test files** (service unit test + `@WebMvcTest` controller slice).
- The legacy `/api/cra/` controller and all existing DTOs/mappers are untouched.
