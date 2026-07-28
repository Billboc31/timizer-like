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

207 tests pass (208 before, minus the 1 removed). Done.

**Change made:** Removed `returns409WhenCraNotInSignedByProviderStatus` from `PublicCraSigningControllerTest.java` (lines 131-140) and its now-unused `CraNotSignedByProviderException` import. The test documented an impossible scenario — `ClientSignatureService.sign()` can never throw that exception; a wrong CRA status at signing time always produces `TokenAlreadyConsumedException` (→ 410), which is already covered by the existing `returns410WhenTokenAlreadyConsumed` test.

---

## Review

Now I have everything I need. Let me write the review.

---

# PR Review — T054: Add client signature capture and approval page

## Résumé

Implémentation du formulaire de signature client sur la page publique CRA (31 fichiers source). Le périmètre est respecté : capture de signature tactile/souris, consentement explicite, identité signataire, snapshot du CRA, consommation du token, transition `AWAITING_CLIENT_SIGNATURE → FULLY_SIGNED`. Le fix de la review précédente (test inatteignable 409) a bien été appliqué. Un **bug bloquant** est identifié dans la couche HTTP frontend qui rend le flux de signature non fonctionnel en production.

## Vérifications effectuées

- Lecture de `runs/T054/reviews/implementation-review.md` (review précédente)
- Vérification que le fix demandé (suppression `returns409WhenCraNotInSignedByProviderStatus`) a bien été appliqué dans `PublicCraSigningControllerTest.java`
- Lecture de tous les fichiers clés : `ClientSignatureService.java`, `CraSignatureTokenService.java`, `PublicCraSigningController.java`, `CraApiExceptionHandler.java`, `CraSignatureToken.java`, `CraClientSignatureRecord.java`, `ValidationStatus.java`
- Lecture du frontend : `httpClient.ts`, `craPublicClient.ts`, `CraSignaturePage.tsx`, `ClientSignatureForm.tsx`, `SignatureCanvas.tsx`, `SigningSuccessScreen.tsx`, `main.tsx`
- Lecture des tests : `PublicCraSigningControllerTest.java` (6 tests, 409 retiré ✅), `CraSignatureWorkflowIntegrationTest.java`, `ClientSignatureForm.test.tsx`, `CraSignaturePage.test.tsx`, `client-signing.spec.ts`, `publicSignature.spec.ts`
- Vérification croisée des comportements HTTP backend/frontend

## Points validés

- **Sécurité token** : 32 bytes via `SecureRandom`, SHA-256 persisté uniquement. Correct.
- **Consommation idempotente** : `validateAndConsume` vérifie `isConsumed()` ET le statut CRA (`AWAITING_CLIENT_SIGNATURE`) avant de marquer `consumedAt`. Rollback transactionnel si erreur post-consommation. Correct.
- **Ordre de validation** : consentement et format d'image validés _avant_ la consommation du token (échec anticipé sans brûler le lien). Correct.
- **Snapshot** : CRA sérialisé en JSON au moment de la signature et stocké dans `cra_content_snapshot`. Immuable par construction. Correct.
- **Submit gating** : bouton désactivé jusqu'à `signerName.trim().length > 0 && consentApproved && padNonEmpty && !submitting`. Correct.
- **Canvas signature** : implémentation custom Pointer Events API — `touchAction: none`, `setPointerCapture`, `onPointerLeave` protège contre les glissements hors canvas. Correct.
- **Test unitaires backend** : `ClientSignatureServiceTest`, `CraSignatureTokenServiceTest` couvrent happy path, consent false, format image invalide, token consommé/introuvable. Correct.
- **Intégration** : `CraSignatureWorkflowIntegrationTest` valide le workflow complet DRAFT → FULLY_SIGNED et le 410 sur re-soumission. Correct.
- **Fix précédent appliqué** : `PublicCraSigningControllerTest.java` ne contient plus que 6 tests, le cas `returns409WhenCraNotInSignedByProviderStatus` est supprimé. ✅

## Problèmes détectés

### 1. [BLOQUANT] `handleResponse<T>` appelle `res.json()` sur un body 200 vide — le flux de signature est non fonctionnel

**Fichier** : `frontend/src/api/httpClient.ts:27`

```typescript
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;  // ← bug
  }
  ...
}
```

`POST /public/cra-link/{token}/sign` → `PublicCraSigningController.sign()` retourne `void` → Spring écrit une réponse HTTP 200 avec un **body vide** (Content-Length: 0).

`apiPost<void>` → `handleResponse<void>` → `res.json()` sur un body vide → `SyntaxError: Unexpected end of JSON input`.

Ce `SyntaxError` n'est pas une `ApiError`, donc le `catch` de `handleSubmit` entre dans la branche générique et affiche `"Une erreur est survenue. Veuillez réessayer."`. `onSuccess` n'est jamais appelé, l'écran de succès n'est jamais affiché.

