# Test Report — T017: Create CRA PDF download API

**Date**: 2026-07-12
**Branch**: ticket/T017-create-cra-pdf-download-api

---

## Commands executed

```
mvn test
# from: backend/
```

## Results

```
Tests run: 107, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## Acceptance criteria

### AC1 — API returns a PDF response for a validated CRA
**PASS**

`CraPdfDownloadController` (GET `/api/cras/{craId}/pdf`) calls `CraPdfDownloadService.download()`, which fetches the CRA, verifies `status == VALIDATED`, generates PDF bytes via `CraPdfGenerator`, and returns a `ResponseEntity<byte[]>` with HTTP 200.

Test: `CraPdfDownloadControllerTest#returnsHttp200WithPdfContentOnSuccess` — passes.

---

### AC2 — API response uses a PDF content type
**PASS**

Controller explicitly sets `.contentType(MediaType.APPLICATION_PDF)` on the response.

Test: `CraPdfDownloadControllerTest#returnsHttp200WithPdfContentOnSuccess` asserts `content().contentType(MediaType.APPLICATION_PDF)` — passes.

---

### AC3 — Download filename includes the CRA period
**PASS**

`CraPdfDownloadService.buildFilename()` produces `CRA-{providerCompany}-{clientCompany}-{YYYY-MM}.pdf`.  
The period is formatted as `String.format("%04d-%02d", cra.getYear(), cra.getMonth())`.  
The filename is sent in the `Content-Disposition: attachment; filename="..."` header.

Test: `CraPdfDownloadServiceTest#filenameContainsPeriod` asserts filename contains `"2026-06"` — passes.

> Note: The ticket mentions "provider company, client name, and period". The implementation uses the **client company** (not the client person's name) in the filename. This is a reasonable interpretation for a downloadable document and the test validates it explicitly. No blocking issue.

---

### AC4 — Non-existing CRA returns a clear not found response
**PASS**

Service throws `CraNotFoundException` when `findById` returns `Optional.empty()`.  
`CraApiExceptionHandler` maps it to HTTP 404 with body `{"error": "cra_not_found"}`.

Test: `CraPdfDownloadControllerTest#returnsHttp404WhenCraNotFound` asserts HTTP 404 and `$.error == "cra_not_found"` — passes.

---

### AC5 — Non-validated CRA download is rejected or clearly handled
**PASS**

Service checks `cra.getStatus() != ValidationStatus.VALIDATED` and throws `CraNotValidatedException`.  
`CraApiExceptionHandler` maps it to HTTP 422 with body `{"error": "cra_not_validated"}`.

Tests:
- `CraPdfDownloadControllerTest#returnsHttp422WhenCraNotValidated` — HTTP 422 + `cra_not_validated` — passes.
- `CraPdfDownloadServiceTest#throwsCraNotValidatedWhenCraIsNotValidated` — DRAFT status → exception, PDF generator never called — passes.

---

### AC6 — Existing tests still pass
**PASS**

Full Maven test run: **107 tests, 0 failures, 0 errors, 0 skipped**.

---

## Regressions observed

None. All 107 tests pass, including pre-existing tests for CRA creation, day management, validation, and persistence.

---

## Blocking issues

None.

---

## Verdict

**VALIDATED** — all 6 acceptance criteria are satisfied, no regressions detected.
