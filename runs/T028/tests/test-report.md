## Test Report — T028

**Result: VALIDATED** — all acceptance criteria pass.

| # | Criterion | Status |
|---|-----------|--------|
| 1 | CRA creation | **PASS** — `POST /api/cra` → 201 DRAFT |
| 2 | Day value update | **PASS** — `PATCH /api/cras/{id}/days/2026-07-01` → 200 OK |
| 3 | Total calculation after update | **PASS** — `totalWorkedDays > 0` asserted on response |
| 4 | CRA validation | **PASS** — `POST /api/cras/{id}/validate` → 200 VALIDATED |
| 5 | History listing | **PASS** — `GET /api/cras` → list non-empty, CRA id present |
| 6 | PDF download response | **PASS** — `GET /api/cras/{id}/pdf` → 200, `application/pdf`, non-empty body |
| 7 | No external services | **PASS** — H2 in-memory DB auto-configured, no Testcontainers/Docker |

**Execution**: `Tests run: 1, Failures: 0, Errors: 0 — BUILD SUCCESS`

The single `fullCraWorkflow` test in `CraWorkflowIntegrationTest.java` covers the full sequential backend workflow and passes cleanly. Report written to `runs/T028/tests/test-report.md`.
