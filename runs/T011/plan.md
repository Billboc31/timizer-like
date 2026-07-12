The plan has been written to `runs/T011/plan.md`. It specifies:

- **Two GET endpoints** on `CraController`: `GET /api/cra/{id}` and `GET /api/cra/{year}/{month}`
- **Response shape** via the existing `CraDetailsDto` (id, month, year, totalWorkedDays, status, days array)
- **404 handling** via `CraApiExceptionHandler` returning `{"error":"cra_not_found"}`
- **Four `@WebMvcTest` tests** covering found/not-found for each endpoint
- Clear scope exclusions (creation, day update, PDF, auth, frontend)
