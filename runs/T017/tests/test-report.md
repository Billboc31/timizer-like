## Test Report — T017: Create CRA PDF download API

**Verdict: VALIDATED** — all 6 acceptance criteria pass, no regressions.

---

### Commands executed

```
mvn test   # from backend/
```

**Result:** `Tests run: 107, Failures: 0, Errors: 0, Skipped: 0 — BUILD SUCCESS`

---

### Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| AC1 | API returns a PDF response for a validated CRA | **PASS** |
| AC2 | API response uses a PDF content type | **PASS** |
| AC3 | Download filename includes the CRA period | **PASS** |
| AC4 | Non-existing CRA returns a clear not found response | **PASS** |
| AC5 | Non-validated CRA download is rejected or clearly handled | **PASS** |
| AC6 | Existing tests still pass | **PASS** |

---

### Details

- **AC1/AC2:** `GET /api/cras/{craId}/pdf` returns HTTP 200 with `Content-Type: application/pdf` and a `ResponseEntity<byte[]>` body. Verified by `CraPdfDownloadControllerTest#returnsHttp200WithPdfContentOnSuccess`.

- **AC3:** Filename is `CRA-{providerCompany}-{clientCompany}-{YYYY-MM}.pdf`, sent in the `Content-Disposition: attachment` header. Verified by `CraPdfDownloadServiceTest#filenameContainsPeriod` and `#filenameContainsProviderAndClientCompany`.

  > Minor observation: the ticket says "client name" but the implementation uses the client **company** name. This is a reasonable interpretation and is tested explicitly — not blocking.

- **AC4:** `CraNotFoundException` → HTTP 404 `{"error": "cra_not_found"}`. Verified by controller test `returnsHttp404WhenCraNotFound`.

- **AC5:** Status guard `!= VALIDATED` → `CraNotValidatedException` → HTTP 422 `{"error": "cra_not_validated"}`. Verified by both controller and service tests. PDF generator is never called for non-validated CRAs.

- **AC6:** 107/107 tests pass including all pre-existing tests for CRA creation, day management, validation, and persistence.

Report saved to `runs/T017/tests/tester-attempt-1.md`.
