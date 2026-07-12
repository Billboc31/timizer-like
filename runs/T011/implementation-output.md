All changes are committed. Here's a summary of what was done:

**Deleted (20 files):**
- 4 out-of-scope controllers: `CraDayController`, `CraValidationController`, `CraHistoryController` + their DTO `ValidateCraRequestDto`
- 4 out-of-scope services: `CraDayUpdateService`, `CraValidationService`, `CraHistoryService`, `MonthlyCraCreationService`
- 2 out-of-scope repositories: `CraDayEntryRepository`
- 4 out-of-scope DTOs: `CraDayUpdateRequestDto`, `CraCreateOrUpdateRequestDto`, `CraSummaryDto`, `CreateCraRequest`
- 7 corresponding test files

**Modified (4 files):**
- `CraController.java` — now exposes only `GET /api/cra/{id}` and `GET /api/cra/{year}/{month}`
- `CraNotFoundException.java` — added `CraNotFoundException(int year, int month)` constructor to replace the previous `null` pass
- `CraControllerTest.java` — trimmed to the 4 GET-related tests only
- `CraDtoTest.java` — removed tests for the two deleted DTOs

**Result:** 63 tests, 0 failures.
