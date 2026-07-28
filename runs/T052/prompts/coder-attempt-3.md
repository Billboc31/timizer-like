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


# T052 — Add CRA signature workflow and signature status tracking

**Source**: GitHub Issue #97

## Description

## Context
A CRA now needs a clear lifecycle covering preparation, provider signature, client signature, and final completion.

## Goal
Introduce explicit signature states and enforce valid transitions throughout the application.

## Description
Extend the CRA model and APIs with a signature workflow such as draft, ready for provider signature, provider signed, awaiting client signature, and fully signed. Define which fields remain editable at each stage and which actions are available.

The frontend must display the current signature status prominently and present only valid next actions. Invalid or repeated signature operations must be rejected by the backend with a clear business error.

## Out of Scope
- Email delivery.
- Implementing the client signature page itself.
- Qualified electronic signature certification.

## Acceptance Criteria
- [ ] CRA signature statuses are explicitly represented in the domain model.
- [ ] Valid status transitions are documented and enforced server-side.
- [ ] The current status is clearly displayed in the CRA interface and history.
- [ ] Editing rules are enforced consistently after provider or client signature.
- [ ] Invalid and duplicate transitions return a clear error.
- [ ] Existing validated CRAs are migrated or mapped safely.
- [ ] Unit and integration tests cover every allowed and rejected transition.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

The implementation is complete. Here's the full summary:

---

## T052 — Implementation Complete

The CRA signature workflow was already implemented by the previous coder attempt (pre-sync commit `d86ff020`). The current session verified correctness and fixed one pre-existing bug.

### What was done

**Backend (all tests passing — 135/135):**
- `ValidationStatus` / `CraStatus` enums: all 5 new values added
- `CraDetailsMapper`: maps `VALIDATED → FULLY_SIGNED` for backward compat
- `CraSignatureTransitionService`: enforces `DRAFT → READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE` with duplicate/invalid guards
- `CraSignatureController`: `POST /submit`, `/sign-provider`, `/send-to-client`
- `CraApiExceptionHandler`: 409 for `invalid_cra_transition` and `duplicate_cra_transition`
- `CraDayUpdateService` / `CraPdfDownloadService`: correctly lock on non-DRAFT status
- Old `CraValidationController` / `CraValidationService` removed
- `CraSignatureTransitionServiceTest` (20 tests) + `CraSignatureWorkflowIntegrationTest` (full HTTP flow) added

**Frontend (all tests passing — 144/144):**
- `CraStatus` type, `craClient.ts` API functions all updated
- `CraSignatureStatus` component: color-coded badge for all 6 states
- `CraSignatureActions` component: context-aware buttons per state
- `CraSummaryPanel`, `CraHistory` updated for new statuses
- Fixed pre-existing broken imports in `CraHistory.axe.test.tsx` and `CraMonthSelector.axe.test.tsx` (`../../api/cra` → `../../api/craClient`)

---

## Review

I have all the information needed. Let me now write the formal review.

---

## T052 — CRA Signature Workflow: Implementation Review

### Scope Compliance

The implementation respects the ticket scope. Out-of-scope items (email delivery, client signature page, PDF content changes, qualified electronic signature) are absent. The old `CraValidationController` and `CraValidationService` are removed. Enum backward compatibility for `VALIDATED` rows is handled in the mapper, not via a DB migration — consistent with the plan.

---

### Correctness vs. Acceptance Criteria

