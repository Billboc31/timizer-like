---

## Test Report — T071

**Verdict: REFUSED — tests cannot run**

### What was checked

All T071-modified files were reviewed statically, and `mvn compile` was executed to attempt test execution.

### Blocking issue (pre-existing, not caused by T071)

The Java backend fails to compile due to a `ValidationStatus` enum mismatch introduced by T067/T068:

- `ValidationStatus.java` has only `{DRAFT, AWAITING_CLIENT_SIGNATURE, VALIDATED}`
- `CraSignatureTransitionService.java` and `ClientSignatureService.java` reference `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, and `FULLY_SIGNED`

This existed before T071 started (`256a4256`). No Java test can run.

### Acceptance criteria

| Criterion | Status |
|-----------|--------|
| AC1 — Automated test for broken-link scenario | ⚠️ CANNOT VERIFY (compilation blocked) |
| AC2 — Copying link opens signature page in private browser | ✅ PASS (code review) |
| AC3 — Direct navigation + refresh on public URL work | ✅ PASS (code review) |
| AC4 — Link uses configured base URL | ✅ PASS (code review) |
| AC5 — Valid token loads CRA summary | ⚠️ CANNOT VERIFY |
| AC6 — Sign without authenticating | ✅ PASS (code review) |
| AC7 — Distinct errors for invalid/expired/used/premature tokens | ⚠️ CANNOT VERIFY |
| AC8 — Submission updates CRA state, restricts reuse | ⚠️ CANNOT VERIFY |
| AC9 — Backend/API tests cover generated-link flow | ⚠️ CANNOT VERIFY |

### T071 implementation quality

The 9 modified files are all correct. `CraSignatureLinkController` no longer reads `HttpServletRequest`; it uses `TimizerProperties.publicFrontendBaseUrl()`. `nginx.conf` properly proxies `/public/` before the SPA catch-all. The new tests (`generatedLinkUrlHasConfiguredBasePrefix`, `signatureUrlDoesNotContainContainerInternalHost`) correctly cover the broken-link scenario.

### To unblock

Reconcile `ValidationStatus.java` with its consumers by adding the missing enum values (`READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED`) or updating the service classes to use the current values — then re-run `mvn test`.
