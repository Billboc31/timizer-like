All tests pass. Here is the full test report.

---

## Test Report — T018: Create frontend API client

### Test suite

**1 file, 12 tests — all passed.**

| # | Acceptance criterion | Evidence | Status |
|---|----------------------|----------|--------|
| 1 | Frontend can call CRA creation API | `createCra(year, month)` → `POST /api/cra` — test passes | ✅ PASS |
| 2 | Frontend can call CRA retrieval API | `getCra(id)` → `GET /api/cras/:id` — test passes | ✅ PASS |
| 3 | Frontend can call day update API | `updateDay(craId, date, body)` → `PATCH /api/cras/:craId/days/:date` — test passes | ✅ PASS |
| 4 | Frontend can call validation API | `validateCra(craId, body)` → `POST /api/cras/:craId/validate` — test passes | ✅ PASS |
| 5 | Frontend can call history API | `listCras()` → `GET /api/cras` — test passes | ✅ PASS |
| 6 | Frontend can trigger PDF download | `downloadCraPdf(craId)` → `GET /api/cras/:id/pdf` → `Blob` — test passes | ✅ PASS |
| 7 | API errors are represented consistently | `ApiError` class with typed `code`, `httpStatus`, `detail`; 6 error-mapping tests (known codes, unknown fallback, network failure) — all pass | ✅ PASS |

### Regressions

None observed. No existing tests were touched.

### Non-blocking observations

- `oxlint` emits one **warning** (not error): `ApiError` is imported but unused in `craClient.test.ts:3`. It is dead import — only `isApiError` is used. No functional impact.

### Verdict

**VALIDATED** — all 7 acceptance criteria are satisfied. The one lint warning is cosmetic and non-blocking.
