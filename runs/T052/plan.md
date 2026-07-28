## Objective

Introduce an explicit multi-step CRA signature workflow (DRAFT → READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE) with enforced transitions, per-state editing rules, and a frontend that displays the current status prominently and offers only valid next actions. Existing VALIDATED records are remapped to FULLY_SIGNED without a database migration.

## Included

### Backend — domain model

**`ValidationStatus.java`**
- Add: `READY_FOR_PROVIDER_SIGNATURE`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`
- Keep: `DRAFT`, `SIGNED_BY_PROVIDER` (already present, unused), `VALIDATED` (legacy — never written by new code, kept for existing DB rows)

**`CraStatus.java`** (DTO-layer enum, located in `dto/` package)
- Add: `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`
- Keep: `DRAFT`, `VALIDATED` (retained in frontend type as well for safety)

**`CraDetailsMapper.java`**
- Map each `ValidationStatus` value to its `CraStatus` counterpart
- `VALIDATED` → `FULLY_SIGNED` (backward-compat rule for existing rows)

### Backend — transition service

**`CraSignatureTransitionService.java`** (new service)
- Declare allowed transitions as a constant map: `DRAFT → READY_FOR_PROVIDER_SIGNATURE`, `READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER`, `SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE`
- `submit(Long craId)` — DRAFT → READY_FOR_PROVIDER_SIGNATURE
- `signByProvider(Long craId, LocalDate providerSignatureDate)` — READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER; sets `providerSignatureDate` on entity
- `sendToClient(Long craId)` — SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE
- Throw `InvalidCraTransitionException` when source state is not allowed for the requested action
- Throw `DuplicateCraTransitionException` when CRA is already in the target state

**`InvalidCraTransitionException.java`** / **`DuplicateCraTransitionException.java`** (new exceptions)

### Backend — API

**`CraSignatureController.java`** (new controller, replaces `CraValidationController`)
- `POST /api/cras/{craId}/submit` → delegates to `submit()`, returns `CraDetailsDto` (200)
- `POST /api/cras/{craId}/sign-provider` body `{ "providerSignatureDate": "YYYY-MM-DD" }` → delegates to `signByProvider()`, returns `CraDetailsDto` (200)
- `POST /api/cras/{craId}/send-to-client` → delegates to `sendToClient()`, returns `CraDetailsDto` (200)

**`CraApiExceptionHandler.java`**
- `InvalidCraTransitionException` → HTTP 409, error code `invalid_cra_transition`
- `DuplicateCraTransitionException` → HTTP 409, error code `duplicate_cra_transition`

**`CraDayUpdateService.java`**
- Replace the current `status != DRAFT` check with an explicit guard covering all non-DRAFT statuses (VALIDATED included)
- No logic change, just make the lock condition robust against the new enum values

**`CraPdfDownloadService.java`**
- Allow PDF for: `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` (legacy)
- Reject PDF for: `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE` (return `CraNotValidatedException`)

**`CraValidationController.java`** / **`CraValidationService.java`**
- Remove both (no callers once frontend is updated and integration tests are rewritten)

### Backend — tests

**`CraSignatureTransitionServiceTest.java`** (new unit test)
- Happy path for each of the three transitions
- `signByProvider` sets `providerSignatureDate` correctly
- `InvalidCraTransitionException` thrown for every forbidden source state (e.g., DRAFT → SIGNED_BY_PROVIDER)
- `DuplicateCraTransitionException` thrown when already in target state

**`CraSignatureWorkflowIntegrationTest.java`** (new integration test, replaces `CraWorkflowIntegrationTest.java`)
- Full DRAFT → READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE over HTTP
- Verify HTTP 200 and status field at each step
- Verify PDF download rejected for DRAFT and READY_FOR_PROVIDER_SIGNATURE (422)
- Verify PDF download accepted for SIGNED_BY_PROVIDER (200)
- Verify day-entry update rejected (409) for any non-DRAFT CRA
- Verify invalid transition (DRAFT → SIGNED_BY_PROVIDER) returns 409 `invalid_cra_transition`
- Verify repeated transition returns 409 `duplicate_cra_transition`

### Frontend — types and API client

**`api/types.ts`**
- `CraStatus`: extend to `'DRAFT' | 'READY_FOR_PROVIDER_SIGNATURE' | 'SIGNED_BY_PROVIDER' | 'AWAITING_CLIENT_SIGNATURE' | 'FULLY_SIGNED' | 'VALIDATED'`

**`api/craClient.ts`**
- Add `submitCra(craId: number): Promise<CraDetailsDto>`
- Add `signCraByProvider(craId: number, body: { providerSignatureDate: string }): Promise<CraDetailsDto>`
- Add `sendCraToClient(craId: number): Promise<CraDetailsDto>`
- Remove `validateCra` (or keep as deprecated if the old endpoint is kept for transition period)

### Frontend — components

**`components/CraSignatureStatus/CraSignatureStatus.tsx`** (new)
- Renders a color-coded badge + description label per status:
  - DRAFT → grey, "Brouillon"
  - READY_FOR_PROVIDER_SIGNATURE → blue, "En attente de signature prestataire"
  - SIGNED_BY_PROVIDER → amber, "Signé par le prestataire"
  - AWAITING_CLIENT_SIGNATURE → yellow, "En attente de signature client"
  - FULLY_SIGNED / VALIDATED → green, "Signé"
- Placed prominently in `CraSummaryPanel`

**`components/CraSignatureActions/CraSignatureActions.tsx`** (new, replaces `CraValidation`)
- DRAFT → "Soumettre pour signature" button → calls `submitCra`
- READY_FOR_PROVIDER_SIGNATURE → "Signer (prestataire)" button + date input → calls `signCraByProvider`
- SIGNED_BY_PROVIDER → "Envoyer au client" button → calls `sendCraToClient`
- AWAITING_CLIENT_SIGNATURE, FULLY_SIGNED, VALIDATED → no action button
- On success: calls `onSuccess(updatedCra)` callback to refresh parent state
- On error: displays inline error message from API response

**`components/CraSummaryPanel/CraSummaryPanel.tsx`**
- Replace the existing status badge with `<CraSignatureStatus status={cra.status} />`
- Add `<CraSignatureActions cra={cra} onSuccess={...} />` below

**`components/CraHistory/CraHistory.tsx`**
- Update status badge rendering to handle all new `CraStatus` values with matching labels and colors

**`components/CraValidation/CraValidation.tsx`**
- Remove (functionality moved to `CraSignatureActions`)

### Frontend — tests

**`components/CraSignatureStatus/CraSignatureStatus.test.tsx`** (new)
- Renders correct label and CSS class/color for each of the six status values

**`components/CraSignatureActions/CraSignatureActions.test.tsx`** (new)
- Shows "Soumettre" button only for DRAFT
- Shows "Signer" button + date input only for READY_FOR_PROVIDER_SIGNATURE
- Shows "Envoyer" button only for SIGNED_BY_PROVIDER
- Shows nothing for AWAITING_CLIENT_SIGNATURE and FULLY_SIGNED
- Calls correct API function and invokes `onSuccess` on 200
- Displays error message on API failure

**`api/__tests__/craClient.test.ts`**
- Add tests for `submitCra`, `signCraByProvider`, `sendCraToClient`
- Remove test for `validateCra` (or update if kept)

**`components/CraHistory/CraHistory.test.tsx`**
- Add fixture rows for each new status; verify label text rendered correctly

## Excluded

- Email delivery to client
- Client signature page (the page where the client actually signs)
- Qualified electronic signature certification (DocuSign, Adobe Sign, PKI)
- Changes to PDF content or PDF generation logic
- Changes to CRA creation or day-entry default-value logic
- Database schema migration script (Hibernate `ddl-auto=update` handles new enum values; VALIDATED rows are remapped in the mapper only)
- Keeping the old `POST /api/cras/{craId}/validate` endpoint for a transition period (it is simply removed)

## Acceptance criteria

- `ValidationStatus` contains at minimum: `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`
- `POST /api/cras/{id}/submit` returns 200 with `status: READY_FOR_PROVIDER_SIGNATURE` when source is DRAFT
- `POST /api/cras/{id}/sign-provider` returns 200 with `status: SIGNED_BY_PROVIDER` and the submitted `providerSignatureDate` when source is READY_FOR_PROVIDER_SIGNATURE
- `POST /api/cras/{id}/send-to-client` returns 200 with `status: AWAITING_CLIENT_SIGNATURE` when source is SIGNED_BY_PROVIDER
- Any transition from a non-allowed source state returns HTTP 409 with `{ "error": "invalid_cra_transition" }`
- Calling a transition when already in the target state returns HTTP 409 with `{ "error": "duplicate_cra_transition" }`
- `PATCH /api/cras/{id}/days/{date}` returns 409 for any CRA that is not in DRAFT state
- PDF download returns 422 for DRAFT and READY_FOR_PROVIDER_SIGNATURE; 200 for SIGNED_BY_PROVIDER, AWAITING_CLIENT_SIGNATURE, FULLY_SIGNED
- Existing DB rows with `status = 'VALIDATED'` appear as `FULLY_SIGNED` in all API responses without any DB migration
- Frontend `CraSignatureStatus` component renders a distinct label and color for each status
- Frontend `CraSignatureActions` component shows exactly one action button for DRAFT, READY_FOR_PROVIDER_SIGNATURE, and SIGNED_BY_PROVIDER; shows no button for the remaining states
- `CraSignatureTransitionServiceTest` covers every allowed transition and every rejected transition
- `CraSignatureWorkflowIntegrationTest` completes the full DRAFT → AWAITING_CLIENT_SIGNATURE workflow over HTTP without errors
