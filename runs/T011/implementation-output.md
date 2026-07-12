Done. Here's a summary of the fix:

**What was wrong:** Commit `df57fae` deleted 20 files (controllers, services, repository, DTOs, and their tests) that existed on main and were outside T011's scope. It also stripped the POST endpoint from `CraController` and trimmed two test files.

**What was restored:**
- 13 source files: `CraDayController`, `CraValidationController`, `CraHistoryController`, `CraDayUpdateService`, `CraValidationService`, `CraHistoryService`, `MonthlyCraCreationService`, `CraDayEntryRepository`, and 5 DTOs
- 7 test files: all corresponding controller/service tests
- `CraController.java`: POST `/api/cra` endpoint restored, two T011 GET endpoints kept alongside it
- `CraControllerTest.java`: restored to 10 tests (6 POST + 4 GET)
- `CraDtoTest.java`: restored to 6 tests (including `CraSummaryDto` and `CraCreateOrUpdateRequestDto` tests)

**Result:** 110 tests, 0 failures. The two T011 GET endpoints are purely additive and coexist cleanly with all restored code.
