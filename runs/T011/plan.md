The plan is written to `runs/T011/plan.md`. It specifies:

- **2 new GET endpoints**: `GET /api/cras/{id}` (by ID) and `GET /api/cras?month=&year=` (by month/year)
- **1 new service** `CraRetrievalService` with `findById` and `findByMonthAndYear`, both delegating to the existing repository methods already present
- **1 new exception** `CraNotFoundException` annotated `@ResponseStatus(NOT_FOUND)` — no `@ControllerAdvice` needed
- **No new DTOs or repository methods** — `CraDetailsDto` and `findById`/`findByMonthAndYear` are already in place
- **Tests** covering 200, 404, and 400 cases for both endpoints, plus unit tests for the service
