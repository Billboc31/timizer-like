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

All changes look correct. Here's a summary of everything implemented:

---

## Changes made — T067 fix

### Backend (6 files)

| File | Change |
|------|--------|
| `CraSignatureToken.java` | Added 2-arg constructor — was missing, causing compilation failure in service and tests |
| `TokenExpiredException.java` | New class — needed for expired-token flow |
| `CraSignatureTokenService.java` | Added `isExpired()` check in both `resolveToken()` and `validateAndConsume()` |
| `CraValidationService.java` | Added `ObjectMapper` dep; validates data-URI format of signature image; computes SHA-256 content hash and stores it as `providerContentHash`; throws `CraValidationBlockedException` with structured reasons instead of generic `CraValidatedException` |
| `CraApiExceptionHandler.java` | Added handlers for `CraValidationBlockedException` (→ 422 with `reasons` list) and `TokenExpiredException` (→ 410 `token_expired`) |
| `CraValidationServiceTest.java` | Injected `ObjectMapper`; replaced `CraValidatedException` assertion with `CraValidationBlockedException`; added 3 new tests (null image, non-data-URI image, combined both blocking reasons) |

### Frontend (5 files)

| File | Change |
|------|--------|
| `apiError.ts` | Added `token_expired` and `validation_blocked` to `ApiErrorCode` union |
| `httpClient.ts` | Added both new codes to `toApiErrorCode` known-codes list |
| `errorMessages.ts` | Rebuilt `Record<ApiErrorCode, string>` to cover all 15 codes; removed non-existent `signature_too_large`/`signature_invalid_format` keys that caused TypeScript errors |
| `craClient.ts` | Added `reopenCra(craId)` calling `POST /api/cras/{craId}/reopen` |
| `CraHistoryDetail.tsx` | Added reopen button (with confirmation dialog) visible whenever status ≠ `DRAFT`; refreshes CRA after reopen |

---

## Review

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

---

## Instructions de fix

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