**Le flux de signature est intégralement cassé en production.**

Note : les 207 tests passent parce que les tests composants Vitest mockent `submitClientSignature` directement (bypass de la couche HTTP), et les tests Playwright ont des mocks réseau qui retournent `{ status: 200, body: '' }` — ces E2E tests sont eux-mêmes supposément écrits pour capturer ce bug, mais ils n'ont pas été exécutés dans la passe "207 tests pass" (Playwright s'exécute séparément).

**Correction attendue** : modifier `handleResponse` pour gérer le body vide :

```typescript
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }
  ...
}
```

### 2. [Mineur] `data-testid="signature-canvas"` silencieusement ignoré

**Fichier** : `frontend/src/components/ClientSignatureForm/ClientSignatureForm.tsx:111`

```tsx
<SignatureCanvas
  ref={canvasRef}
  onDraw={() => setPadNonEmpty(true)}
  data-testid="signature-canvas"   // ← non défini dans Props, non transmis au DOM
/>
```

L'interface `Props` de `SignatureCanvas` n'inclut pas `data-testid` et ne spread pas les HTML attributes sur l'élément `<canvas>`. TypeScript devrait le signaler. Les tests utilisent `getByRole('img')` et ne dépendent pas de ce testid — donc pas de cassure fonctionnelle — mais c'est un bruit au niveau des types.

## Risques éventuels

- **Race condition token** (déjà identifié en review précédente, toujours présent) : `validateAndConsume` ne pose pas de `SELECT FOR UPDATE`. Risque théorique faible en pratique pour un lien à usage unique.
- **`VALIDATED` vs `FULLY_SIGNED`** (déjà identifié, toujours présent) : coexistence de deux valeurs dans `ValidationStatus`. Sans impact fonctionnel immédiat.

## Décision

Le fix de la review précédente est correctement appliqué. L'implémentation backend est correcte et bien testée.

