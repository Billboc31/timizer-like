# T012 — Test Report (Attempt 2)

**Date**: 2026-07-11  
**Branch**: ticket/T012-create-cra-day-update-api

---

## Test Execution

**Command**:
```
cd backend && JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home \
  PATH="$JAVA_HOME/bin:$PATH" ./mvnw test
```

**Result**: `BUILD SUCCESS` — 90 tests run, 0 failures, 0 errors, 0 skipped (3.4s)

Test classes executed:
| Class | Tests |
|-------|-------|
| `CraDtoTest` | 5 |
| `CraDayControllerTest` | 6 |
| `CraPdfGeneratorTest` | 2 |
| `CraPdfDocumentTest` | 4 |
| `CraDayUpdateServiceTest` | 12 |
| `CraCreationServiceTest` | 1 |
| `CraDayEntryUpdateWorkValueTest` | 9 |
| `CraTotalCalculationServiceTest` | 7 |
| `MonthlyCraReportPersistenceTest` | 3 |
| `MonthlyCraCreationServiceTest` | 5 |
| `CraDayEntryTest` | 16 |
| `MonthlyCraReportRepositoryTest` | 8 |
| `CraControllerTest` | 6 |
| `MonthlyCraReportTest` | 6 |

---

## Acceptance Criteria

### AC1 — API can update one day entry work value
**PASS**

`PATCH /api/cras/{craId}/days/{date}` with `{"workValue": 0.5}` updates and persists the value. Covered by `CraDayControllerTest` (success → 200) and `CraDayUpdateServiceTest` (updates work value only, preserves note).

---

### AC2 — API can update one day entry note
**PASS**

`{"note": "text"}` updates the note without touching work value. `{"note": ""}` clears the note (sets to null). `{"note": null}` leaves the note unchanged. Covered by `CraDayUpdateServiceTest` (multiple note scenarios).

---

### AC3 — Invalid work values are rejected
**PASS**

Only `0`, `0.5`, and `1` are accepted. Any other value throws `InvalidWorkValueException` → HTTP 400 with `{"error":"invalid_work_value","value":<double>}`. NaN and Infinity are also rejected. Covered by `CraDayControllerTest` (0.25 → 400), `CraDayUpdateServiceTest` (0.25, 2.0, -1.0), `CraDayEntryUpdateWorkValueTest` (9 tests including NaN, Infinity).

---

### AC4 — Updating a validated CRA is rejected
**PASS**

`CraDayUpdateService` checks `status != DRAFT` before any update. Both `VALIDATED` and `SIGNED_BY_PROVIDER` throw `CraValidatedException` → HTTP 409 with `{"error":"cra_validated"}`. Covered by `CraDayUpdateServiceTest` (2 tests) and `CraDayControllerTest` (1 test).

---

### AC5 — API returns updated CRA details or updated day entry clearly
**PASS**

Response is a `CraDetailsDto` containing CRA id, month, year, totalWorkedDays, status, and the full ordered list of day entries. Covered by `CraDayControllerTest` (200 response with DTO) and `CraDayUpdateServiceTest` (DTO includes all metadata and recalculated total).

---

### AC6 — Existing tests still pass
**PASS**

Full suite: 90 tests, 0 failures, 0 errors, 0 skipped. All pre-existing tests in `CraControllerTest`, `MonthlyCraReport*`, `CraTotalCalculationServiceTest`, `CraCreationServiceTest`, `CraPdf*` pass without modification.

---

## Regressions

None detected.

## Blocking Issues

None.

## Notes

- Java 21 (Homebrew) must be set via `JAVA_HOME` — `java` is not on the default PATH in this environment.
- `MonthlyCraReportPersistenceTest` emits a unique-constraint WARN log; this is intentional (tests the constraint itself) and does not affect the build result.

---

## Verdict

**VALIDATED** — all 6 acceptance criteria pass, no regressions, no blocking issues.
