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

All tests pass: **207 backend** and **251 frontend**. Here's a summary of what was implemented:

---

## T054 — Implementation Summary

### Prerequisite
Merged T053 branch (secure public CRA link) to bring in `CraSignatureToken`, `CraSignatureTokenService`, `PublicCraViewController`, `CraSignaturePage`, and related types.

### Backend (new + modified files)

**New exceptions:**
- `TokenAlreadyConsumedException` → 410 Gone
- `ConsentNotGivenException` → 400 Bad Request

**Modified entities:**
- `CraSignatureToken` — added `consumedAt` field with `isConsumed()`/`consume()` methods

**New entity:**
- `CraClientSignatureRecord` — persists signerName, signerRole, consentApproved, signatureImageBase64 (LOB), craContentSnapshot (JSON LOB), signedAt, craId, tokenId

**New repository:** `CraClientSignatureRecordRepository`

**New service:** `ClientSignatureService.sign()` — validates consent, signature format, calls `tokenService.validateAndConsume()`, serializes CRA snapshot, persists record, transitions CRA to `VALIDATED`

**New controller:** `PublicCraSigningController` — `POST /public/cra-link/{token}/sign`

**Updated:** `CraApiExceptionHandler`, `CraSignatureTokenService` (added `validateAndConsume` returning `ConsumedToken` record), `CraApiExceptionHandler` with new exception handlers, `CraDetailsMapper` (fixed VALIDATED → VALIDATED mapping)

### Frontend (new + modified files)

- `SignatureCanvas` — added `isEmpty()` via `hasDrawn` ref tracking
- `ClientSignatureForm` — name input, role input, consent checkbox, `SignatureCanvas`, clear button; submit disabled until all three conditions met
- `SigningSuccessScreen` — shows signer name + formatted date on success
- `CraSignaturePage` — mounts `ClientSignatureForm` below read-only CRA view; replaces with `SigningSuccessScreen` on success
- `craPublicClient.ts` — added `submitClientSignature()`
- `apiError.ts` / `httpClient.ts` — added `token_already_consumed`, `cra_not_signed`, `consent_not_given` codes

### Tests
- `ClientSignatureServiceTest` (6 unit tests)
- `PublicCraSigningControllerTest` (6 WebMvc tests)
- `SignatureCanvas.test.tsx` (3 new isEmpty tests)
- `ClientSignatureForm.test.tsx` (11 component tests)
- `client-signing.spec.ts` (4 E2E Playwright scenarios)

---

## Review

Now I'll write the formal review.

---

# PR Review — T054: Client signature capture and approval page

## Résumé

L'implémentation couvre l'ensemble du workflow : formulaire de signature client (nom, rôle optionnel, consentement explicite, canvas HTML5 pointer-events), endpoint `POST /public/cra-link/{token}/sign`, consommation one-shot du token, persistance du snapshot CRA, transition vers `VALIDATED`. La couverture de tests est solide (unit, integration, component, E2E). Deux problèmes bloquants empêchent cependant le merge : une migration Flyway manquante et un mapping d'exception incomplet.

---

## Vérifications effectuées

- Lecture du ticket, du plan, et de tous les fichiers impactés
- Vérification de l'arborescence `backend/src/main/resources/` → absence de migration SQL
- Vérification de `CraApiExceptionHandler` → `IllegalArgumentException` non mappée
- Comparaison plan ↔ implémentation (URL, nommage composants, dépendance npm)
- Lecture de `ClientSignatureService`, `CraSignatureTokenService`, `CraSignatureToken`, `CraApiExceptionHandler`, `ClientSignatureRequestDto`
- Lecture des tests backend (6 unit + 6 integration) et frontend (11 component + 4 E2E)

---

## Points validés

