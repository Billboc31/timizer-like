Plan written to `runs/T011/plan.md`. Summary of what it covers:

- **2 new endpoints** on the existing `CraController`: `GET /api/cra/{id}` and `GET /api/cra?month=&year=`
- **1 new exception class** `CraNotFoundException` annotated `@ResponseStatus(404)` — no global error handler needed
- **No new DTOs** — `CraDetailsDto` already carries id, month, year, status, totalWorkedDays, and day entries
- **4 new controller tests** covering the 200 and 404 paths for both endpoints
- All existing services, mappers, repository methods, and DTOs are untouched
