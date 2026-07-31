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

All changes are clean and correct. Here's a summary of everything implemented:

---

## Changes made — T067 fix (blocking issues resolved)

### Fix 1: Integration test status code mismatch (`CraValidationService.java`)

`validate()` now throws `CraValidatedException` immediately when `status != DRAFT` (before collecting other blocking reasons). This gives:
- Duplicate consultant validation → 409 `cra_validated` ✓ (matches the existing integration test)
- Invalid image on a DRAFT CRA → 422 `validation_blocked` ✓ (still uses `CraValidationBlockedException`)

The controller unit test mock of `CraValidatedException` is now aligned with real service behavior.

### Fix 2: Audit trail (`CraValidationService.java`, `ClientSignatureService.java`)

Both services now inject `CraAuditService` and call `recordTransition()` after each successful save:
- Consultant signature: `DRAFT → AWAITING_CLIENT_SIGNATURE` with `ActorType.CONSULTANT`
- Client signature: `AWAITING_CLIENT_SIGNATURE → VALIDATED` with `ActorType.CLIENT`

### Fix 3: Frontend blocking reasons (`CraValidation.tsx`)

When a `validation_blocked` error is returned, the component now extracts the `reasons` array from `e.detail` and renders each reason as a list item using French labels. `handleCancel` clears the reasons on dialog close.

### Fix 4: Missing integration tests (`CraSignatureWorkflowIntegrationTest.java`)

5 new tests added:
- `clientCannotSignWithoutValidToken` — signing with a fake token returns 404 `token_invalid`
- `reopenAfterConsultantSignatureReturnsToDraft` — `POST /reopen` from `AWAITING_CLIENT_SIGNATURE` → `DRAFT`
- `reopenAfterBothSignaturesReturnsToDraft` — reopen from `VALIDATED` → `DRAFT`
- `expiredSignatureLinkReturns410` — expired token (inserted directly via repository) returns 410 `token_expired`
- `concurrentConsultantValidationsProduceAtMostOneSuccess` — two concurrent validate threads produce ≤1 success

### Unit test update (`CraValidationServiceTest.java`)

- Added `CraAuditService` mock to `setUp`, updated constructor call
- Renamed `throwsValidationBlockedWithStatusNotDraftWhenNotInDraftStatus` → `throwsCraValidatedExceptionWhenNotInDraftStatus` (now expects `CraValidatedException`)
- Replaced `collectsBothBlockingReasonsWhenStatusNotDraftAndImageInvalid` → `throwsCraValidatedExceptionWhenNotDraftEvenIfImageAlsoInvalid`

---

## Review

La review est rédigée. Voici la décision finale :

IMPLEMENTATION_FIX_REQUIRED

---

**Résumé de la review :**

**Un bug bloquant identifié** : `ClientSignatureService.sign()` ne met pas à jour les champs `clientRepresentativeName`, `clientSignatureDate`, et `clientSignatureImage` sur `MonthlyCraReport`. Ces champs sont lus par `CraDetailsMapper.toDto()` — après signature client, le DTO les retourne à `null`, ce qui casse l'affichage "signer names + dates" en état VALIDATED.

**Correction requise** — ajouter avant `craRepository.save(cra)` dans `ClientSignatureService.sign()` :
```java
cra.setClientRepresentativeName(signerName);
cra.setClientSignatureDate(LocalDate.now());
cra.setClientSignatureImage(signatureImageBase64);
```

**Points secondaires** (non bloquants) :
- `CraValidationBlockingReason` manque `BLANK_SIGNER_NAME` — un nom vide retourne une erreur Bean Validation 400 au lieu du format structuré `validation_blocked`
- `CraAuditServiceTest` absent (requis par le plan)
- Pas de migrations Flyway (risque opérationnel sur données existantes)
- `CraTransitionGuard` non créé (écart de plan architectural)

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T067/reviews/implementation-review.md
- generated at: 2026-07-31T22:00:56Z

---

La review est rédigée. Voici la décision finale :

IMPLEMENTATION_FIX_REQUIRED

---

**Résumé de la review :**

**Un bug bloquant identifié** : `ClientSignatureService.sign()` ne met pas à jour les champs `clientRepresentativeName`, `clientSignatureDate`, et `clientSignatureImage` sur `MonthlyCraReport`. Ces champs sont lus par `CraDetailsMapper.toDto()` — après signature client, le DTO les retourne à `null`, ce qui casse l'affichage "signer names + dates" en état VALIDATED.

**Correction requise** — ajouter avant `craRepository.save(cra)` dans `ClientSignatureService.sign()` :
```java
cra.setClientRepresentativeName(signerName);
cra.setClientSignatureDate(LocalDate.now());
cra.setClientSignatureImage(signatureImageBase64);
```

**Points secondaires** (non bloquants) :
- `CraValidationBlockingReason` manque `BLANK_SIGNER_NAME` — un nom vide retourne une erreur Bean Validation 400 au lieu du format structuré `validation_blocked`
- `CraAuditServiceTest` absent (requis par le plan)
- Pas de migrations Flyway (risque opérationnel sur données existantes)
- `CraTransitionGuard` non créé (écart de plan architectural)