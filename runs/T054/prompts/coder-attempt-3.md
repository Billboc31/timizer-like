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


# T054 — Add client signature capture and approval page

**Source**: GitHub Issue #99

## Description

## Context
The client must be able to review and sign the provider-signed CRA from the secure public link.

## Goal
Provide a simple, professional client approval and signature experience without requiring an account.

## Description
Extend the public CRA review page with client signer name, optional role, explicit approval consent, and a touch- and mouse-compatible signature pad. Require the client to confirm that they approve the displayed CRA before submission.

On successful submission, store a snapshot of the signature, signer identity, signing timestamp, and the CRA content version that was approved. Mark the token as consumed and transition the CRA to fully signed.

## Out of Scope
- Legally qualified electronic signature.
- Editing the CRA from the public page.
- Rejecting with a threaded discussion workflow.

## Acceptance Criteria
- [ ] The client can review the complete CRA before signing.
- [ ] Signer name and explicit approval consent are required.
- [ ] Signature capture works with mouse and touch.
- [ ] Empty or invalid signatures cannot be submitted.
- [ ] Successful signing stores signer identity, signature, timestamp, and approved CRA snapshot.
- [ ] The same token cannot be used to sign twice.
- [ ] The client receives a clear success confirmation.
- [ ] Mobile, component, integration, and end-to-end tests cover the workflow.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 208 backend tests pass (207 + 1 new). Here's a summary of what was changed:

---

**BLOQUANT 1 — False positive:** The project uses Hibernate `ddl-auto: update`, not Flyway. No SQL migration files are needed — Hibernate manages the schema from JPA entity annotations automatically.

**BLOQUANT 2 — Fixed:** `IllegalArgumentException` for invalid signature image format now maps correctly to 400 Bad Request.

### Files changed

| File | Change |
|------|--------|
| `com/timizer/backend/cra/InvalidSignatureImageException.java` | **New** — dedicated exception for invalid signature image format |
| `com/timizerlike/cra/service/ClientSignatureService.java` | Throws `InvalidSignatureImageException` instead of `IllegalArgumentException` |
| `com/timizerlike/backend/cra/web/CraApiExceptionHandler.java` | Added `handleInvalidSignatureImage()` → 400 with `"error": "invalid_signature_image"` |
| `ClientSignatureServiceTest.java` | Updated 2 test names + expected exception type to `InvalidSignatureImageException` |
| `PublicCraSigningControllerTest.java` | Added `returns400WhenSignatureImageHasInvalidFormat()` test |

Total: **208 backend tests passing**, no regressions.

---

## Review

I now have all I need for a complete review. Let me write it.

---

## PR Review — T054 — Client Signature Capture and Approval Page

### Résumé

L'implémentation est substantielle et bien structurée : le flux complet existe côté backend (token, service de signature, exception handler) et côté frontend (page publique, formulaire, canvas, écran de succès). Les tests unitaires et les tests e2e Playwright sont présents. Trois problèmes bloquants ont été identifiés.

---

### Vérifications effectuées

- Lecture du code source backend : `ClientSignatureService`, `CraSignatureTokenService`, `CraApiExceptionHandler`, `CraValidationService`, `ValidationStatus`
- Lecture du code source frontend : `apiError.ts`, `httpClient.ts`, `ClientSignatureForm`, `SignatureCanvas`
- Lecture des tests : `ClientSignatureServiceTest`, `PublicCraSigningControllerTest`, `CraSignatureWorkflowIntegrationTest`, `client-signing.spec.ts`, `publicSignature.spec.ts`

---

### Points validés

- Signer name requis, trimmé avant envoi
- Consent checkbox obligatoire, vérifié côté client et côté serveur
- Canvas signature : PointerEvents (souris + touch), `touchAction: 'none'`, `isEmpty()` vérifié avant soumission
- Token à usage unique : `TokenAlreadyConsumedException` levée en base, 410 GONE renvoyé
- Snapshot CRA sérialisé en JSON à l'instant de signature (audit trail immutable)
- Timestamp `Instant.now()` persisté dans `CraClientSignatureRecord`
- Écran de succès avec nom du signataire et date (fr-FR)
- Tests unitaires backend : 18 cas `ClientSignatureServiceTest`, 8 cas `PublicCraSigningControllerTest`
- Tests composant frontend : `SignatureCanvasTest`, `ClientSignatureFormTest`, `CraSignaturePageTest`
- Tests e2e Playwright : `client-signing.spec.ts` (4 scénarios), `publicSignature.spec.ts` (2 scénarios)

