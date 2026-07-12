---

## Test Report — T014 Create CRA history API

**Verdict: VALIDATION PASSED**

| Acceptance Criterion | Status |
|---|---|
| API returns a list of CRA summaries | **PASS** |
| CRA summaries include month and year | **PASS** |
| CRA summaries include status | **PASS** |
| CRA summaries include total worked days | **PASS** |
| CRA summaries are ordered consistently | **PASS** |
| Existing tests still pass | **PASS** |

### How each criterion was verified

- **List of summaries**: `GET /api/cras` → HTTP 200, JSON array (never null). Empty history → `[]`. Tested by `CraHistoryControllerTest`.
- **Month and year**: `CraSummaryDto` record exposes `int month` and `int year`; controller test asserts both JSON fields.
- **Status**: `CraStatus` enum (`DRAFT` / `VALIDATED`) is mapped by `CraHistoryService`; `SIGNED_BY_PROVIDER` collapses to `DRAFT` — tested explicitly.
- **Total worked days**: computed via `CraTotalCalculationService`, present as `double totalWorkedDays` in the DTO.
- **Consistent ordering**: derived JPA query `findAllByOrderByYearDescMonthDesc()` enforces year-desc, month-desc ordering; verified by service test.
- **Existing tests**: `mvn test` → **106 tests, 0 failures, 0 errors, BUILD SUCCESS**.

### Minor observation (non-blocking)
`SIGNED_BY_PROVIDER` is mapped to `DRAFT` in the public API. This collapses intermediate status information — no acceptance criterion requires finer granularity, but future consumers should be aware.

Report written to `runs/T014/tests/test-report.md`.
