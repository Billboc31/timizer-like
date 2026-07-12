## Objective

Add two read-only HTTP endpoints to `CraController` so the frontend can load an existing CRA by its database identifier or by month and year. Responses include full monthly metadata, status, total worked days, and all day entries.

## Included

- `backend/src/main/java/com/timizer/backend/cra/api/CraController.java`
  - Add `GET /api/cra/{id}` → returns `CraDetailsDto` (HTTP 200); throws `CraNotFoundException` when absent
  - Add `GET /api/cra/{year}/{month}` → returns `CraDetailsDto` (HTTP 200); throws `CraNotFoundException` when absent
  - Both handlers delegate to `MonthlyCraReportRepository` (`findById` / `findByMonthAndYear`) and map via `CraDetailsMapper`

- `backend/src/main/java/com/timizer/backend/cra/web/CraApiExceptionHandler.java` (or existing handler)
  - Verify `CraNotFoundException` is already mapped to HTTP 404 with body `{"error": "cra_not_found"}`; add the mapping if missing

- `backend/src/test/java/.../CraControllerTest.java`
  - `GET /api/cra/{id}` — happy path: 200 + full `CraDetailsDto`
  - `GET /api/cra/{id}` — not found: 404 + `{"error": "cra_not_found"}`
  - `GET /api/cra/{year}/{month}` — happy path: 200 + full `CraDetailsDto`
  - `GET /api/cra/{year}/{month}` — not found: 404 + `{"error": "cra_not_found"}`

## Excluded

- CRA creation endpoint
- Day entry update endpoint
- CRA list / history endpoint
- PDF generation, frontend UI, authentication, client signature flow
- Any refactor of existing controllers or services

## Acceptance criteria

- `GET /api/cra/{id}` returns HTTP 200 with `id`, `month`, `year`, `status`, `totalWorkedDays`, and full `days` array when CRA exists.
- `GET /api/cra/{year}/{month}` returns HTTP 200 with the same body shape when a CRA for that period exists.
- Both endpoints return HTTP 404 with `{"error": "cra_not_found"}` when the record is absent.
- `./mvnw test` passes with no regressions.