- **AC 1 — Revue complète avant signature** : `CraSignaturePage` affiche le CRA complet avant le formulaire. ✓  
- **AC 2 — Nom et consentement obligatoires** : `@NotBlank signerName`, checkbox consentement requise, double validation frontend et backend (`ConsentNotGivenException`). ✓  
- **AC 3 — Mouse et touch** : `SignatureCanvas` utilise l'API Pointer (events `onPointerDown/Move/Up`), `touch-action: none`. ✓  
- **AC 4 — Signature vide non soumettable** : `isEmpty()` via `hasDrawn` ref, submit désactivé frontend, vérification backend (`@NotBlank` + prefix). ✓  
- **AC 5 — Persistance complète** : `CraClientSignatureRecord` stocke `signerName`, `signerRole`, `consentApproved`, `signatureImageBase64`, `craContentSnapshot` (JSON snapshot), `signedAt`. ✓  
- **AC 6 — Token one-shot** : `isConsumed()` / `consume()` sur `CraSignatureToken.consumedAt`, 410 Gone sur réutilisation. ✓  
- **AC 7 — Confirmation succès** : `SigningSuccessScreen` avec nom du signataire et date. ✓  
- **Tests** : `ClientSignatureServiceTest` (6), `PublicCraSigningControllerTest` (6), `SignatureCanvas.test.tsx` (3 isEmpty tests ajoutés), `ClientSignatureForm.test.tsx` (11), `client-signing.spec.ts` (4 E2E). ✓  
- Gestion transactionnelle propre dans `ClientSignatureService`. ✓  
- Mapping des exceptions `TokenAlreadyConsumedException` (410) et `ConsentNotGivenException` (400) dans `CraApiExceptionHandler`. ✓  

---

## Problèmes détectés

### BLOQUANT 1 — Migration Flyway absente

Le plan exige explicitement `V{n}__add_cra_client_signature_record.sql`. L'arborescence `backend/src/main/resources/` ne contient que `application.yml` — aucun répertoire `db/migration/` ni fichier SQL.

Deux schémas sont concernés :
- **Nouvelle table** `cra_client_signature_record` (colonnes : `id`, `cra_id`, `token_id`, `signer_name`, `signer_role`, `consent_approved`, `signature_image_base64`, `cra_content_snapshot`, `signed_at`)
- **Colonne ajoutée** `consumed_at` sur `cra_signature_token` (ligne 31 de `CraSignatureToken.java`)

Sans ces migrations, l'application ne démarre pas en staging/production.

**Correction attendue** : créer les fichiers de migration Flyway correspondants.

---

### BLOQUANT 2 — `IllegalArgumentException` retourne 500 au lieu de 400

`ClientSignatureService.java:46` lève `IllegalArgumentException("Invalid signature image")` lorsque la signature ne commence pas par `data:image/`. Cette exception n'est pas mappée dans `CraApiExceptionHandler` : Spring retourne 500 par défaut.

Le plan stipule : "blank or absent `signatureImageBase64` → 400 Bad Request". Le `@NotBlank` du DTO intercepte les cas vides à la couche contrôleur, mais le contrôle du préfixe `data:image/` n'est effectué qu'au niveau service et produit un 500 si une valeur bien formée mais invalide est envoyée.

**Correction attendue** : soit ajouter un handler `@ExceptionHandler(IllegalArgumentException.class)` dans `CraApiExceptionHandler` retournant 400, soit créer une exception dédiée `InvalidSignatureImageException` (plus propre) et la mapper.

---

## Risques éventuels

**Mineur — Déviation plan sur la dépendance npm** : le plan demandait la bibliothèque `signature_pad`. L'implémentation utilise un canvas natif avec Pointer API. Le résultat est fonctionnel mais la robustesse cross-browser du canvas natif (notamment gestion des marges en cas de scroll, DPR/retina) est moins testée qu'une librairie dédiée. À surveiller.

**Mineur — Race condition sur consommation du token** : `validateAndConsume` fait un read-then-write sans lock optimiste ni contrainte DB d'unicité. En cas de requêtes parallèles, deux consommations simultanées sont théoriquement possibles. Une contrainte `UNIQUE` sur `consumed_at` ou un `SELECT ... FOR UPDATE` renforcerait la fiabilité.

