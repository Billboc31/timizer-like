The plan is written to `runs/T011/plan.md`. It specifies:

- **2 new GET endpoints** in the existing `CraController`: `GET /api/cra/{id}` and `GET /api/cra/month?month=&year=`
- **1 new exception class** `CraNotFoundException` with `@ResponseStatus(NOT_FOUND)` — no `@ControllerAdvice` needed
- **No new DTOs or repository methods** — `CraDetailsDto` and `findById`/`findByMonthAndYear` are already in place
- **4 new tests** added to the existing `CraControllerTest` covering 200 and 404 cases for both endpoints
