The plan has been written to `runs/T028/plan.md`. Here is what it contains:

---

## Objective

Add `@SpringBootTest` integration tests covering the full CRA backend workflow end-to-end against an H2 in-memory database. Two missing HTTP endpoints — `GET /api/cras` (history listing) and `GET /api/cras/{id}/pdf` (PDF download) — must be created before the tests can exercise them.

## Included

**New production code — 3 files:**

1. `backend/src/main/java/com/timizerlike/backend/cra/web/CraHistoryController.java`
   - `GET /api/cras` → returns `List<CraDetailsDto>` ordered by year desc, month desc

2. `backend/src/main/java/com/timizerlike/backend/cra/web/CraPdfController.java`
   - `GET /api/cras/{craId}/pdf` → `ResponseEntity<byte[]>` with `Content-Type: application/pdf`, 404 if not found

3. `backend/src/main/java/com/timizerlike/cra/service/CraPdfAssemblerService.java`
   - Maps `MonthlyCraReport` to `CraPdfDocument` using the `application.yml` defaults

**New test code — 1 file:**

4. `backend/src/test/java/com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest.java`
   - `@SpringBootTest(webEnvironment = RANDOM_PORT)` + `TestRestTemplate`, H2 in-memory
   - Ordered steps: create → update day → check totals → validate → list history → download PDF

## Excluded

- Frontend tests, client signature tests, pixel-perfect PDF comparison, load testing, authentication tests
- Refactoring existing `@WebMvcTest` unit tests

## Acceptance criteria

- POST /api/cra → 201, DRAFT status
- PATCH day → 200, `totalWorkedDays > 0`
- POST validate → 200, VALIDATED status
- GET /api/cras → 200, list contains the CRA id
- GET /api/cras/{id}/pdf → 200, `application/pdf`, non-empty body
- `mvn test` green (98 existing + new tests), no external services
