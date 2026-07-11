---

## Test Report — T006

**Verdict: PASS — all 6 acceptance criteria satisfied.**

### What was tested

A temporary Maven project was assembled (T006 service + T003 entity + pom.xml from T009) since this branch has no build file yet. `mvn test` was executed against the 7 unit tests in `CraTotalCalculationServiceTest`.

**Result: 7/7 tests pass, BUILD SUCCESS (1.195s).**

### Acceptance criteria

| Criterion | Status |
|---|---|
| Total worked days can be calculated from day entries | **PASS** |
| Half-days are counted as 0.5 | **PASS** — `sumsHalfDaysOnly`: 3×0.5 = 1.5 |
| Non-worked days are counted as 0 | **PASS** — `ignoresNonWorkedDays`: 5×0.0 + 2×1.0 = 2.0 |
| Returns 21.5 for 21 full days + 1 half-day | **PASS** — `matchesAcceptanceExample` |
| Unit tests cover total calculation cases | **PASS** — 7 tests including all value types + guards |
| Existing tests still pass | **PASS** — no pre-existing tests on this branch |

### Regressions

None observed.

### Blocking issues

None. The `double` arithmetic is correct for values {0.0, 0.5, 1.0} (all exactly representable in IEEE-754). Integration with T009 (build) and T003 (entity) is a separate prerequisite, not a defect.

Full report written to `runs/T006/tests/test-report.md`.
