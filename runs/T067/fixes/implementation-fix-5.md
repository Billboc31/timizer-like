# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T067/reviews/implementation-review.md
- generated at: 2026-07-31T22:15:31Z

---

I now have enough information to write the full review.

---

## PR Review — T067: Fix CRA Validation Workflow (Draft → Consultant → Client)

### Summary

The implementation introduces a well-structured three-state finite state machine (DRAFT → AWAITING_CLIENT_SIGNATURE → VALIDATED) backed by a new service layer, audit trail, and secure token-based client signature flow. The backend logic is solid and largely correct. One blocking UX requirement is missing.

---

### Backend — Workflow correctness

**✅ State machine**: `ValidationStatus.java` correctly defines the three states. Transitions are enforced in each service.

**✅ Consultant validation** (`CraValidationService.validate`): Atomically stores signature image, signer name, signature date, validation date, and content hash before changing status to `AWAITING_CLIENT_SIGNATURE`. Transactional.

**✅ Duplicate consultant validation**: Throws `CraValidatedException` (HTTP 409) if status is not `DRAFT`. Tested in `duplicateConsultantValidationIsRejected`.

**✅ Content hash**: SHA-256 of the public CRA DTO computed at consultant signature time and stored as `providerContentHash`. Immutable snapshot for auditability.

**✅ Client signature** (`ClientSignatureService.sign`): Validates consent, image format, and consumes the single-use token atomically before writing `CraClientSignatureRecord` and updating status to `VALIDATED`.

**✅ Client before consultant impossible**: Token generation (`/api/cras/{id}/signature-link`) enforces `AWAITING_CLIENT_SIGNATURE` status. Tested in `tokenGenerationRequiresAwaitingClientSignatureState`.

**✅ Expired token → 410 GONE**: Tested in `expiredSignatureLinkReturns410`.

**✅ Consumed token → 410 GONE**: Tested in `reSigningWithConsumedTokenReturns410`.

**✅ Concurrency protection**: `@Version` on `MonthlyCraReport` (optimistic locking). Tested in `concurrentConsultantValidationsProduceAtMostOneSuccess`.

**✅ Reopen**: `CraReopenService.reopen` — revokes token, clears both signatures, resets to DRAFT, records `INVALIDATION` event. Idempotent (returns early if already DRAFT). Tested for both post-consultant and post-both-signatures.

**✅ Day entries locked**: `CraDayUpdateService` rejects updates when status ≠ DRAFT. Tested in `dayUpdateRejectedAfterConsultantValidation`.

**✅ Structured validation errors**: `CraValidationBlockedException` returns HTTP 422 with a `reasons` list. Mapped in `CraApiExceptionHandler`.

**✅ Audit trail**: `CraAuditService` records `TRANSITION`, `INVALIDATION`, and `FAILED_TRANSITION` events in `CraTransitionEvent`.

---

### Frontend — UX requirements

**✅ French status labels**: `CraSignatureStatus.tsx` maps `DRAFT` → "Brouillon", `AWAITING_CLIENT_SIGNATURE` → "En attente de signature client", `VALIDATED` → "Validé".

**✅ Validate button**: `CraValidation.tsx` shows "Valider et signer le CRA" in DRAFT state, pre-fetches the configured signature, opens a confirmation dialog, shows the signature preview.

**✅ No signature configured**: Shows actionable message with link to Settings. Tested path.

**✅ Blocking reasons visible**: `CraValidation.tsx` renders `BLOCKING_REASON_LABELS` list in the dialog when `validation_blocked` error code is returned.

**✅ VALIDATED state**: `CraSignatureActions.tsx` shows both provider and client signer names and dates.

---

### BLOCKING ISSUE

**❌ Missing copy/resend link action in `AWAITING_CLIENT_SIGNATURE` state**

Ticket UX requirement:
> "In `AWAITING_CLIENT_SIGNATURE`, display signature invitation status and **actions to copy/resend the link when supported**."

