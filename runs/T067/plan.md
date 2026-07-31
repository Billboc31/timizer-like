# T067 — Fix CRA validation workflow from draft to consultant and client signatures

## Objective

Collapse the current dual 6-state CRA workflow into a clean 3-state machine
(`DRAFT → AWAITING_CLIENT_SIGNATURE → VALIDATED`), fix the missing `validateCra()`
export in `craClient.ts` that silently blocks the consultant action button, and
add structured blocking reasons, audit logging, signature invalidation on edit,
and idempotency guards throughout the backend.

---

## Included

### 1. Domain — state enum simplification

- `backend/.../ValidationStatus.java` — reduce to 3 values:
  `DRAFT`, `AWAITING_CLIENT_SIGNATURE`, `VALIDATED`.
  Remove `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED`.
- `backend/.../dto/CraStatus.java` — same 3 values, matching `ValidationStatus`.
- `backend/.../CraDetailsMapper.java` — update mapping to 3 states only.
- `backend/src/main/resources/db/migration/VN__simplify_cra_status.sql` —
  migrate existing rows: `READY_FOR_PROVIDER_SIGNATURE` → `DRAFT`,
  `SIGNED_BY_PROVIDER` → `DRAFT`, `FULLY_SIGNED` → `VALIDATED`.
  Update the enum/column constraint.

### 2. Backend — centralized transition guard

- `backend/.../domain/CraTransitionGuard.java` (new) — single class that
  declares allowed transitions:
  - `DRAFT → AWAITING_CLIENT_SIGNATURE` (consultant sign)
  - `AWAITING_CLIENT_SIGNATURE → VALIDATED` (client sign)
  - `AWAITING_CLIENT_SIGNATURE → DRAFT` (edit/reopen, invalidates consultant sig)
  - `VALIDATED → DRAFT` (edit/reopen, invalidates both sigs)
  Returns structured `List<BlockingReason>` instead of throwing generic errors.

### 3. Backend — consultant signature service (replaces CraValidationService)

- `backend/.../CraValidationService.java` — rewrite:
  - Accepts `ValidateCraRequestDto` (signature image, signer name, date, CRA hash).
  - Guards: CRA must be `DRAFT`; signature image must be a valid data URI;
    signer name must be non-blank; return structured blocking reasons if not met.
  - Atomic store: consultant signature image, signer name, signed timestamp,
    CRA content hash, then transition to `AWAITING_CLIENT_SIGNATURE`.
  - Idempotency: if already `AWAITING_CLIENT_SIGNATURE` with the same hash,
    return the current state without duplicating (no second transition).
  - Calls `CraAuditService.recordTransition(...)`.

### 4. Backend — client signature service

- `backend/.../ClientSignatureService.java` — rewrite:
  - CRA must be `AWAITING_CLIENT_SIGNATURE`; token must be valid and unexpired.
  - Atomic store: client signature image, representative name, signed timestamp,
    then transition to `VALIDATED`.
  - Idempotency: if already `VALIDATED` for the same token, return current state.
  - Expired or already-consumed tokens → structured 409 error, no state change.
  - Calls `CraAuditService.recordTransition(...)`.

### 5. Backend — edit/reopen (signature invalidation)

- `backend/.../MonthlyCraReport.java` (or a dedicated `CraReopenService`) —
  add `reopenForEdit()` that:
  - Accepts explicit confirmation flag; rejects without it.
  - Clears consultant and client signature fields.
  - Records a `SIGNATURE_INVALIDATED` audit event for each cleared signature.
  - Transitions back to `DRAFT`.
  - Callable from `AWAITING_CLIENT_SIGNATURE` or `VALIDATED`.
- `backend/.../web/CraReopenController.java` (new) —
  `POST /api/cras/{craId}/reopen` endpoint.

### 6. Backend — audit service

- `backend/.../CraAuditService.java` (new) — writes to an
  `cra_transition_event` table (new Flyway migration):
  - Columns: `id`, `cra_id`, `event_type`, `from_status`, `to_status`,
    `actor_id`, `actor_name`, `detail_json`, `occurred_at`.
  - Event types: `CONSULTANT_SIGNED`, `CLIENT_SIGNED`, `SIGNATURE_INVALIDATED`,
    `REOPEN_REQUESTED`, `TRANSITION_REJECTED`.
  - Called from validation service, client signature service, reopen, and
    transition guard on rejection.

### 7. Backend — read-only enforcement for VALIDATED

- `backend/.../CraEntryService.java` (or wherever CRA day entries are written) —
  add guard: if status is `VALIDATED`, reject entry mutations with structured
  error `cra_read_only` (HTTP 409).
- `backend/.../web/CraApiExceptionHandler.java` — add handler for
  `CraReadOnlyException` and `BlockedTransitionException` returning the
  `List<BlockingReason>` payload.

### 8. Backend — race condition / concurrency

- `backend/.../MonthlyCraReport.java` — add `@Version` optimistic-lock field if
  not already present. Both signature services acquire a pessimistic write lock
  (or rely on the version field) before transitioning.

### 9. Backend — remove dead multi-step workflow

- Delete `CraSignatureTransitionService.java`.
- Delete `CraSignatureController.java` (`/api/cras/{craId}/submit`,
  `sign-provider`, `send-to-client`).
- Keep `CraSignatureLinkController.java` (client link generation is still needed).
- Keep `PublicCraSigningController.java` — update to call the rewritten
  `ClientSignatureService`.

