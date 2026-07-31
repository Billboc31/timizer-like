# T067 — Fix CRA validation workflow from draft to consultant and client signatures

**Source**: GitHub Issue #130

## Description

## Objective

Fix and simplify the CRA validation workflow to follow this exact business sequence:

```text
DRAFT
  → consultant validates the CRA and adds their signature
AWAITING_CLIENT_SIGNATURE
  → client reviews and signs
VALIDATED
```

## Current problem

The user cannot click `Valider le CRA` and receives a message saying validation is not allowed. The current state transitions and prerequisites are unclear or inconsistent with the expected business workflow.

## Required workflow

### 1. Draft

- The CRA is editable.
- The consultant can review entries, totals, and validation prerequisites.
- A visible `Valider et signer le CRA` action starts consultant validation.
- If validation is blocked, the UI must list the exact missing prerequisites instead of displaying a generic refusal.

### 2. Consultant validation and signature

- Clicking `Valider et signer le CRA` opens the consultant signature step.
- The consultant adds their signature and confirms.
- The backend atomically stores:
  - consultant signature;
  - signer identity;
  - signed timestamp;
  - signed CRA revision/hash;
  - transition from `DRAFT` to `AWAITING_CLIENT_SIGNATURE`.
- The client-signature invitation/link becomes available only after this step succeeds.

### 3. Client signature

- The client opens the secure signature page.
- The client can review the immutable CRA summary and sign it.
- Successful signature atomically stores the client signature and changes the state to `VALIDATED`.

### 4. Post-signature behavior

- A fully validated CRA is read-only by default.
- If the CRA is edited after either signature, both signatures must not silently remain valid.
- Reopening/editing must require explicit confirmation, invalidate the affected signatures, record the event, and return the CRA to `DRAFT`.
- Expired or already-consumed client links must not change state.

## State and authorization requirements

- Define allowed state transitions centrally in the domain/backend.
- Return structured validation errors and blocking reasons.
- Keep frontend controls consistent with backend permissions.
- Do not rely on the frontend alone to enforce transitions.
- Make state transitions idempotent where requests may be retried.
- Prevent simultaneous consultant/client validation races.
- Audit every signature, transition, invalidation, and failed transition attempt.

## UX requirements

- Display the current state using user-facing French labels:
  - `Brouillon`;
  - `En attente de signature client`;
  - `Validé`.
- In `DRAFT`, show the primary `Valider et signer le CRA` button when requirements are met.
- When requirements are not met, keep the reason visible and actionable.
- In `AWAITING_CLIENT_SIGNATURE`, display signature invitation status and actions to copy/resend the link when supported.
- In `VALIDATED`, display both signer names and signature dates.

## Acceptance criteria

- A valid draft can always enter the consultant signature step.
- The current validation failure is reproduced and fixed.
- A generic “not allowed” response is replaced with precise blocking reasons.
- Consultant signature changes the state to `AWAITING_CLIENT_SIGNATURE`.
- Client signature changes the state to `VALIDATED`.
- The client cannot sign before the consultant.
- The CRA cannot become `VALIDATED` without both signatures.
- Repeated requests do not create duplicate signatures or invalid transitions.
- Editing signed content explicitly invalidates signatures and returns the CRA to `DRAFT`.
- Frontend state, backend state, and available actions remain consistent after refresh.
- Transition and signature events are auditable.

## Testing requirements

Cover at least:

- valid happy path from draft to final validation;
- current failing validation scenario;
- missing consultant signature;
- client attempt before consultant signature;
- duplicate consultant/client submissions;
- expired signature link;
- concurrent submissions;
- editing after consultant signature;
- editing after both signatures;
- page refresh at each state.
