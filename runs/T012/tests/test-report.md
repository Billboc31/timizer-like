---

## Test Report — T012: Create CRA day update API

**Result: PASS — 88 tests, 0 failures**

### Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | API can update one day entry work value | **PASS** |
| 2 | API can update one day entry note | **PASS** |
| 3 | Invalid work values are rejected | **PASS** |
| 4 | Updating a validated CRA is rejected | **PASS** |
| 5 | API returns updated CRA details clearly | **PASS** |
| 6 | Existing tests still pass | **PASS** |

### Details

1. **Work value update** — `CraDayUpdateServiceTest.updatesWorkValueOnly` + `CraDayControllerTest.returnsHttp200WithUpdatedDtoOnSuccess` confirm the PATCH endpoint updates the value and returns the full CRA DTO.

2. **Note update** — Three tests cover note semantics: `updatesNoteOnly` (new value), `emptyNoteClears` (empty string → stored null), `nullNoteLeavesPriorNoteUnchanged` (null → no-op).

3. **Invalid work value rejection** — `rejectsInvalidWorkValue` confirms `InvalidWorkValueException` is thrown (not saved); `returnsHttp400OnInvalidWorkValue` confirms HTTP 400 with `{"error":"invalid_work_value","value":0.25}`.

4. **Validated CRA rejection** — Both `VALIDATED` and `SIGNED_BY_PROVIDER` statuses are blocked (`rejectsUpdateOnValidatedCra` + `rejectsUpdateOnSignedByProviderCra`); HTTP 409 confirmed by `returnsHttp409OnValidatedCra`.

5. **Response shape** — Returns full `CraDetailsDto` (id, month, year, totalWorkedDays, status, days[]); verified by `responseDtoIncludesCraMetadata` and the controller test.

6. **No regressions** — All 13 pre-existing test classes pass without modification.

### Regressions

None detected.

### Blocking Issues

None.