| Criterion | Status |
|---|---|
| `ValidationStatus` contains all 5 new values | ✅ |
| `POST /submit` returns 200 with `READY_FOR_PROVIDER_SIGNATURE` | ✅ |
| `POST /sign-provider` returns 200 with `SIGNED_BY_PROVIDER` + date | ✅ |
| `POST /send-to-client` returns 200 with `AWAITING_CLIENT_SIGNATURE` | ✅ |
| Invalid transition → 409 `invalid_cra_transition` | ✅ |
| Duplicate transition → 409 `duplicate_cra_transition` | ✅ |
| `PATCH /days/{date}` returns 409 for non-DRAFT | ✅ |
| PDF returns 422 for DRAFT / READY_FOR_PROVIDER_SIGNATURE | ✅ |
| PDF returns 200 for SIGNED_BY_PROVIDER | ✅ |
| Existing VALIDATED rows appear as FULLY_SIGNED via mapper | ✅ |
| `CraSignatureStatus` renders distinct label/color per status | ✅ |
| `CraSignatureActions` shows correct button per status | ✅ |
| Unit tests cover all allowed and rejected transitions | ✅ |
| Integration test completes full DRAFT → AWAITING_CLIENT_SIGNATURE | ✅ |
| **Status clearly displayed in history** | ❌ |

---

### Blocking Issue

**`CraHistoryService.java:37-39` — History status always wrong for new workflow statuses**

```java
// Current (broken):
CraStatus status = report.getStatus() == ValidationStatus.VALIDATED
        ? CraStatus.VALIDATED
        : CraStatus.DRAFT;
```

This ternary predates the ticket and was never updated. Any CRA in `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, or `FULLY_SIGNED` state is emitted as `DRAFT` by `GET /api/cras`. The frontend `CraHistory.tsx` handles all six statuses correctly — but it never receives the right values because the backend silently downgrades them.

This directly violates the acceptance criterion: _"The current status is clearly displayed in the CRA interface and history."_

**Required fix** — one line change:

```java
// Fixed:
CraStatus status = CraDetailsMapper.mapStatus(report.getStatus());
```

The `mapStatus` utility already exists in `CraDetailsMapper` and handles all six enum values correctly (including the `VALIDATED → FULLY_SIGNED` backward-compat rule). Note that the `CraSummaryDto` constructor will need to accept `CraStatus` from the full mapping, which it already does since it takes a `CraStatus` parameter.

---

### Non-Blocking Observations

**1. `CraStatus.VALIDATED` declared but never emitted**
`CraDetailsMapper:48` maps `VALIDATED → FULLY_SIGNED`, so the frontend type `CraStatus` includes `VALIDATED` but the backend never sends it. The frontend switch statements defensively handle it — harmless, and consistent with the plan's backward-compat intent. After the fix above, `CraHistoryService` will also emit `FULLY_SIGNED` for old rows rather than `VALIDATED`.

**2. `FULLY_SIGNED` is an unreachable state for new CRAs**
No transition leads to `FULLY_SIGNED` from the new workflow — correct since the client signature page is out of scope. The enum value and mapper entry are appropriately speculative.

**3. `CraDayUpdateService` throws `CraValidatedException` for all non-DRAFT states**
The exception name is a legacy artifact ("validated" is not the only blocking state anymore). Not wrong at runtime — maps to 409 as required — but slightly misleading for future developers. Worth a follow-up rename (`CraNotEditableException`), not a blocker.

**4. Integration test stops at `AWAITING_CLIENT_SIGNATURE`**
Correct per scope. No FULLY_SIGNED transition to test.

---

### Summary

The transition service, controller, exception handler, mapper, PDF download guard, day-update guard, frontend components, and tests are all correctly implemented. One pre-existing method (`CraHistoryService.toSummary`) was not updated for the new enum values — causing all new workflow statuses to display as DRAFT in the history list. This is a clear runtime defect against an explicit acceptance criterion and must be fixed before approval.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T052/reviews/implementation-review.md
- generated at: 2026-07-28T10:43:39Z

---

I have all the information needed. Let me now write the formal review.

---

## T052 — CRA Signature Workflow: Implementation Review

### Scope Compliance

The implementation respects the ticket scope. Out-of-scope items (email delivery, client signature page, PDF content changes, qualified electronic signature) are absent. The old `CraValidationController` and `CraValidationService` are removed. Enum backward compatibility for `VALIDATED` rows is handled in the mapper, not via a DB migration — consistent with the plan.

---

### Correctness vs. Acceptance Criteria

| Criterion | Status |
|---|---|
| `ValidationStatus` contains all 5 new values | ✅ |
| `POST /submit` returns 200 with `READY_FOR_PROVIDER_SIGNATURE` | ✅ |
| `POST /sign-provider` returns 200 with `SIGNED_BY_PROVIDER` + date | ✅ |
| `POST /send-to-client` returns 200 with `AWAITING_CLIENT_SIGNATURE` | ✅ |
| Invalid transition → 409 `invalid_cra_transition` | ✅ |
| Duplicate transition → 409 `duplicate_cra_transition` | ✅ |
| `PATCH /days/{date}` returns 409 for non-DRAFT | ✅ |
| PDF returns 422 for DRAFT / READY_FOR_PROVIDER_SIGNATURE | ✅ |
| PDF returns 200 for SIGNED_BY_PROVIDER | ✅ |
| Existing VALIDATED rows appear as FULLY_SIGNED via mapper | ✅ |
| `CraSignatureStatus` renders distinct label/color per status | ✅ |
| `CraSignatureActions` shows correct button per status | ✅ |
| Unit tests cover all allowed and rejected transitions | ✅ |
| Integration test completes full DRAFT → AWAITING_CLIENT_SIGNATURE | ✅ |
| **Status clearly displayed in history** | ❌ |

---

### Blocking Issue

**`CraHistoryService.java:37-39` — History status always wrong for new workflow statuses**

```java
// Current (broken):
CraStatus status = report.getStatus() == ValidationStatus.VALIDATED
        ? CraStatus.VALIDATED
        : CraStatus.DRAFT;
