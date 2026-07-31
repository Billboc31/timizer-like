# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T067/reviews/implementation-review.md
- generated at: 2026-07-31T21:39:01Z

---

I now have enough information to produce the full review.

---

## Review — T067: Fix CRA validation workflow (DRAFT → AWAITING_CLIENT_SIGNATURE → VALIDATED)

### Summary

The implementation has solid foundations: state machine is correctly simplified to 3 states, `validateCra()` export is restored (root cause fixed), token security is correctly implemented, optimistic locking is in place, and both signature services are `@Transactional`. However, there are **4 blocking issues** that prevent this from meeting the stated acceptance criteria.

---

### Blocking Issues

#### 1. Integration test will fail: `duplicateConsultantValidationIsRejected` expects wrong status code

**File:** `backend/src/test/java/com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.java:105`

The test asserts `HttpStatus.CONFLICT` (409) and `error: "cra_validated"` when a second validate call is made on a non-DRAFT CRA.

But `CraValidationService.validate()` throws `CraValidationBlockedException` (not `CraValidatedException`) when `status != DRAFT`, and `CraApiExceptionHandler` maps that to HTTP **422** + `validation_blocked`. The test will fail at runtime.

The same inconsistency affects the controller unit test at `CraValidationControllerTest:81` — it mocks the service to throw `CraValidatedException`, but the actual service never throws that exception for a duplicate validate; this test covers a dead code path.

**Fix:** Either change the integration test to expect 422 + `validation_blocked`, or make the service throw `CraValidatedException` specifically for the duplicate-validate case and remove `STATUS_NOT_DRAFT` from the reasons list for that scenario.

---

#### 2. Audit trail not called from `CraValidationService` or `ClientSignatureService`

**Files:**
- `backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java` — no `CraAuditService` injection or call
- `backend/src/main/java/com/timizerlike/cra/service/ClientSignatureService.java` — same

`CraAuditService` has the right methods (`recordTransition`, `recordFailedTransition`) and `CraReopenService` calls `recordInvalidation` correctly. But consultant-sign and client-sign transitions are never audited.

Acceptance criterion: "Transition and signature events are auditable." and "Audit every signature, transition, invalidation, and failed transition attempt." — not met.

**Fix:** Inject `CraAuditService` into both services. Call `recordTransition(craId, DRAFT, AWAITING_CLIENT_SIGNATURE, CONSULTANT, signerName)` in `CraValidationService.validate()` after save, and `recordTransition(craId, AWAITING_CLIENT_SIGNATURE, VALIDATED, CLIENT, signerName)` in `ClientSignatureService.sign()` after save.

---

#### 3. Frontend does not display structured blocking reasons

**File:** `frontend/src/components/CraValidation/CraValidation.tsx:88-90`

On validation error, the component calls `getErrorMessage(e)` which returns the static string `"La validation du CRA est bloquée. Vérifiez les prérequis."` for `validation_blocked`. The backend returns a `reasons` array (e.g. `["STATUS_NOT_DRAFT", "INVALID_SIGNATURE_IMAGE"]`) that is never extracted or displayed.

Acceptance criterion: "A generic 'not allowed' response is replaced with precise blocking reasons." — not met. The current UX is slightly better than "not allowed" but still generic.

**Fix:** In the catch block of `handleConfirm`, check if the error is a `validation_blocked` ApiError and extract the `reasons` array from the response body. Render them as a list. This requires the `ApiError` type to carry the reasons payload, or a separate parse of the raw error response.

---

#### 4. Missing required test scenarios per ticket testing requirements

The ticket explicitly lists 10 scenarios that must be covered. These are absent:

| Missing scenario | Where |
|---|---|
| Client attempts to sign before consultant signs | No integration test covers trying to sign via `/public/cra-link/{token}` when CRA is in DRAFT |
| Editing after consultant signature — reopen flow | `CraReopenService` exists and is tested in isolation but no integration test exercises POST `/reopen` |
| Editing after both signatures — reopen from VALIDATED | Same |
| Expired signature link | `TokenExpiredException` is handled but no test triggers it |
| Concurrent submissions | `@Version` optimistic lock is correct but no test for concurrent conflict |

The tests for "duplicate client submission" (consumed token) and "day update rejected after sign" are present and correct.

**Fix:** Add integration tests for each of the above. The reopen, expired-token, and pre-consultant-sign scenarios are the most critical.

---

### Minor Observations (not blocking)

**5. No reopen button in `CraSignatureActions.tsx`**

`reopenCra()` is exported from `craClient.ts` but `CraSignatureActions` does not render any UI to trigger it for AWAITING_CLIENT_SIGNATURE or VALIDATED states. Users can't reopen a CRA from the UI. The API endpoint and service are complete; only the UI trigger is missing.

**6. `CraDayUpdateService` blocks edits in AWAITING_CLIENT_SIGNATURE (wider than plan)**

The plan specified blocking only VALIDATED; the implementation blocks all non-DRAFT edits. This is arguably more correct business behavior (and is tested and consistent), but it is a deviation from the plan. The error code returned is `cra_validated` instead of `cra_read_only` as the plan specified — minor wording difference.

**7. `ddl-auto: update` — no Flyway migrations**

New columns (`version`, `provider_content_hash`, `provider_signature_image`, etc.) added to `monthly_cra_report` are managed by Hibernate auto-DDL. This is a pre-existing architectural choice, not introduced by this ticket, but new fields won't be formally versioned for production migration.

---

### What's correct

- State machine: exactly 3 values in `ValidationStatus.java`, correct mapper
- Root cause fix: `validateCra()` exported from `craClient.ts`
- Structured blocking reasons: backend returns `{ reasons: [...] }` on 422
- Token security: `SecureRandom`, hash stored (not raw token), single-use consumption, expiry check, revocation on reopen
- Optimistic locking: `@Version` on `MonthlyCraReport`
- Atomic transitions: both signature services are `@Transactional`
- Reopen path: clears both signatures, revokes token, calls audit
- Frontend status labels: correct French labels for all 3 states
- Button label: correct "Valider et signer le CRA"
- `@NotBlank` on `ValidateCraRequestDto.providerSignerName`: signer-name validation is enforced at the DTO level

---

IMPLEMENTATION_FIX_REQUIRED