Current implementation in `CraSignatureActions.tsx` (lines 11–18):
```tsx
if (cra.status === 'AWAITING_CLIENT_SIGNATURE') {
  return (
    <div className="cra-signature-actions">
      <p className="cra-signature-actions__info">
        En attente de la signature client. Partagez le lien de signature avec le client.
      </p>
    </div>
  );
}
```

The component shows static text with no button. The backend already supports `POST /api/cras/{craId}/signature-link` which returns a `signatureUrl`. The frontend must add a button that calls this endpoint, then allows the consultant to copy the URL. Without this, the consultant validates successfully but has no practical way to retrieve and share the signature link from the UI.

This is not a minor cosmetic gap — it makes the workflow non-functional in the UI after the consultant signs.

**Required fix**: Add a "Générer le lien de signature" or "Copier le lien" button in `CraSignatureActions` that calls `POST /api/cras/{id}/signature-link` and displays/copies the returned `signatureUrl` to the clipboard.

---

### Non-blocking observations

**⚠️ Signature image validation too permissive** (`CraValidationService:52`, `ClientSignatureService:50`): Only checks for `data:image/` prefix. No size limit and no format verification. Large base64 blobs will bloat `TEXT` columns. Recommend adding a max size check (e.g., 500KB after decode) in a follow-up ticket.

**⚠️ `CraValidatedException` overloaded**: Used for "already consultant-signed" (in `CraValidationService`) and "not DRAFT" (in `CraDayUpdateService`). A CRA in `AWAITING_CLIENT_SIGNATURE` is semantically not "validated" yet — the 409 is correct but the error code `cra_validated` is misleading in the day-update path. Minor naming issue.

**⚠️ No explicit authentication on consultant endpoints**: `/api/cras/{id}/validate` and `/api/cras/{id}/reopen` have no security annotation. If Spring Security is configured at the filter level, this is fine — but it cannot be verified from the controllers alone. Confirm authorization is enforced.

**⚠️ Missing test**: "current failing validation scenario" (the original bug) is not explicitly tested by name. The happy path integration test implicitly fixes it, but reproducing the original failure path would give clearer regression coverage.

**⚠️ `providerSignerName` not validated against stored signature settings**: The backend accepts any name string at validation time. The frontend sends the name from `ProviderSignatureSettings`, but the backend does not verify the match. Minor trust-boundary concern.

---

### Test coverage assessment

| Ticket requirement | Covered? |
|---|---|
| Happy path draft → final validation | ✅ `CraWorkflowIntegrationTest.fullCraWorkflow` |
| Current failing validation scenario | ⚠️ Fixed but not explicitly reproduced |
| Missing consultant signature | ✅ `tokenGenerationRequiresAwaitingClientSignatureState` |
| Client attempt before consultant | ✅ `clientCannotSignWithoutValidToken` |
| Duplicate consultant submission | ✅ `duplicateConsultantValidationIsRejected` |
| Duplicate client submission | ✅ `reSigningWithConsumedTokenReturns410` |
| Expired signature link | ✅ `expiredSignatureLinkReturns410` |
| Concurrent submissions | ✅ `concurrentConsultantValidationsProduceAtMostOneSuccess` |
| Editing after consultant signature | ✅ `dayUpdateRejectedAfterConsultantValidation` |
| Editing after both signatures | ✅ `reopenAfterBothSignaturesReturnsToDraft` |
| Page refresh at each state | ❌ Not covered (frontend integration test gap) |

---

### Verdict

The backend workflow is correctly implemented and well-tested. The blocking gap is the missing copy/resend link UI in `AWAITING_CLIENT_SIGNATURE` — the ticket explicitly requires this action, the backend supports it, but the frontend does not expose it. The consultant has no way to retrieve the signing URL from the UI after validation.

IMPLEMENTATION_FIX_REQUIRED
