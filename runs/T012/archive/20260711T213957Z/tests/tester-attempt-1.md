# Test Report — T012: Create CRA day update API

**Date**: 2026-07-11  
**Branch**: ticket/T012-create-cra-day-update-api  
**Total tests run**: 88 — 0 failures, 0 errors, 0 skipped  
**Overall verdict**: PASS

---

## Commands executed

```
cd backend && mvn test
```

Output summary:
```
Tests run: 5  -- com.timizerlike.backend.cra.dto.CraDtoTest
Tests run: 6  -- com.timizerlike.backend.cra.web.CraDayControllerTest
Tests run: 4  -- com.timizerlike.cra.pdf.model.CraPdfDocumentTest
Tests run: 12 -- com.timizerlike.cra.service.CraDayUpdateServiceTest
Tests run: 1  -- com.timizerlike.cra.service.CraCreationServiceTest
Tests run: 9  -- com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest
Tests run: 7  -- com.timizer.backend.cra.CraTotalCalculationServiceTest
Tests run: 3  -- com.timizer.backend.cra.MonthlyCraReportPersistenceTest
Tests run: 5  -- com.timizer.backend.cra.MonthlyCraCreationServiceTest
Tests run: 16 -- com.timizer.backend.cra.CraDayEntryTest
Tests run: 8  -- com.timizer.backend.cra.MonthlyCraReportRepositoryTest
Tests run: 6  -- com.timizer.backend.cra.api.CraControllerTest
Tests run: 6  -- com.timizer.backend.cra.MonthlyCraReportTest
Total: 88 tests — BUILD SUCCESS
```

---

## Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | API can update one day entry work value | **PASS** | `CraDayUpdateServiceTest.updatesWorkValueOnly` + `CraDayControllerTest.returnsHttp200WithUpdatedDtoOnSuccess` |
| 2 | API can update one day entry note | **PASS** | `CraDayUpdateServiceTest.updatesNoteOnly`, `emptyNoteClears`, `nullNoteLeavesPriorNoteUnchanged` |
| 3 | Invalid work values are rejected | **PASS** | `CraDayUpdateServiceTest.rejectsInvalidWorkValue` → `InvalidWorkValueException`; `CraDayControllerTest.returnsHttp400OnInvalidWorkValue` → HTTP 400 + `{"error":"invalid_work_value","value":0.25}` |
| 4 | Updating a validated CRA is rejected | **PASS** | `rejectsUpdateOnValidatedCra` (VALIDATED) + `rejectsUpdateOnSignedByProviderCra` (SIGNED_BY_PROVIDER) → `CraValidatedException`; `CraDayControllerTest.returnsHttp409OnValidatedCra` → HTTP 409 |
| 5 | API returns updated CRA details or updated day entry clearly | **PASS** | Returns full `CraDetailsDto` (id, month, year, totalWorkedDays, status, days[]); verified by `responseDtoIncludesCraMetadata` and `returnsHttp200WithUpdatedDtoOnSuccess` |
| 6 | Existing tests still pass | **PASS** | All 88 tests pass; all pre-existing test classes unmodified and green |

---

## Regressions

None detected.

---

## Anomalies

None. No blocking issues found.

---

## Observations

- The service guard is correctly conservative: any status other than `DRAFT` (i.e. both `SIGNED_BY_PROVIDER` and `VALIDATED`) is rejected. This aligns with the ticket's intent.
- Partial update semantics are correct: `null` fields are ignored, empty string note clears the stored note.
- `PATCH /api/cras/{craId}/days/{date}` with ISO-8601 date path variable is wired and returns HTTP 200 with full CRA DTO on success.
- Malformed date path returns HTTP 400 (covered by `returnsHttp400OnMalformedDate`).
