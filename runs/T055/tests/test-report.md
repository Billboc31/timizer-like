---

## Test Report — T055

**Verdict: FAIL — blocking regression**

### What was tested

Three targeted test classes (20 tests total) all pass:
- `CraPdfGeneratorTest` — 5/5 pass
- `CraPdfDownloadServiceTest` — 9/9 pass
- `CraClientSignServiceTest` — 6/6 pass

### Blocking regression

The full suite (128 tests) has **12 failures** caused by a single T055 change:

**File:** `MonthlyCraReport.java:100–103`

```java
@Column(name = "provider_signature_image", columnDefinition = "TEXT")
@Column(name = "client_signature_image",   columnDefinition = "TEXT")
```

H2 (the in-memory test database) does not recognise the `TEXT` domain. Hibernate fails to create the `monthly_cra_report` table at test startup, breaking:
- `MonthlyCraReportRepositoryTest` — 8 tests (table not found)
- `MonthlyCraReportPersistenceTest` — 3 tests (table not found)
- `CraWorkflowIntegrationTest.fullCraWorkflow` — 1 test (500 on first request)

These tests all passed before the T055 coder commit.

**Fix:** Remove `columnDefinition = "TEXT"` from both fields. The default JPA `String` mapping works fine for Base64 text in both H2 and PostgreSQL.

### Acceptance criteria summary

| Criterion | Status |
|---|---|
| Provider-signed PDF → provider sig + pending client area | PASS |
| Fully signed PDF → both sigs, names, dates | PASS |
| Identity from CRA snapshot | PASS |
| Signatures preserve aspect ratio | PASS |
| Repeated downloads produce equivalent content | PASS |
| Corrupt/missing signature data handled safely | PASS |
| PDF integration tests (provider-only + fully signed) | PARTIAL — unit tests pass, end-to-end integration test fails due to regression |
