---

## Test Report — T012

**Verdict: VALIDATED**

All 6 acceptance criteria pass. Full test suite: **90 tests, 0 failures, 0 errors** (BUILD SUCCESS).

| Criterion | Status |
|-----------|--------|
| AC1 — API can update one day entry work value | **PASS** |
| AC2 — API can update one day entry note | **PASS** |
| AC3 — Invalid work values are rejected | **PASS** |
| AC4 — Updating a validated CRA is rejected | **PASS** |
| AC5 — API returns updated CRA details clearly | **PASS** |
| AC6 — Existing tests still pass | **PASS** |

**Key findings:**
- Endpoint: `PATCH /api/cras/{craId}/days/{date}`
- Work value validation (0, 0.5, 1) enforced at entity level; NaN/Infinity also rejected → HTTP 400
- Both `VALIDATED` and `SIGNED_BY_PROVIDER` statuses block edits → HTTP 409
- Note update supports null (preserve), `""` (clear), and string (set)
- Response includes full `CraDetailsDto` with recalculated total

No regressions, no blocking issues. Report written to `runs/T012/tests/test-report-attempt-2.md`.