---

### Problèmes détectés

#### BLOQUANT 1 — Mauvais statut final : `VALIDATED` au lieu de `FULLY_SIGNED`

**Fichier** : `ClientSignatureService.java:65`

```java
cra.setStatus(ValidationStatus.VALIDATED);
```

`ValidationStatus` possède les deux valeurs `FULLY_SIGNED` et `VALIDATED`. `FULLY_SIGNED` est dans l'enum mais n'est **jamais utilisé**. `VALIDATED` est le statut terminal de l'ancien flux mono-signataire (`CraValidationService.validate()` ligne 35), qui part de `DRAFT`. Le nouveau flux deux-signataires (`AWAITING_CLIENT_SIGNATURE → client sign`) arrive dans le même statut `VALIDATED`, rendant les deux chemins indiscernables a posteriori.

La correction attendue : `cra.setStatus(ValidationStatus.FULLY_SIGNED)`.

---

#### BLOQUANT 2 — Mismatch d'error codes entre backend et frontend

**Fichiers** : `CraApiExceptionHandler.java:95` / `httpClient.ts:6-19` / `apiError.ts:1-15`

Le backend émet `"invalid_signature_image"` (handler ligne 95). Le frontend reconnaît `"signature_too_large"` et `"signature_invalid_format"` (qui ne sont **jamais émis par le backend**). La valeur `"invalid_signature_image"` tombe donc dans `unknown_error` — feedback utilisateur dégradé.

Corrections attendues :
- Ajouter `'invalid_signature_image'` à `apiError.ts` et à la liste `known` de `httpClient.ts`
- Supprimer `'signature_too_large'` et `'signature_invalid_format'` (dead codes)

---

#### BLOQUANT 3 — Test d'intégration tronqué

**Fichier** : `CraSignatureWorkflowIntegrationTest.java:142`

Le test `fullSignatureWorkflow` s'arrête à l'assertion `AWAITING_CLIENT_SIGNATURE` (ligne 141). Il ne teste pas :
- la soumission effective de la signature client (`POST /public/cra-link/{token}/sign`)
- la transition vers le statut final
- l'impossibilité d'utiliser le même token deux fois
- la persistance du `CraClientSignatureRecord`

C'est le seul test d'intégration du ticket, et il ne couvre pas la partie critique ajoutée par T054.

---

### Risques éventuels (non bloquants)

- **Aucune expiration de token** : les tokens sont valides indéfiniment. Non requis par l'AC, mais risque à documenter pour la roadmap sécurité.
- **Pas de limite de taille sur `signatureImageBase64`** : une image très large peut être persistée. Validation uniquement sur le préfixe `data:image/`, pas sur la taille. Vecteur de stockage abusif potentiel.

---

### Décision

REQUEST_CHANGES — trois corrections bloquantes requises avant approbation.

### Actions demandées

1. **`ClientSignatureService.java:65`** — remplacer `ValidationStatus.VALIDATED` par `ValidationStatus.FULLY_SIGNED`
2. **`apiError.ts` + `httpClient.ts`** — remplacer `signature_too_large` et `signature_invalid_format` par `invalid_signature_image` dans la liste des codes connus
3. **`CraSignatureWorkflowIntegrationTest.java`** — compléter `fullSignatureWorkflow` avec : appel `POST /public/cra-link/{token}/sign`, assertion statut `FULLY_SIGNED`, tentative de re-signature avec le même token (assertion 410 GONE)

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T054/reviews/implementation-review.md
- generated at: 2026-07-28T21:49:29Z

---

I now have all I need for a complete review. Let me write it.

---

## PR Review — T054 — Client Signature Capture and Approval Page

### Résumé

L'implémentation est substantielle et bien structurée : le flux complet existe côté backend (token, service de signature, exception handler) et côté frontend (page publique, formulaire, canvas, écran de succès). Les tests unitaires et les tests e2e Playwright sont présents. Trois problèmes bloquants ont été identifiés.

---

### Vérifications effectuées

- Lecture du code source backend : `ClientSignatureService`, `CraSignatureTokenService`, `CraApiExceptionHandler`, `CraValidationService`, `ValidationStatus`
- Lecture du code source frontend : `apiError.ts`, `httpClient.ts`, `ClientSignatureForm`, `SignatureCanvas`
- Lecture des tests : `ClientSignatureServiceTest`, `PublicCraSigningControllerTest`, `CraSignatureWorkflowIntegrationTest`, `client-signing.spec.ts`, `publicSignature.spec.ts`

