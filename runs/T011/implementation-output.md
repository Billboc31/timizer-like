Implementation complete. Here's a summary:

## Files created / modified

| File | Action |
|---|---|
| `backend/src/main/java/com/timizer/backend/cra/CraNotFoundException.java` | **New** — `RuntimeException` subclass for missing CRA records |
| `backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java` | **New** — `@RestControllerAdvice` mapping `CraNotFoundException` → HTTP 404 `{"error":"cra_not_found"}` |
| `backend/src/main/java/com/timizer/backend/cra/api/CraController.java` | **Modified** — injected `MonthlyCraReportRepository`, added `GET /api/cra/{id}` and `GET /api/cra/{year}/{month}` |
| `backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java` | **Modified** — added `@MockBean` for repository and 4 new test cases (200 + 404 for each endpoint) |
| `backend/pom.xml` | **Modified** — added Surefire plugin `argLine` for `net.bytebuddy.experimental=true` (Java 26 compatibility) |

All 65 tests pass, including the 4 new test cases and all pre-existing tests.
