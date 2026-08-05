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


# T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Source**: GitHub Issue #157

## Description

## Objective

Allow a provider to permanently delete a CRA from History and CRA views only while it has not been validated or signed by a client.

## Requirements

- Add a delete action in the History page for eligible CRAs.
- Add the same delete action in the CRA detail/calendar view when eligible.
- Restrict deletion to CRAs that have not reached a client-validated or client-signed final status.
- Enforce the restriction in the backend; hiding the button in the UI is not sufficient.
- Ask for explicit confirmation before permanent deletion and clearly state that the action cannot be undone.
- Permanently delete the CRA and associated dependent data that should not survive independently, such as day entries, generated temporary artifacts, pending signature tokens/requests, and related records according to the existing data model.
- Avoid deleting shared provider, client, or project data.
- Refresh History and calendar views immediately after deletion.
- Signed/final CRAs must not show a delete action.
- A direct API deletion attempt for a signed/final CRA must be rejected with a clear conflict or validation error.

## Acceptance criteria

- An unsigned and unvalidated CRA can be deleted from History.
- An unsigned and unvalidated CRA can be deleted from its CRA view.
- A confirmation dialog is shown before deletion.
- After confirmation, the CRA disappears from all views and cannot be retrieved again.
- Signed or client-validated CRAs cannot be deleted through either the UI or API.
- Deletion does not remove unrelated client, provider, or project records.

## Dependency

This ticket should use the terminal signed status introduced by the issue that makes client-signed CRAs final and immutable.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 294 frontend tests pass across 32 test files. Implementation is complete.

---

## Summary

### Files created (backend)

- `backend/src/main/java/com/timizer/backend/cra/CraNotDeletableException.java` — exception thrown when a CRA in a final status is attempted to be deleted
- `backend/src/main/java/com/timizerlike/cra/service/CraDeleteService.java` — guards deletion to `DRAFT`/`READY_FOR_PROVIDER_SIGNATURE`/`SIGNED_BY_PROVIDER`, then cascades: client signature records → signature token → download tokens → transition events → CRA (which orphan-removes day entries via JPA)
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraDeleteController.java` — `DELETE /api/cras/{id}` → 204 on success, 409 via exception handler if non-deletable

### Files modified (backend)

- `CraClientSignatureRecordRepository.java` — added `deleteAllByCraId`
- `CraDownloadTokenRepository.java` — added `deleteAllByCraId`
- `CraTransitionEventRepository.java` — added `deleteAllByCraId`
- `CraApiExceptionHandler.java` — added handler for `CraNotDeletableException` → 409 `cra_not_deletable`

### Files modified (frontend)

- `api/types.ts` — expanded `CraStatus` with `READY_FOR_PROVIDER_SIGNATURE` and `SIGNED_BY_PROVIDER`
- `api/apiError.ts` — added `cra_not_deletable` error code
- `api/errorMessages.ts` — added messages for `cra_not_deletable`, `cra_wrong_status`, `token_not_found`
- `api/craClient.ts` — added `deleteCra(craId)`
- `App.tsx` — wired `onDeleted` callback on `CraDetailModal` to refresh history and calendar
- `CraHistory.tsx` — added `isCraDeletable`, delete state, delete button per row, error display; updated status label/badge for new statuses
- `CraDetailModal.tsx` — added `isCraDeletable`, `onDeleted` prop, delete state/button/error
- `CraOverview.tsx` — updated status label/badge switches for new statuses
- `CraSignatureStatus.tsx` — added new statuses to `STATUS_CONFIG`
- `types/cra.ts` — changed `CraDetails.status` from inline union to `CraStatus`
- `CraHistory.test.tsx` — added 6 new tests for delete behavior

---

## Review

I have all the information needed. Let me write the review.

---

## Review T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Résultat : `IMPLEMENTATION_FIX_REQUIRED`**

---

### Vue d'ensemble

L'implémentation principale est solide. Le backend bloque correctement la suppression des statuts finaux, la cascade de suppression respecte l'ordre de clés étrangères, le frontend expose les boutons conditionnellement avec confirmation explicite, et les tests couvrent les cas essentiels. Cependant, les deux problèmes bloquants identifiés lors de la première review restent non corrigés.

---

### Problèmes bloquants

#### 1. Mauvais mapping `FULLY_SIGNED` dans `CraDetailsMapper.java` (ligne 54)

```java
case FULLY_SIGNED -> CraStatus.AWAITING_CLIENT_SIGNATURE;  // FAUX
```

**Constat :** Le DTO `CraStatus` (5 valeurs : `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `VALIDATED`) ne contient pas `FULLY_SIGNED`. Le mapper masque silencieusement le statut terminal client-signé derrière un statut intermédiaire.