---

### Points validés

- Signer name requis, trimmé avant envoi
- Consent checkbox obligatoire, vérifié côté client et côté serveur
- Canvas signature : PointerEvents (souris + touch), `touchAction: 'none'`, `isEmpty()` vérifié avant soumission
- Token à usage unique : `TokenAlreadyConsumedException` levée en base, 410 GONE renvoyé
- Snapshot CRA sérialisé en JSON à l'instant de signature (audit trail immutable)
- Timestamp `Instant.now()` persisté dans `CraClientSignatureRecord`
- Écran de succès avec nom du signataire et date (fr-FR)
- Tests unitaires backend : 18 cas `ClientSignatureServiceTest`, 8 cas `PublicCraSigningControllerTest`
- Tests composant frontend : `SignatureCanvasTest`, `ClientSignatureFormTest`, `CraSignaturePageTest`
- Tests e2e Playwright : `client-signing.spec.ts` (4 scénarios), `publicSignature.spec.ts` (2 scénarios)

---

### Problèmes détectés

#### BLOQUANT 1 — Mauvais statut final : `VALIDATED` au lieu de `FULLY_SIGNED`

**Fichier** : `ClientSignatureService.java:65`

```java
cra.setStatus(ValidationStatus.VALIDATED);
```

`ValidationStatus` possède les deux valeurs `FULLY_SIGNED` et `VALIDATED`. `FULLY_SIGNED` est dans l'enum mais n'est **jamais utilisé**. `VALIDATED` est le statut terminal de l'ancien flux mono-signataire (`CraValidationService.validate()` ligne 35), qui part de `DRAFT`. Le nouveau flux deux-signataires (`AWAITING_CLIENT_SIGNATURE → client sign`) arrive dans le même statut `VALIDATED`, rendant les deux chemins indiscernables a posteriori.

La correction attendue : `cra.setStatus(ValidationStatus.FULLY_SIGNED)`.

---

#### BLOQUANT 2 — Mismatch d'error codes entre backend et frontend

**Fichiers** : `CraApiExceptionHandler.java:95` / `httpClient.ts:6-19` / `apiError.ts:1-15`

Le backend émet `"invalid_signature_image"` (handler ligne 95). Le frontend reconnaît `"signature_too_large"` et `"signature_invalid_format"` (qui ne sont **jamais émis par le backend**). La valeur `"invalid_signature_image"` tombe donc dans `unknown_error` — feedback utilisateur dégradé.

Corrections attendues :
- Ajouter `'invalid_signature_image'` à `apiError.ts` et à la liste `known` de `httpClient.ts`
- Supprimer `'signature_too_large'` et `'signature_invalid_format'` (dead codes)

---

#### BLOQUANT 3 — Test d'intégration tronqué

**Fichier** : `CraSignatureWorkflowIntegrationTest.java:142`

Le test `fullSignatureWorkflow` s'arrête à l'assertion `AWAITING_CLIENT_SIGNATURE` (ligne 141). Il ne teste pas :
- la soumission effective de la signature client (`POST /public/cra-link/{token}/sign`)
- la transition vers le statut final
- l'impossibilité d'utiliser le même token deux fois
- la persistance du `CraClientSignatureRecord`

C'est le seul test d'intégration du ticket, et il ne couvre pas la partie critique ajoutée par T054.

---

### Risques éventuels (non bloquants)

- **Aucune expiration de token** : les tokens sont valides indéfiniment. Non requis par l'AC, mais risque à documenter pour la roadmap sécurité.
- **Pas de limite de taille sur `signatureImageBase64`** : une image très large peut être persistée. Validation uniquement sur le préfixe `data:image/`, pas sur la taille. Vecteur de stockage abusif potentiel.

---

### Décision

REQUEST_CHANGES — trois corrections bloquantes requises avant approbation.

### Actions demandées

1. **`ClientSignatureService.java:65`** — remplacer `ValidationStatus.VALIDATED` par `ValidationStatus.FULLY_SIGNED`
2. **`apiError.ts` + `httpClient.ts`** — remplacer `signature_too_large` et `signature_invalid_format` par `invalid_signature_image` dans la liste des codes connus
3. **`CraSignatureWorkflowIntegrationTest.java`** — compléter `fullSignatureWorkflow` avec : appel `POST /public/cra-link/{token}/sign`, assertion statut `FULLY_SIGNED`, tentative de re-signature avec le même token (assertion 410 GONE)

---

IMPLEMENTATION_FIX_REQUIRED