Cependant, un bug bloquant (#1) rend le flux de signature inopérant en production : `handleResponse<T>` appelle `res.json()` sur un body vide et lève une `SyntaxError` capturée comme erreur générique, empêchant l'affichage de l'écran de succès. Ce bug est masqué par le choix des mocks dans les tests (Vitest bypasse la couche HTTP, Playwright non exécuté dans le comptage "207 tests").

## Actions demandées

1. **`frontend/src/api/httpClient.ts:27`** — remplacer `return res.json() as Promise<T>;` par une lecture du texte avec gestion du body vide (voir correction proposée au point #1). Mettre à jour le test `api/__tests__/httpClient.test.ts` pour couvrir le cas 200 avec body vide.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T054/reviews/implementation-review.md
- generated at: 2026-07-28T22:16:22Z

---

Now I have everything I need. Let me write the review.

---

# PR Review — T054: Add client signature capture and approval page

## Résumé

Implémentation du formulaire de signature client sur la page publique CRA (31 fichiers source). Le périmètre est respecté : capture de signature tactile/souris, consentement explicite, identité signataire, snapshot du CRA, consommation du token, transition `AWAITING_CLIENT_SIGNATURE → FULLY_SIGNED`. Le fix de la review précédente (test inatteignable 409) a bien été appliqué. Un **bug bloquant** est identifié dans la couche HTTP frontend qui rend le flux de signature non fonctionnel en production.

## Vérifications effectuées

- Lecture de `runs/T054/reviews/implementation-review.md` (review précédente)
- Vérification que le fix demandé (suppression `returns409WhenCraNotInSignedByProviderStatus`) a bien été appliqué dans `PublicCraSigningControllerTest.java`
- Lecture de tous les fichiers clés : `ClientSignatureService.java`, `CraSignatureTokenService.java`, `PublicCraSigningController.java`, `CraApiExceptionHandler.java`, `CraSignatureToken.java`, `CraClientSignatureRecord.java`, `ValidationStatus.java`
- Lecture du frontend : `httpClient.ts`, `craPublicClient.ts`, `CraSignaturePage.tsx`, `ClientSignatureForm.tsx`, `SignatureCanvas.tsx`, `SigningSuccessScreen.tsx`, `main.tsx`
- Lecture des tests : `PublicCraSigningControllerTest.java` (6 tests, 409 retiré ✅), `CraSignatureWorkflowIntegrationTest.java`, `ClientSignatureForm.test.tsx`, `CraSignaturePage.test.tsx`, `client-signing.spec.ts`, `publicSignature.spec.ts`
- Vérification croisée des comportements HTTP backend/frontend

## Points validés

- **Sécurité token** : 32 bytes via `SecureRandom`, SHA-256 persisté uniquement. Correct.
- **Consommation idempotente** : `validateAndConsume` vérifie `isConsumed()` ET le statut CRA (`AWAITING_CLIENT_SIGNATURE`) avant de marquer `consumedAt`. Rollback transactionnel si erreur post-consommation. Correct.
- **Ordre de validation** : consentement et format d'image validés _avant_ la consommation du token (échec anticipé sans brûler le lien). Correct.
- **Snapshot** : CRA sérialisé en JSON au moment de la signature et stocké dans `cra_content_snapshot`. Immuable par construction. Correct.
- **Submit gating** : bouton désactivé jusqu'à `signerName.trim().length > 0 && consentApproved && padNonEmpty && !submitting`. Correct.
- **Canvas signature** : implémentation custom Pointer Events API — `touchAction: none`, `setPointerCapture`, `onPointerLeave` protège contre les glissements hors canvas. Correct.
- **Test unitaires backend** : `ClientSignatureServiceTest`, `CraSignatureTokenServiceTest` couvrent happy path, consent false, format image invalide, token consommé/introuvable. Correct.
- **Intégration** : `CraSignatureWorkflowIntegrationTest` valide le workflow complet DRAFT → FULLY_SIGNED et le 410 sur re-soumission. Correct.
- **Fix précédent appliqué** : `PublicCraSigningControllerTest.java` ne contient plus que 6 tests, le cas `returns409WhenCraNotInSignedByProviderStatus` est supprimé. ✅

## Problèmes détectés

### 1. [BLOQUANT] `handleResponse<T>` appelle `res.json()` sur un body 200 vide — le flux de signature est non fonctionnel

**Fichier** : `frontend/src/api/httpClient.ts:27`

```typescript
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;  // ← bug
  }
  ...
}
```

`POST /public/cra-link/{token}/sign` → `PublicCraSigningController.sign()` retourne `void` → Spring écrit une réponse HTTP 200 avec un **body vide** (Content-Length: 0).

`apiPost<void>` → `handleResponse<void>` → `res.json()` sur un body vide → `SyntaxError: Unexpected end of JSON input`.

Ce `SyntaxError` n'est pas une `ApiError`, donc le `catch` de `handleSubmit` entre dans la branche générique et affiche `"Une erreur est survenue. Veuillez réessayer."`. `onSuccess` n'est jamais appelé, l'écran de succès n'est jamais affiché.

**Le flux de signature est intégralement cassé en production.**

Note : les 207 tests passent parce que les tests composants Vitest mockent `submitClientSignature` directement (bypass de la couche HTTP), et les tests Playwright ont des mocks réseau qui retournent `{ status: 200, body: '' }` — ces E2E tests sont eux-mêmes supposément écrits pour capturer ce bug, mais ils n'ont pas été exécutés dans la passe "207 tests pass" (Playwright s'exécute séparément).

**Correction attendue** : modifier `handleResponse` pour gérer le body vide :

```typescript
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }
  ...
}
```

### 2. [Mineur] `data-testid="signature-canvas"` silencieusement ignoré

**Fichier** : `frontend/src/components/ClientSignatureForm/ClientSignatureForm.tsx:111`

```tsx
<SignatureCanvas
  ref={canvasRef}
  onDraw={() => setPadNonEmpty(true)}
  data-testid="signature-canvas"   // ← non défini dans Props, non transmis au DOM
/>
```

L'interface `Props` de `SignatureCanvas` n'inclut pas `data-testid` et ne spread pas les HTML attributes sur l'élément `<canvas>`. TypeScript devrait le signaler. Les tests utilisent `getByRole('img')` et ne dépendent pas de ce testid — donc pas de cassure fonctionnelle — mais c'est un bruit au niveau des types.

## Risques éventuels

- **Race condition token** (déjà identifié en review précédente, toujours présent) : `validateAndConsume` ne pose pas de `SELECT FOR UPDATE`. Risque théorique faible en pratique pour un lien à usage unique.
- **`VALIDATED` vs `FULLY_SIGNED`** (déjà identifié, toujours présent) : coexistence de deux valeurs dans `ValidationStatus`. Sans impact fonctionnel immédiat.

## Décision

Le fix de la review précédente est correctement appliqué. L'implémentation backend est correcte et bien testée.

Cependant, un bug bloquant (#1) rend le flux de signature inopérant en production : `handleResponse<T>` appelle `res.json()` sur un body vide et lève une `SyntaxError` capturée comme erreur générique, empêchant l'affichage de l'écran de succès. Ce bug est masqué par le choix des mocks dans les tests (Vitest bypasse la couche HTTP, Playwright non exécuté dans le comptage "207 tests").

## Actions demandées

1. **`frontend/src/api/httpClient.ts:27`** — remplacer `return res.json() as Promise<T>;` par une lecture du texte avec gestion du body vide (voir correction proposée au point #1). Mettre à jour le test `api/__tests__/httpClient.test.ts` pour couvrir le cas 200 avec body vide.

IMPLEMENTATION_FIX_REQUIRED