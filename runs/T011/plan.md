The plan has been written to `runs/T011/plan.md`. It specifies:

- **New `CraRetrievalService`** — two methods (`getById`, `getByMonthAndYear`) delegating to the existing `MonthlyCraReportRepository` and mapping results through `CraDetailsMapper.toDto`
- **`CraController` additions** — `GET /api/cra/{id}` and `GET /api/cra?month=&year=`, each returning `200` with `CraDetailsDto` or `404`
- **`CraControllerTest` additions** — four new `@MockBean`-driven tests covering happy paths and not-found cases for both endpoints
- No new dependencies or schema changes needed