### 10. Frontend — fix missing API function (root cause of current failure)

- `frontend/src/api/craClient.ts` — add and export `validateCra()`:

  ```ts
  export function validateCra(
    craId: number,
    body: ValidateCraRequestDto
  ): Promise<CraDetailsDto>
  ```

  `POST /api/cras/{craId}/validate`, body: signature image, signer name, date,
  CRA hash.

### 11. Frontend — type definitions

- `frontend/src/api/types.ts` — reduce `CraStatus` union to:
  `'DRAFT' | 'AWAITING_CLIENT_SIGNATURE' | 'VALIDATED'`.
  Add `ValidateCraRequestDto` type (if missing) and `BlockingReason` type.

### 12. Frontend — CraValidation component

- `frontend/src/components/CraValidation/CraValidation.tsx`:
  - Rename primary button label to `Valider et signer le CRA`.
  - When prerequisites are not met, render an explicit list of `BlockingReason`
    items returned by the backend (replaces generic "not allowed").
  - On success, transition display to `AWAITING_CLIENT_SIGNATURE` state.

### 13. Frontend — CraSignatureStatus component

- `frontend/src/components/CraSignatureStatus/CraSignatureStatus.tsx`:
  - Map exactly 3 states to French labels:
    - `DRAFT` → `Brouillon`
    - `AWAITING_CLIENT_SIGNATURE` → `En attente de signature client`
    - `VALIDATED` → `Validé`
  - Remove mappings for the 3 deleted states.

### 14. Frontend — CraSignatureActions component

- `frontend/src/components/CraSignatureActions/CraSignatureActions.tsx`:
  - `DRAFT`: show `Valider et signer le CRA` (triggers `CraValidation` flow).
  - `AWAITING_CLIENT_SIGNATURE`: show link-copy / resend-link actions
    (using existing `CraSignatureLinkController` backend).
  - `VALIDATED`: show both signer names and signature dates (read from
    `CraDetailsDto`).
  - Remove branches for the 3 deleted states.

### 15. Tests

**Backend unit tests** (update/add):
- `CraValidationServiceTest` — happy path DRAFT→AWAITING_CLIENT_SIGNATURE,
  missing signature image, blank signer name, non-draft rejection (structured errors).
- `ClientSignatureServiceTest` — happy path AWAITING_CLIENT_SIGNATURE→VALIDATED,
  expired token, consumed token, client before consultant.
- `CraTransitionGuardTest` — every allowed and disallowed transition.
- `CraAuditServiceTest` — event written for each transition type.

**Backend integration tests** (update/add in `CraWorkflowIntegrationTest`):
- Full happy path DRAFT→AWAITING_CLIENT_SIGNATURE→VALIDATED.
- Current failing validation scenario (missing `validateCra` in client → now fixed).
- Client attempt before consultant signature.
- Duplicate consultant/client submissions (idempotency).
- Expired signature link.
- Concurrent submissions (optimistic lock collision).
- Reopen after consultant signature → DRAFT, signatures cleared, audit recorded.
- Reopen after both signatures → DRAFT, both signatures cleared, audit recorded.
- Entry mutation rejected on VALIDATED CRA.

**Frontend tests** (update):
- `CraValidation.test.tsx` — remove mocks for deleted states; add test for
  blocking-reason list rendering; verify button label.
- `CraSignatureStatus.test.tsx` — 3-state label assertions only.
- `CraSignatureActions.test.tsx` — 3-state branch coverage.

---

## Excluded

- Email or push notifications at any workflow step.
- UI for resending / copying the client signature link (link generation backend
  already exists; UI copy/resend can be a follow-up ticket).
- PDF generation or cover-page changes.
- CRA day-entry editing UI (the ticket blocks edits on VALIDATED; the edit UI
  itself is unchanged).
- Role/permission model changes beyond what the state guard already enforces.
- Any migration of historical CRA PDFs or archived records.

---

## Acceptance criteria

- A CRA in `DRAFT` with a valid consultant signature always reaches
  `AWAITING_CLIENT_SIGNATURE` without error.
- The current "validation not allowed" failure is reproducible before the fix and
  absent after (traced to missing `validateCra` export).
- Calling `POST /api/cras/{craId}/validate` on a non-draft CRA returns a
  structured error listing the exact blocking reasons (not a generic 4xx/message).
- Consultant signature atomically stores image, signer name, timestamp, and CRA
  hash, then sets status to `AWAITING_CLIENT_SIGNATURE`.
- Client signature atomically stores image, signer name, and timestamp, then sets
  status to `VALIDATED`.
- A client attempt before the consultant step is rejected with a structured error.
- `VALIDATED` status prevents CRA entry mutations (HTTP 409 `cra_read_only`).
- Reopening a signed CRA clears the affected signatures, emits audit events, and
  returns to `DRAFT`.
- Repeated `POST /validate` or `POST /sign` with the same payload are idempotent
  (no duplicate signatures or extra state transitions).
- Expired or already-consumed client links return a structured error with no state
  change.
- Every transition, invalidation, and rejection appears as a row in
  `cra_transition_event`.
- Frontend state, status label, and available actions are consistent after a full
  page refresh at each of the three states.
- All new and updated backend tests pass (`./mvnw test`).
- All new and updated frontend tests pass (`npm test`).
- No TypeScript compiler errors (`tsc --noEmit`).
