Plan written to `runs/T011/plan.md`. It covers:

- **2 new GET endpoints** on the existing `CraController`: `GET /api/cra/{id}` and `GET /api/cra/month?month={m}&year={y}`
- **1 new exception** `CraNotFoundException` with `@ResponseStatus(NOT_FOUND)` — no global handler needed
- **1 new service** `MonthlyCraRetrievalService` wrapping the two repository lookups
- **No new DTOs or repository methods** — `CraDetailsDto` and `findById`/`findByMonthAndYear` already exist
- **Tests** added to the existing `CraControllerTest` and a new `MonthlyCraRetrievalServiceTest`