**Mineur — Test E2E touch manquant** : le plan mentionne "Playwright touch emulation" pour valider la saisie tactile. `client-signing.spec.ts` utilise uniquement `mouse.move`. L'AC "touch" est couverte par le Pointer API au niveau composant, mais pas en E2E.

**Mineur — URL path diffère du plan** : le plan spécifie `POST /api/public/cra/{token}/sign`, l'implémentation utilise `POST /public/cra-link/{token}/sign`. La cohérence avec T053 semble maintenue (les deux endpoints GET/POST utilisent le même préfixe), donc non bloquant.

---

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES**

---

## Actions demandées

1. **(Bloquant)** Créer `V{n}__add_cra_client_signature_record.sql` avec la définition complète de la table `cra_client_signature_record`.
2. **(Bloquant)** Créer `V{n}__add_consumed_at_to_cra_signature_token.sql` pour ajouter la colonne `consumed_at TIMESTAMP` sur `cra_signature_token`.
3. **(Bloquant)** Mapper `IllegalArgumentException` (ou créer `InvalidSignatureImageException`) → 400 Bad Request dans `CraApiExceptionHandler`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T054/reviews/implementation-review.md
- generated at: 2026-07-28T21:38:46Z

---

Now I'll write the formal review.

---

# PR Review — T054: Client signature capture and approval page

## Résumé

L'implémentation couvre l'ensemble du workflow : formulaire de signature client (nom, rôle optionnel, consentement explicite, canvas HTML5 pointer-events), endpoint `POST /public/cra-link/{token}/sign`, consommation one-shot du token, persistance du snapshot CRA, transition vers `VALIDATED`. La couverture de tests est solide (unit, integration, component, E2E). Deux problèmes bloquants empêchent cependant le merge : une migration Flyway manquante et un mapping d'exception incomplet.

---

## Vérifications effectuées

- Lecture du ticket, du plan, et de tous les fichiers impactés
- Vérification de l'arborescence `backend/src/main/resources/` → absence de migration SQL
- Vérification de `CraApiExceptionHandler` → `IllegalArgumentException` non mappée
- Comparaison plan ↔ implémentation (URL, nommage composants, dépendance npm)
- Lecture de `ClientSignatureService`, `CraSignatureTokenService`, `CraSignatureToken`, `CraApiExceptionHandler`, `ClientSignatureRequestDto`
- Lecture des tests backend (6 unit + 6 integration) et frontend (11 component + 4 E2E)

---

## Points validés

- **AC 1 — Revue complète avant signature** : `CraSignaturePage` affiche le CRA complet avant le formulaire. ✓  
- **AC 2 — Nom et consentement obligatoires** : `@NotBlank signerName`, checkbox consentement requise, double validation frontend et backend (`ConsentNotGivenException`). ✓  
- **AC 3 — Mouse et touch** : `SignatureCanvas` utilise l'API Pointer (events `onPointerDown/Move/Up`), `touch-action: none`. ✓  
- **AC 4 — Signature vide non soumettable** : `isEmpty()` via `hasDrawn` ref, submit désactivé frontend, vérification backend (`@NotBlank` + prefix). ✓  
- **AC 5 — Persistance complète** : `CraClientSignatureRecord` stocke `signerName`, `signerRole`, `consentApproved`, `signatureImageBase64`, `craContentSnapshot` (JSON snapshot), `signedAt`. ✓  
- **AC 6 — Token one-shot** : `isConsumed()` / `consume()` sur `CraSignatureToken.consumedAt`, 410 Gone sur réutilisation. ✓  
- **AC 7 — Confirmation succès** : `SigningSuccessScreen` avec nom du signataire et date. ✓  
- **Tests** : `ClientSignatureServiceTest` (6), `PublicCraSigningControllerTest` (6), `SignatureCanvas.test.tsx` (3 isEmpty tests ajoutés), `ClientSignatureForm.test.tsx` (11), `client-signing.spec.ts` (4 E2E). ✓  
- Gestion transactionnelle propre dans `ClientSignatureService`. ✓  
- Mapping des exceptions `TokenAlreadyConsumedException` (410) et `ConsentNotGivenException` (400) dans `CraApiExceptionHandler`. ✓  

