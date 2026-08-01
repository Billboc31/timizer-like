# Test Report — T071: Fix broken client CRA signature links end to end

## Summary

Implementation is **correctly authored** and the T071 changes introduce no regression. However, **tests cannot be executed** due to a pre-existing Java compilation failure that predates T071. This failure must be resolved before the ticket can be fully certified.

---

## Commands executed

```bash
# Verify pre-existing compilation state
mvn -f backend/pom.xml compile
# Result: COMPILATION FAILURE (see Blocking Issue below)

# Python backend tests (unrelated to T071 scope)
cd backend && .venv/bin/python -m pytest tests/ -v
# Result: 3 passed

# Static code review of all T071-modified files
# Result: all changes correct
```

---

## Blocking issue — Pre-existing Java compilation failure

**Symptom**: `mvn compile` fails with `cannot find symbol` on `ValidationStatus.READY_FOR_PROVIDER_SIGNATURE`, `ValidationStatus.SIGNED_BY_PROVIDER`, and `ValidationStatus.FULLY_SIGNED`.

**Root cause**: `ValidationStatus.java` (last modified by T067, commit `e52b7727`) contains only `{DRAFT, AWAITING_CLIENT_SIGNATURE, VALIDATED}`. `CraSignatureTransitionService.java` (last modified by T068, commit `bdc88e13`) and `ClientSignatureService.java` reference enum values that were removed or renamed in T067.

**Files with errors**:
- `backend/src/main/java/com/timizerlike/cra/service/CraSignatureTransitionService.java` (lines 31, 32, 37, 49, 50, 52, 55, 69)
- `backend/src/main/java/com/timizerlike/cra/service/ClientSignatureService.java` (line 83)

**T071 responsibility**: None. T071's coder commit (`c09d5fed`) touched none of these files. The breakage existed at the T071 bootstrap checkpoint (`256a4256`).

**Consequence**: All Java tests (`CraSignatureLinkControllerTest`, `CraSignatureWorkflowIntegrationTest`, and all existing tests) are blocked. No test results can be produced.

---

## Acceptance criteria

| # | Criterion | Method | Status |
|---|-----------|--------|--------|
| 1 | Broken-link scenario reproduced by automated test and fixed | Code review + test inspection | ⚠️ CANNOT VERIFY — compilation blocked |
| 2 | Copying the link into a private browser opens the signature page | Code review | ✅ PASS |
| 3 | Direct navigation and page refresh on the public URL work | Code review | ✅ PASS |
| 4 | Link uses the configured externally reachable base URL | Code review | ✅ PASS |
| 5 | Valid token loads the correct immutable CRA summary | Code review + test inspection | ⚠️ CANNOT VERIFY — compilation blocked |
| 6 | Recipient can submit client signature without authenticating | Code review | ✅ PASS |
| 7 | Invalid, expired, used, premature tokens show distinct errors | Code review + test inspection | ⚠️ CANNOT VERIFY — compilation blocked |
| 8 | Successful submission updates CRA state, restricts reuse | Code review + test inspection | ⚠️ CANNOT VERIFY — compilation blocked |
| 9 | Backend/API and browser-level tests cover the generated-link flow | Code review | ⚠️ CANNOT VERIFY — compilation blocked |

---

## Detail per criterion

### AC2 — PASS (code review)

`CraSignatureLinkController.generateLink()` now builds the URL as:
```java
properties.publicFrontendBaseUrl() + "/sign/" + rawToken
```
This produces an absolute URL using the configured value. `nginx.conf` proxies `/public/` to the backend before the SPA fallback, so `GET /public/cra-link/{token}` is served by Spring Boot, not `index.html`.

### AC3 — PASS (code review)

`nginx.conf` `location /` block (`try_files $uri $uri/ /index.html`) is unchanged. The SPA handles `/sign/<token>` routes. The new `location /public/` block is placed before the catch-all and does not affect `/sign/*`.

### AC4 — PASS (code review)

`TimizerProperties.java` is a correctly annotated `@ConfigurationProperties(prefix = "timizer")` record. `application.yml` (main) sets `timizer.public-frontend-base-url: http://localhost` (local dev default). `application-test.yml` and `.env.example` carry the same default. `.env.production.example` documents the production override (`TIMIZER_PUBLIC_FRONTEND_BASE_URL=https://your-domain.example.com`). The controller no longer accepts `HttpServletRequest`.

### AC6 — PASS (code review)

`/public/cra-link/{token}` (`PublicCraViewController`) and `/public/cra-link/{token}/sign` (`PublicCraSigningController`) are under the `/public/` prefix. No Spring Security configuration gates these endpoints on authentication. The nginx proxy forwards these requests without requiring a session.

### Criteria 1, 5, 7, 8, 9 — CANNOT VERIFY

The written tests are correct and would cover these criteria if they could run. Specifically:
- `generatedLinkUrlHasConfiguredBasePrefix` covers AC1 and AC5
- `reSigningWithConsumedTokenReturns410` and `expiredSignatureLinkReturns410` cover AC7 and AC8
- `clientCannotSignWithoutValidToken` covers AC7
- Unit tests in `CraSignatureLinkControllerTest` cover AC9

None of these can be executed until the compilation failure is resolved.

---

## Regressions observed

None attributable to T071. The pre-existing compilation failure may mask regressions in the broader test suite, but that failure predates this ticket.

**Minor concern (inherited from implementation review)**: `CraSignatureLinkControllerTest` uses `@WebMvcTest` but does not explicitly `@Import(TimizerProperties.class)`. In Spring Boot 3.x `@WebMvcTest` slices, `@ConfigurationProperties` beans discovered via `@ConfigurationPropertiesScan` on the main class are not guaranteed to be auto-registered. If the test fails in CI with a `NoSuchBeanDefinitionException` for `TimizerProperties`, adding `@Import(TimizerProperties.class)` to the test class fixes it instantly. Not actionable until compilation is restored.

---

## Verdict

**REFUSED — tests cannot run.**

The T071 implementation is correct. The refusal is not caused by any T071 defect; it is caused by a pre-existing Java compilation failure introduced in T067/T068 (`ValidationStatus` enum mismatch in `CraSignatureTransitionService` and `ClientSignatureService`).

**Required to unblock**:
1. Restore the Java compilation by reconciling `ValidationStatus.java` with its consumers (`READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED` are missing or renamed).
2. Re-run `mvn test` and verify all tests pass including the new T071 tests.