```

This ternary predates the ticket and was never updated. Any CRA in `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, or `FULLY_SIGNED` state is emitted as `DRAFT` by `GET /api/cras`. The frontend `CraHistory.tsx` handles all six statuses correctly — but it never receives the right values because the backend silently downgrades them.

This directly violates the acceptance criterion: _"The current status is clearly displayed in the CRA interface and history."_

**Required fix** — one line change:

```java
// Fixed:
CraStatus status = CraDetailsMapper.mapStatus(report.getStatus());
```

The `mapStatus` utility already exists in `CraDetailsMapper` and handles all six enum values correctly (including the `VALIDATED → FULLY_SIGNED` backward-compat rule). Note that the `CraSummaryDto` constructor will need to accept `CraStatus` from the full mapping, which it already does since it takes a `CraStatus` parameter.

---

### Non-Blocking Observations

**1. `CraStatus.VALIDATED` declared but never emitted**
`CraDetailsMapper:48` maps `VALIDATED → FULLY_SIGNED`, so the frontend type `CraStatus` includes `VALIDATED` but the backend never sends it. The frontend switch statements defensively handle it — harmless, and consistent with the plan's backward-compat intent. After the fix above, `CraHistoryService` will also emit `FULLY_SIGNED` for old rows rather than `VALIDATED`.

**2. `FULLY_SIGNED` is an unreachable state for new CRAs**
No transition leads to `FULLY_SIGNED` from the new workflow — correct since the client signature page is out of scope. The enum value and mapper entry are appropriately speculative.

**3. `CraDayUpdateService` throws `CraValidatedException` for all non-DRAFT states**
The exception name is a legacy artifact ("validated" is not the only blocking state anymore). Not wrong at runtime — maps to 409 as required — but slightly misleading for future developers. Worth a follow-up rename (`CraNotEditableException`), not a blocker.

**4. Integration test stops at `AWAITING_CLIENT_SIGNATURE`**
Correct per scope. No FULLY_SIGNED transition to test.

---

### Summary

The transition service, controller, exception handler, mapper, PDF download guard, day-update guard, frontend components, and tests are all correctly implemented. One pre-existing method (`CraHistoryService.toSummary`) was not updated for the new enum values — causing all new workflow statuses to display as DRAFT in the history list. This is a clear runtime defect against an explicit acceptance criterion and must be fixed before approval.

IMPLEMENTATION_FIX_REQUIRED