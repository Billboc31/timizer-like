# Test Report — T011 CRA Retrieval API

**Date**: 2026-07-12
**Branch**: ticket/T011-create-cra-retrieval-api

---

## Acceptance Criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | API can retrieve a CRA by identifier | **PASS** |
| 2 | API can retrieve a CRA by month and year | **PASS** |
| 3 | API response includes all day entries | **PASS** |
| 4 | API response includes total worked days | **PASS** |
| 5 | Missing CRA records return a clear not found response | **PASS** |
| 6 | Existing tests still pass | **PASS** |

---

## Details

### AC1 — Retrieve by identifier

`GET /api/cra/{id}` implemented in `CraController.getCraById()`. Delegates to `repository.findById(id)`, maps via `CraDetailsMapper::toDto`, throws `CraNotFoundException` when absent.

Test: `getById_returnsHttp200WithCraFields` — HTTP 200, all fields present (`id`, `month`, `year`, `status`, `totalWorkedDays`, `days` array).

### AC2 — Retrieve by month and year

`GET /api/cra/{year}/{month}` implemented in `CraController.getCraByYearAndMonth()`. Delegates to `repository.findByMonthAndYear(month, year)`, same mapping and error path.

Test: `getByYearAndMonth_returnsHttp200WithCraFields` — HTTP 200, all fields present.

### AC3 — All day entries included

`CraDetailsDto.days` field is a `List<CraDayEntryDto>`. `CraDetailsMapper.toDto()` iterates `report.getDayEntries()` and builds the list. Tests assert `$.days` is a non-null array.

### AC4 — Total worked days included

`CraDetailsMapper.toDto()` sums `entry.getWorkValue()` across all entries and sets `totalWorkedDays`. `CraDetailsDto` exposes it. Tests assert `$.totalWorkedDays` is present.

### AC5 — Clear 404 on missing record

`CraNotFoundException` thrown on empty `Optional`. `CraApiExceptionHandler` (`@RestControllerAdvice`) catches it and returns HTTP 404 with `{"error": "cra_not_found"}`.

Tests:
- `getById_returnsHttp404WhenNotFound` — HTTP 404, `$.error = "cra_not_found"`
- `getByYearAndMonth_returnsHttp404WhenNotFound` — HTTP 404, `$.error = "cra_not_found"`

### AC6 — Existing tests still pass

All 65 tests pass (0 failures, 0 errors, 0 skipped):

```
Tests run: 65, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

Test classes:
- `CraDtoTest` (5), `CraPdfDocumentTest` (4), `CraCreationServiceTest` (1)
- `CraTotalCalculationServiceTest` (7), `MonthlyCraReportPersistenceTest` (3)
- `MonthlyCraCreationServiceTest` (5), `CraDayEntryTest` (16)
- `MonthlyCraReportRepositoryTest` (8), `MonthlyCraReportTest` (6)
- `CraControllerTest` (10 — 6 pre-existing POST tests + 4 new GET tests)

---

## Regressions

None. All pre-existing `POST /api/cra` controller tests pass unchanged.

---

## Blocking Issues

None.

---

## Verdict

**VALIDATED** — All 6 acceptance criteria satisfied. Implementation is complete and all tests pass.