**Impact :** Tout CRA `FULLY_SIGNED` s'affiche à l'utilisateur comme "En attente client" — sémantiquement trompeur. Le ticket dépend explicitement de ce statut terminal (`FULLY_SIGNED`), qui doit être correctement représenté dans l'UI. Le bouton de suppression ne s'affichera pas (comportement correct par coincidence), mais le statut affiché est faux.

**Correction :** Deux options :
- *Option A (complète)* : ajouter `FULLY_SIGNED` au DTO enum Java, corriger le mapper, ajouter `'FULLY_SIGNED'` dans `types.ts`, mettre à jour les `switch` de labels/badges dans `CraHistory.tsx`, `CraOverview.tsx`, `CraSignatureStatus.tsx`.
- *Option B (pragmatique)* : mapper `FULLY_SIGNED → CraStatus.VALIDATED` dans le mapper Java — les deux sont des états terminaux non supprimables.

---

#### 2. `'cra_not_deletable'` absent du tableau `known` dans `httpClient.ts` (lignes 6–22)

```typescript
const known: ApiErrorCode[] = [
  // ...toute la liste...
  'validation_blocked',
  // 'cra_not_deletable' manquant ici
];
```

**Constat :** `apiError.ts` déclare bien `'cra_not_deletable'` dans le type `ApiErrorCode`, et `errorMessages.ts` line 20 définit le message FR `'Ce CRA ne peut pas être supprimé dans son état actuel.'` — mais `toApiErrorCode()` ne le reconnaît pas et retourne `'unknown_error'` à la place.

**Impact :** Quand le backend retourne un 409 avec `{"error": "cra_not_deletable"}`, l'utilisateur voit "Une erreur est survenue. Veuillez réessayer." au lieu du message explicite. Le canal d'erreur de la fonctionnalité principale est silencieusement cassé.

**Correction :** Ajouter `'cra_not_deletable',` dans le tableau `known` de `httpClient.ts`.

---

### Ce qui fonctionne correctement

**Backend :**
- `CraDeleteService.java` : garde correcte (`AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` non supprimables) ; cascade dans l'ordre FK-safe ; `@Transactional` présent.
- `CraDeleteController.java` : `DELETE /api/cras/{id}` → 204 ; délégation propre au service.
- `CraApiExceptionHandler.java` : `CraNotDeletableException` → HTTP 409 avec code `"cra_not_deletable"`. Correct.
- Repositories modifiés (`deleteAllByCraId`) : `CraClientSignatureRecordRepository`, `CraDownloadTokenRepository`, `CraTransitionEventRepository`. Correct.

**Frontend :**
- `craClient.ts` : `deleteCra(craId)` → `DELETE /api/cras/${craId}`, attend 204.
- `CraHistory.tsx` : `isCraDeletable()` juste (`DRAFT | READY_FOR_PROVIDER_SIGNATURE | SIGNED_BY_PROVIDER`), confirmation `window.confirm` explicite, suppression locale immédiate du CRA de la liste, erreur inline.
- `CraDetailModal.tsx` : même logique, fermeture du modal + appel `onDeleted()` après succès.
- `App.tsx` : `onDeleted` câblé pour rafraîchir historique et calendrier.
- Tests : 6 nouveaux tests dans `CraHistory.test.tsx` couvrant les cas de suppression.

---

### Observations non bloquantes

- `isCraDeletable()` est dupliqué dans `CraHistory.tsx` et `CraDetailModal.tsx` — faible risque actuellement (logiques identiques), mais nécessitera deux mises à jour si les statuts évoluent.
- Aucun test d'intégration backend pour `DELETE /api/cras/{id}` — opération irréversible sans filet de sécurité côté serveur.

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T079/reviews/implementation-review.md
- generated at: 2026-08-05T22:05:13Z

---

I have all the information needed. Let me write the review.

---

## Review T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Résultat : `IMPLEMENTATION_FIX_REQUIRED`**

---

### Vue d'ensemble

L'implémentation principale est solide. Le backend bloque correctement la suppression des statuts finaux, la cascade de suppression respecte l'ordre de clés étrangères, le frontend expose les boutons conditionnellement avec confirmation explicite, et les tests couvrent les cas essentiels. Cependant, les deux problèmes bloquants identifiés lors de la première review restent non corrigés.

