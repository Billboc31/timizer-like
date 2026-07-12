The plan has been written to `runs/T028/plan.md`. Here's a summary of the key decisions:

**Two missing endpoints must be created** — the acceptance criteria for "history listing" and "PDF download" are untestable without them:
- `GET /api/cras` → `List<CraSummaryDto>` via `CraHistoryController`, backed by the existing `findAllByOrderByYearDescMonthDesc()` repository query
- `GET /api/cras/{id}/pdf` → `ResponseEntity<byte[]>` via `CraPdfController`, bridging `MonthlyCraReport` entities to the existing `CraPdfGenerator`

**Integration test** (`CraApiIntegrationTest`) uses `@SpringBootTest` + `@AutoConfigureMockMvc` with H2 in-memory (already on test classpath), with ordered test methods sharing a single `craId` across 7 sequential steps covering the full workflow.

**PDF assertion** is limited to HTTP 200 + `Content-Type: application/pdf` + non-empty body — no pixel-perfect comparison.
