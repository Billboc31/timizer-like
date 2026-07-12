The plan is written to `runs/T028/plan.md`. Key decisions:

- **Three missing GET endpoints** (`GET /api/cras/{id}`, `GET /api/cras`, `GET /api/cras/{id}/pdf`) are in scope because the integration test workflow requires them — no endpoint, no integration test.
- **Single sequential test method** chains all seven steps, asserting after each, so failures are pinpointed to the exact workflow step.
- **H2 is already on the test classpath** via the existing `src/test/resources/application.yml` — no new configuration needed.
- **PDF assertion is minimal**: HTTP 200 + `application/pdf` content-type + non-empty body only, no pixel comparison.
