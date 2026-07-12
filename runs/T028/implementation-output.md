All 99 tests pass. Here's a summary of what was implemented:

---

**Files created:**

| File | Role |
|---|---|
| `CraHistoryService.java` | `@Transactional(readOnly=true)` service — fetches all CRAs ordered by year/month desc, maps to `CraSummaryDto` |
| `CraHistoryController.java` | `GET /api/cras` — delegates to `CraHistoryService` |
| `CraPdfAssemblerService.java` | `@Transactional(readOnly=true)` service — maps `MonthlyCraReport` → `CraPdfDocument` (using `CraDefaultsProperties` for addresses not stored in entity), generates PDF bytes |
| `CraPdfController.java` | `GET /api/cras/{craId}/pdf` — returns `ResponseEntity<byte[]>` with `Content-Type: application/pdf`; 404 propagated via `CraApiExceptionHandler` when CRA not found |
| `CraWorkflowIntegrationTest.java` | `@SpringBootTest(RANDOM_PORT)` test covering the full workflow in a single method |

**`pom.xml`:** Added `httpclient5` (test scope) to enable PATCH requests from `TestRestTemplate` — Java's default `HttpURLConnection` does not support PATCH.

**Key decisions:** Merged `main` into the T028 branch to bring in the backend source. Used `TimizerLikeApplication.class` explicitly in `@SpringBootTest` to ensure both `com.timizer` and `com.timizerlike` packages are scanned.
