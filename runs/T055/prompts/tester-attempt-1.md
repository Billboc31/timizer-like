# T055 — Test Report

## Summary

**20 / 20 targeted unit tests pass. 12 tests fail due to a blocking regression introduced by T055.**

---

## Commands executed

```bash
# Targeted unit tests
mvn test -Dtest="CraPdfGeneratorTest,CraPdfDownloadServiceTest,CraClientSignServiceTest" --no-transfer-progress

# Full test suite
mvn test --no-transfer-progress
```

---

## Targeted test results

| Test class | Tests | Result |
|---|---|---|
| `CraPdfGeneratorTest` | 5 | PASS |
| `CraPdfDownloadServiceTest` | 9 | PASS |
| `CraClientSignServiceTest` | 6 | PASS |
| **Total** | **20** | **PASS** |

---

## Full suite results

| Test class | Tests | Result | Cause |
|---|---|---|---|
| `CraPdfGeneratorTest` | 5 | PASS | — |
| `CraPdfDownloadServiceTest` | 9 | PASS | — |
| `CraClientSignServiceTest` | 6 | PASS | — |
| `MonthlyCraReportRepositoryTest` | 8 | **FAIL** | H2 doesn't support `TEXT` domain |
| `MonthlyCraReportPersistenceTest` | 3 | **FAIL** | H2 doesn't support `TEXT` domain |
| `CraWorkflowIntegrationTest` | 1 | **FAIL** | Table never created (DDL fails) → 500 |
| Other suites (controllers, services, etc.) | 111 | PASS | — |

**Total: 128 tests run, 1 failure, 11 errors.**

---

## Blocking issue — `columnDefinition = "TEXT"` breaks H2 tests

**File:** `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java` — lines 100–103

**Root cause:**
```java
@Column(name = "provider_signature_image", columnDefinition = "TEXT")
private String providerSignatureImage;

@Column(name = "client_signature_image", columnDefinition = "TEXT")
private String clientSignatureImage;
```

H2 in-memory database (used for tests) does not recognise the `TEXT` domain. When Hibernate tries to auto-create the schema at test startup it emits:

```
Le domaine "TEXT" non trouvé
Error executing DDL "create table "monthly_cra_report" ... "client_signature_image" "TEXT" ..."
```

The table is never created, so:
- `MonthlyCraReportRepositoryTest` — all 8 tests throw `InvalidDataAccessResourceUsageException`
- `MonthlyCraReportPersistenceTest` — all 3 tests throw `SQLGrammarException`
- `CraWorkflowIntegrationTest.fullCraWorkflow` — first API call returns 500 (table missing)

**These tests were passing before T055.** Confirmed by:
```bash
git show 2f0f855f:backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java | grep "TEXT"
# → No output
```

**Fix:** Remove `columnDefinition = "TEXT"` from both fields. H2 will use `VARCHAR` by default, which is sufficient for Base64 text. For PostgreSQL production the default JPA mapping for `String` is also `VARCHAR`, which Postgres handles fine for large text; alternatively use `@Lob` if very large images are expected.

---

## Acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Provider-signed PDF shows provider signature + pending client area | **PASS** | `generatesPdfWithPendingClientSignature`: extracted text contains `"En attente de signature"`, provider name, provider date |
| Fully signed PDF shows both signatures, names, and dates | **PASS** | `generatesPdfWithBothSignatures`: page 1 contains `"Alice Provider"`, `"01/04/2026"`, `"Bob Client"`, `"15/04/2026"` |
| Provider and client identity from CRA snapshot | **PASS** | `CraPdfDownloadService.toDocument` reads all fields from `MonthlyCraReport`; `populatesProviderSignatureFromCra` and `populatesClientSignatureWhenSigned` verify mapping |
| Signatures preserve aspect ratio | **PASS** | `CraPdfGenerator.embedSignatureImage` scales within fixed bounding box preserving aspect ratio (code review) |
| Repeated downloads produce equivalent content | **PASS** | Rendering is deterministic: all inputs are frozen entity fields; no stateful side-effects in `CraPdfGenerator` |
| Missing or corrupt signature data handled safely | **PASS** | `handlesMissingSignatureImageGracefully`: `generate()` does not throw for invalid bytes; corrupt PNG logged by PDFBox and silently skipped |
| PDF integration tests verify provider-only and fully signed variants | **PARTIAL** | Unit-level tests exist and pass. `CraWorkflowIntegrationTest` (end-to-end PDF download via HTTP) **fails** due to the H2/TEXT regression above |

---

## Additional observations

- The `MINIMAL_PNG` constant in `CraPdfGeneratorTest` has an invalid CRC checksum. PDFBox logs an error but does not throw — this is the test's deliberate intent for the graceful-handling assertion. Not a bug, but the fixture name is slightly misleading.
- `POST /api/cras/{id}/client-sign` guard logic (DRAFT rejection, idempotency) is fully covered in `CraClientSignServiceTest` (6 tests pass).
- Frontend changes (`CraClientSign.tsx`, `CraHistory.tsx`) were not exercised by automated tests; UI validation is out of scope for this test pass.

---

## Verdict

**FAIL — blocking regression.**

The `columnDefinition = "TEXT"` annotation added by T055 breaks 12 pre-existing database tests. Fix is localised to 2 lines in `MonthlyCraReport.java`. All T055-specific unit tests pass; the regression must be resolved before this ticket can be considered done.