---

## Problèmes détectés

### BLOQUANT 1 — Migration Flyway absente

Le plan exige explicitement `V{n}__add_cra_client_signature_record.sql`. L'arborescence `backend/src/main/resources/` ne contient que `application.yml` — aucun répertoire `db/migration/` ni fichier SQL.

Deux schémas sont concernés :
- **Nouvelle table** `cra_client_signature_record` (colonnes : `id`, `cra_id`, `token_id`, `signer_name`, `signer_role`, `consent_approved`, `signature_image_base64`, `cra_content_snapshot`, `signed_at`)
- **Colonne ajoutée** `consumed_at` sur `cra_signature_token` (ligne 31 de `CraSignatureToken.java`)

Sans ces migrations, l'application ne démarre pas en staging/production.

**Correction attendue** : créer les fichiers de migration Flyway correspondants.

---

### BLOQUANT 2 — `IllegalArgumentException` retourne 500 au lieu de 400

`ClientSignatureService.java:46` lève `IllegalArgumentException("Invalid signature image")` lorsque la signature ne commence pas par `data:image/`. Cette exception n'est pas mappée dans `CraApiExceptionHandler` : Spring retourne 500 par défaut.

Le plan stipule : "blank or absent `signatureImageBase64` → 400 Bad Request". Le `@NotBlank` du DTO intercepte les cas vides à la couche contrôleur, mais le contrôle du préfixe `data:image/` n'est effectué qu'au niveau service et produit un 500 si une valeur bien formée mais invalide est envoyée.

**Correction attendue** : soit ajouter un handler `@ExceptionHandler(IllegalArgumentException.class)` dans `CraApiExceptionHandler` retournant 400, soit créer une exception dédiée `InvalidSignatureImageException` (plus propre) et la mapper.

---

## Risques éventuels

**Mineur — Déviation plan sur la dépendance npm** : le plan demandait la bibliothèque `signature_pad`. L'implémentation utilise un canvas natif avec Pointer API. Le résultat est fonctionnel mais la robustesse cross-browser du canvas natif (notamment gestion des marges en cas de scroll, DPR/retina) est moins testée qu'une librairie dédiée. À surveiller.

**Mineur — Race condition sur consommation du token** : `validateAndConsume` fait un read-then-write sans lock optimiste ni contrainte DB d'unicité. En cas de requêtes parallèles, deux consommations simultanées sont théoriquement possibles. Une contrainte `UNIQUE` sur `consumed_at` ou un `SELECT ... FOR UPDATE` renforcerait la fiabilité.

**Mineur — Test E2E touch manquant** : le plan mentionne "Playwright touch emulation" pour valider la saisie tactile. `client-signing.spec.ts` utilise uniquement `mouse.move`. L'AC "touch" est couverte par le Pointer API au niveau composant, mais pas en E2E.

**Mineur — URL path diffère du plan** : le plan spécifie `POST /api/public/cra/{token}/sign`, l'implémentation utilise `POST /public/cra-link/{token}/sign`. La cohérence avec T053 semble maintenue (les deux endpoints GET/POST utilisent le même préfixe), donc non bloquant.

---

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES**

---

## Actions demandées

1. **(Bloquant)** Créer `V{n}__add_cra_client_signature_record.sql` avec la définition complète de la table `cra_client_signature_record`.
2. **(Bloquant)** Créer `V{n}__add_consumed_at_to_cra_signature_token.sql` pour ajouter la colonne `consumed_at TIMESTAMP` sur `cra_signature_token`.
3. **(Bloquant)** Mapper `IllegalArgumentException` (ou créer `InvalidSignatureImageException`) → 400 Bad Request dans `CraApiExceptionHandler`.

IMPLEMENTATION_FIX_REQUIRED