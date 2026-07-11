## Objective

Add two read-only GET endpoints to the Spring Boot backend so the frontend can load an existing CRA by its database id or by month and year. Missing records return a structured 404 response.

## Included

**New file** — `backend/src/main/java/com/timizer/backend/cra/CraNotFoundException.java`
- `RuntimeException` subclass with no extra state, used to signal a missing CRA.

**New file** — `backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java`
- `@RestControllerAdvice` that catches `CraNotFoundException` and returns HTTP 404 with body `{"error": "cra_not_found"}`.

**Modify** — `backend/src/main/java/com/timizer/backend/cra/api/CraController.java`
- Inject `MonthlyCraReportRepository` and use the existing static `CraDetailsMapper.toDto()`.
- Add `GET /api/cra/{id}`: call `repository.findById(id)`, throw `CraNotFoundException` if absent, return `CraDetailsDto`.
- Add `GET /api/cra/{year}/{month}`: call `repository.findByMonthAndYear(month, year)`, throw `CraNotFoundException` if absent, return `CraDetailsDto`.
- Return type is `CraDetailsDto` directly (no `ResponseEntity` wrapper; 200 implicit on success).

**Modify** — `backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java`
- `@MockBean` for `MonthlyCraReportRepository`; mapper is static so no bean needed.
- Add `GET /api/cra/42` → 200 with expected JSON fields (id, month, year, totalWorkedDays, status, days).
- Add `GET /api/cra/999` (not found) → 404 with `{"error":"cra_not_found"}`.
- Add `GET /api/cra/2025/3` → 200 with expected JSON fields.
- Add `GET /api/cra/2025/3` (not found) → 404 with `{"error":"cra_not_found"}`.

**No new DTO** — `CraDetailsDto` (id, month, year, totalWorkedDays, status, days) already satisfies the response contract.

## Excluded

- CRA creation (already in `POST /api/cra`, unchanged).
- Day entry update endpoint (T012).
- PDF generation, frontend UI, authentication, client signature.
- Pagination or filtering beyond the two lookup modes.

## Acceptance criteria

- `GET /api/cra/{id}` returns HTTP 200 with `id`, `month`, `year`, `totalWorkedDays`, `status`, and a non-null `days` array when the record exists.
- `GET /api/cra/{year}/{month}` returns HTTP 200 with the same body shape when the record exists.
- Both endpoints return HTTP 404 with `{"error":"cra_not_found"}` when no matching record exists.
- `POST /api/cra` behaviour is unchanged (existing tests still pass).
- All existing backend tests pass without modification.