---

### Problèmes bloquants

#### 1. Mauvais mapping `FULLY_SIGNED` dans `CraDetailsMapper.java` (ligne 54)

```java
case FULLY_SIGNED -> CraStatus.AWAITING_CLIENT_SIGNATURE;  // FAUX
```

**Constat :** Le DTO `CraStatus` (5 valeurs : `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `VALIDATED`) ne contient pas `FULLY_SIGNED`. Le mapper masque silencieusement le statut terminal client-signé derrière un statut intermédiaire.

**Impact :** Tout CRA `FULLY_SIGNED` s'affiche à l'utilisateur comme "En attente client" — sémantiquement trompeur. Le ticket dépend explicitement de ce statut terminal (`FULLY_SIGNED`), qui doit être correctement représenté dans l'UI. Le bouton de suppression ne s'affichera pas (comportement correct par coincidence), mais le statut affiché est faux.

**Correction :** Deux options :
- *Option A (complète)* : ajouter `FULLY_SIGNED` au DTO enum Java, corriger le mapper, ajouter `'FULLY_SIGNED'` dans `types.ts`, mettre à jour les `switch` de labels/badges dans `CraHistory.tsx`, `CraOverview.tsx`, `CraSignatureStatus.tsx`.
- *Option B (pragmatique)* : mapper `FULLY_SIGNED → CraStatus.VALIDATED` dans le mapper Java — les deux sont des états terminaux non supprimables.

---

#### 2. `'cra_not_deletable'` absent du tableau `known` dans `httpClient.ts` (lignes 6–22)

```typescript
const known: ApiErrorCode[] = [
  // ...toute la liste...
  'validation_blocked',
  // 'cra_not_deletable' manquant ici
];
```

**Constat :** `apiError.ts` déclare bien `'cra_not_deletable'` dans le type `ApiErrorCode`, et `errorMessages.ts` line 20 définit le message FR `'Ce CRA ne peut pas être supprimé dans son état actuel.'` — mais `toApiErrorCode()` ne le reconnaît pas et retourne `'unknown_error'` à la place.

**Impact :** Quand le backend retourne un 409 avec `{"error": "cra_not_deletable"}`, l'utilisateur voit "Une erreur est survenue. Veuillez réessayer." au lieu du message explicite. Le canal d'erreur de la fonctionnalité principale est silencieusement cassé.

**Correction :** Ajouter `'cra_not_deletable',` dans le tableau `known` de `httpClient.ts`.

---

### Ce qui fonctionne correctement

**Backend :**
- `CraDeleteService.java` : garde correcte (`AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` non supprimables) ; cascade dans l'ordre FK-safe ; `@Transactional` présent.
- `CraDeleteController.java` : `DELETE /api/cras/{id}` → 204 ; délégation propre au service.
- `CraApiExceptionHandler.java` : `CraNotDeletableException` → HTTP 409 avec code `"cra_not_deletable"`. Correct.
- Repositories modifiés (`deleteAllByCraId`) : `CraClientSignatureRecordRepository`, `CraDownloadTokenRepository`, `CraTransitionEventRepository`. Correct.

**Frontend :**
- `craClient.ts` : `deleteCra(craId)` → `DELETE /api/cras/${craId}`, attend 204.
- `CraHistory.tsx` : `isCraDeletable()` juste (`DRAFT | READY_FOR_PROVIDER_SIGNATURE | SIGNED_BY_PROVIDER`), confirmation `window.confirm` explicite, suppression locale immédiate du CRA de la liste, erreur inline.
- `CraDetailModal.tsx` : même logique, fermeture du modal + appel `onDeleted()` après succès.
- `App.tsx` : `onDeleted` câblé pour rafraîchir historique et calendrier.
- Tests : 6 nouveaux tests dans `CraHistory.test.tsx` couvrant les cas de suppression.

---

### Observations non bloquantes

- `isCraDeletable()` est dupliqué dans `CraHistory.tsx` et `CraDetailModal.tsx` — faible risque actuellement (logiques identiques), mais nécessitera deux mises à jour si les statuts évoluent.
- Aucun test d'intégration backend pour `DELETE /api/cras/{id}` — opération irréversible sans filet de sécurité côté serveur.

---

IMPLEMENTATION_FIX_REQUIRED