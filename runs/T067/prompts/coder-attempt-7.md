# GLOBAL CONTEXT

# Global Context — Timizer Like

## Project

- project_id: timizer-like
- repo: git@github.com:Billboc31/timizer-like.git

## AI Dev Factory

This project uses AI Dev Factory for AI-assisted development.

Agent context folders:
- `ai/` — roles and skills
- `docs/` — project documentation
- `prompts/` — ticket-specific and generic prompts
- `runs/` — per-ticket runtime artifacts
- `tickets/` — ticket definitions

---

# ROLE

# Role — Coder

## Mission

Implémenter strictement un ticket en suivant le plan validé et les skills applicables.

## Tu dois

- lire le ticket
- lire le plan validé
- respecter le scope
- lister les fichiers créés ou modifiés
- produire un changement minimal, lisible et testable
- ajouter ou adapter les tests si nécessaire
- signaler les hypothèses et limites

## Tu ne dois pas

- élargir le ticket
- réécrire l’architecture sans demande explicite
- faire un refactor massif non demandé
- modifier la mémoire projet sauf si le ticket le demande explicitement
- masquer les erreurs ou incertitudes

## Sortie attendue

- résumé des changements
- liste des fichiers modifiés
- vérifications effectuées
- limites connues

## Règles

- coder uniquement après `PLAN_APPROVED`
- ne jamais contourner les contraintes du plan
- garder les changements petits et reviewables

---

# SKILL: workflow-discipline

# Skill — Workflow Discipline

## Objectif

Faire respecter le lifecycle officiel des tickets et PR IA.

## Règles

- respecter l’ordre des étapes du workflow
- ne pas bypass les reviews obligatoires
- maintenir les statuts cohérents
- conserver les artefacts versionnés
- séparer plan, implémentation et mémoire

## Refuser si

- une review obligatoire est sautée
- la mémoire est mise à jour avant validation implémentation
- le workflow officiel est contourné

---

# SKILL: git-discipline

# Skill — Git Discipline

## Objectif

Maintenir un historique Git propre, compréhensible et traçable.

## Règles

- un ticket = une unité de travail cohérente
- éviter les commits mélangeant plusieurs sujets
- utiliser des messages de commit explicites
- conserver les PR lisibles
- éviter les modifications hors scope
- maintenir les fichiers mémoire cohérents avec les changements réels

## Refuser si

- la PR mélange plusieurs fonctionnalités
- des changements non liés sont ajoutés
- les commits deviennent impossibles à reviewer

---

# SKILL: code-quality

# Skill — Code Quality

## Objectif

Produire des changements simples, lisibles, robustes et faciles à reviewer.

## Règles

- privilégier le code simple avant le code sophistiqué
- utiliser des noms explicites
- garder des fonctions courtes et lisibles
- éviter la magie cachée
- gérer les erreurs explicitement
- ajouter des logs utiles sans bruit excessif
- éviter les dépendances inutiles
- conserver un changement borné au ticket

## Refuser si

- le code devient inutilement complexe
- le ticket introduit une dépendance non justifiée
- les erreurs sont masquées
- les changements dépassent le scope demandé

---

# SKILL: refactor-safety

# Skill — Refactor Safety

## Objectif

Limiter les régressions et les dérives de scope lors des modifications.

## Règles

- modifier uniquement le périmètre demandé
- éviter les refactors transversaux implicites
- préserver les comportements existants
- maintenir la compatibilité sauf demande explicite
- privilégier des changements incrémentaux

## Refuser si

- le ticket dérive vers une réécriture globale
- plusieurs couches sont modifiées sans justification
- le comportement change silencieusement

---

# SKILL: security

# Skill — Security

## Objectif

Réduire les risques de sécurité et éviter les comportements dangereux.

## Règles

- ne pas exposer de secrets dans logs ou documentation
- limiter les permissions au strict nécessaire
- éviter les exécutions implicites dangereuses
- valider les entrées externes
- documenter les impacts sécurité importants
- éviter les comportements destructifs implicites

## Refuser si

- des secrets sont hardcodés
- des données sensibles sont logguées
- une opération destructive n’est pas explicitement contrôlée

---

# TASK

# Generic Coder Task

Read the ticket and the approved plan below, then implement the required changes.

The implementation must:
- follow the approved plan strictly
- remain within scope
- list all created or modified files
- be minimal, readable, and testable

The ticket follows.


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

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Fix applied. `ClientSignatureServiceTest:44` now passes all 5 arguments to the `ClientSignatureService` constructor — adding the `CraAuditService` mock field and wiring it into `setUp()`. The compilation error is resolved.

---

## Review

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

---

## Instructions de fix

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