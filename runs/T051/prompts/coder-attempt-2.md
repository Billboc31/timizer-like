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


# T051 — Add provider signature capture and reusable signature settings

**Source**: GitHub Issue #96

## Description

## Context
The provider must be able to sign the monthly CRA before sending it to the client. Signature handling should be available directly inside Timizer-like rather than relying on a manually replaced asset.

## Goal
Allow the provider to create, save, preview, replace, and apply their signature to a CRA.

## Description
Add a provider signature area in settings with support for drawing a signature using pointer or touch input and uploading a supported image file. Store the signature securely in the application data and provide preview, replace, and delete actions.

When the provider signs a CRA, capture the signature image, signer name, and signing timestamp as part of that CRA. A later change to the default signature must not modify previously signed CRAs.

## Out of Scope
- Qualified or advanced electronic signature certification.
- External signature providers.
- Client signature workflow.

## Acceptance Criteria
- [ ] The provider can draw a signature with mouse and touch input.
- [ ] The provider can alternatively upload a supported signature image.
- [ ] Signature preview, replacement, and deletion are supported.
- [ ] Invalid files and oversized files are rejected with clear messages.
- [ ] A provider signature can be applied to an eligible CRA.
- [ ] Signer name and timestamp are stored with the CRA.
- [ ] Previously signed CRAs keep their original signature snapshot.
- [ ] Tests cover drawing or upload, persistence, replacement, deletion, and CRA application.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All tasks complete. Here's a summary of everything implemented:

---

## Summary

**Backend — 14 files created/modified**

- **New**: `ProviderSignatureSettings` entity + repository (`com.timizer.backend.cra.signature`)
- **New**: `ProviderSignatureSettingsService`, `ProviderSignatureSettingsController`, `ProviderSignatureDto` (`com.timizerlike.cra.signature`) — REST endpoints `GET/PUT/DELETE /api/signature`
- **Extended** `MonthlyCraReport` — added `providerSignatureImage`, `providerSignerName` columns + getters/setters
- **Extended** `ValidateCraRequestDto` — added `@NotBlank providerSignatureImage`, `@NotBlank providerSignerName`
- **Extended** `CraValidationService.validate()` — accepts and persists the snapshot fields
- **Extended** `CraValidationController` — passes new fields to service
- **Extended** `CraDetailsDto` — added `providerSignatureImage`, `providerSignerName`
- **Extended** `CraDetailsMapper` + `CraDayUpdateService` — map new fields
- **Extended** `CraPdfDownloadService` — passes `providerSignatureImage` into `CraPdfProviderSignature.signatureImageRef`
- **Updated tests**: `ProviderSignatureSettingsServiceTest` (new), `CraValidationServiceTest`, `CraValidationControllerTest`, `CraDtoTest`, `CraDayControllerTest`, `CraControllerTest`, `CraWorkflowIntegrationTest` — all 124 tests pass

**Frontend — 13 files created/modified**

- **New**: `signatureClient.ts` — `getSignature`, `saveSignature`, `deleteSignature`
- **Extended**: `apiError.ts` — `signature_too_large`, `signature_invalid_format` codes; `errorMessages.ts` — French messages; `httpClient.ts` — `apiPut`, `apiDelete`; `types.ts` — `ProviderSignatureDto`, extended `ValidateCraRequest` and `CraDetailsDto`; `types/cra.ts` — signature snapshot fields on `CraDetails`
- **New**: `SignatureCanvas` component (pointer/touch drawing, `forwardRef` handle) + tests
- **New**: `SignatureSettings` component (draw/upload tabs, file validation, save/replace/delete) + CSS + tests
- **Extended** `AppShell` — added "Paramètres" nav item
- **Extended** `App.tsx` — settings view, passes `onGoToSettings` to `CraValidation`
- **Extended** `CraValidation` — fetches signature before confirming, shows blocking message if none configured, includes signature snapshot in validate request
- **Updated**: `CraValidation.test.tsx`, `CraValidation.axe.test.tsx` — all 135 tests pass (2 pre-existing import failures in unrelated axe tests remain)

---

## Review

# PR Review — T051: Add provider signature capture and reusable signature settings

## Résumé

L'implémentation couvre l'ensemble des critères fonctionnels du ticket : dessin canvas avec PointerEvents, import de fichier, persistance en base via entité singleton, snapshot snapshot signature dans le CRA à la validation, immuabilité des CRA validés, et intégration dans le PDF. Les tests frontend sont complets et bien structurés. Le flow UX (no-sig → settings link, confirmation dialog, success) est bien implémenté.

Deux problèmes bloquants identifiés : absence de validation backend sur l'endpoint PUT `/api/signature` et absence de test HTTP pour `ProviderSignatureSettingsController`.

---

## Vérifications effectuées

- Lecture des entités `ProviderSignatureSettings`, `MonthlyCraReport` (colonnes ajoutées)
- Lecture `ProviderSignatureSettingsService`, `ProviderSignatureSettingsController`, `CraValidationService`, `CraValidationController`
- Lecture `ValidateCraRequestDto`, `CraDetailsDto`, `CraDetailsMapper`
- Lecture `CraPdfDownloadService` (vérification intégration signature dans PDF)
- Lecture frontend : `SignatureCanvas.tsx`, `SignatureSettings.tsx`, `CraValidation.tsx`, `App.tsx`, `signatureClient.ts`, `types.ts`
- Lecture tous les tests : `SignatureCanvas.test.tsx`, `SignatureSettings.test.tsx`, `CraValidation.test.tsx`, `CraValidation.axe.test.tsx`, `ProviderSignatureSettingsServiceTest.java`, `CraValidationServiceTest.java`, `CraValidationControllerTest.java`, `CraWorkflowIntegrationTest.java`
- Vérification de l'existence de fichiers de migration SQL (aucun trouvé — ddl-auto: update confirmé)
- Vérification des annotations de colonne pour les champs `signatureImage`

---

## Points validés

- **Dessin avec PointerEvents** : `SignatureCanvas.tsx` gère `onPointerDown/Move/Up/Leave`, `setPointerCapture`, `touchAction: none`. Le touch et la souris sont couverts. L'API `toDataURL/clear` via `useImperativeHandle` est propre.
- **Import de fichier** : Validation MIME (PNG/JPEG/SVG) et taille (500 Ko) en frontend avec messages d'erreur en français, `FileReader.readAsDataURL` correct.
- **Preview, replacement, deletion** : Géré dans `SignatureSettings.tsx` avec trois états clairs (preview / editor / saving). L'action "Remplacer" réinitialise l'état local sans passer par l'API.
- **Snapshot sur CRA** : `CraValidationService.validate()` stocke `signatureImage`, `signerName`, `signatureDate` directement sur l'entité `MonthlyCraReport`, indépendamment des settings. Le test `signatureSnapshotIsStoredOnCraIndependentlyOfSettings` valide ceci explicitement.
- **Immuabilité** : Le service vérifie `status == DRAFT` et lève `CraValidatedException` (HTTP 409) si déjà validé. Testé dans `CraValidationControllerTest`.
- **Intégration PDF** : `CraPdfDownloadService.toDocument()` propage correctement `providerSignatureDate` et `providerSignatureImage` vers le modèle PDF (`CraPdfProviderSignature`).
- **UX no-sig** : `CraValidation` gère explicitement le cas 404 sur `getSignature()` et redirige vers les settings via `onGoToSettings`. Testé.
- **Accessibilité** : Test axe sur le composant `CraValidation` dans deux états. Focus management (`triggerRef`, `dialogRef`) présent.
- **Scope respecté** : Aucune dérive vers certification qualifiée, providers externes, ni workflow client.

---

## Problèmes détectés

### [BLOQUANT 1] Absence de validation backend sur `PUT /api/signature`

**Fichier** : `ProviderSignatureSettingsController.java:31` et `ProviderSignatureDto.java`

Le `ProviderSignatureDto` n'a aucune annotation de validation (`@NotBlank`, etc.) et le contrôleur n'utilise pas `@Valid` :

```java
// ProviderSignatureDto — aucune contrainte
public record ProviderSignatureDto(String signerName, String signatureImage) {}

// Contrôleur — @Valid absent
@PutMapping
public ProviderSignatureDto save(@RequestBody ProviderSignatureDto request) { ... }
```

Conséquence : un appel direct à `PUT /api/signature` avec `{"signerName": "", "signatureImage": ""}` persiste une signature vide sans erreur. La validation de taille et de type de fichier (500 Ko, PNG/JPEG/SVG) est uniquement frontend — un appel API direct peut envoyer des megaoctets sans contrainte.

Le critère d'acceptation dit **"Invalid files and oversized files are rejected with clear messages"** — la validation au boundary serveur est nécessaire.

**Correction attendue** :
- Ajouter `@NotBlank` sur les champs de `ProviderSignatureDto`
- Ajouter `@Valid` sur le paramètre `@RequestBody` dans le contrôleur
- Ajouter une validation de taille maximale (ex. `@Size(max = 700000)` sur `signatureImage` pour couvrir l'overhead base64 de 500 Ko)

---

### [BLOQUANT 2] Absence de test HTTP pour `ProviderSignatureSettingsController`

**Constat** : Il existe `ProviderSignatureSettingsServiceTest.java` (5 tests de la couche service), mais **aucun `@WebMvcTest` pour `ProviderSignatureSettingsController`**.

Le contrat HTTP de l'endpoint signature (GET 404 si absent, PUT 200, DELETE 204, format de réponse JSON) n'est pas testé. Le critère d'acceptation dit explicitement : **"Tests cover drawing or upload, persistence, replacement, deletion, and CRA application."**

La persistance et la suppression au niveau HTTP sont non couvertes.

**Correction attendue** : Ajouter `ProviderSignatureSettingsControllerTest.java` avec `@WebMvcTest(ProviderSignatureSettingsController.class)` couvrant :
- `GET /api/signature` → 404 quand absent
- `GET /api/signature` → 200 avec DTO quand présent
- `PUT /api/signature` → 200 avec DTO
- `PUT /api/signature` avec body invalide → 400 (après ajout de `@Valid`)
- `DELETE /api/signature` → 204

---

## Risques éventuels

### [OBSERVATION] Colonnes `signatureImage` sans `columnDefinition = "TEXT"`

**Fichiers** : `ProviderSignatureSettings.java:18`, `MonthlyCraReport.java:92`

Les colonnes `signature_image` et `provider_signature_image` sont mappées comme `@Column(name = "...")` sans `length` ni `columnDefinition`. JPA génère par défaut VARCHAR(255), qui sera silencieusement trop court pour une image base64.

Sous SQLite (mode actuel avec `ddl-auto: update`) cela fonctionne car SQLite n'applique pas les limites de longueur VARCHAR. En revanche, toute migration vers PostgreSQL ou MySQL provoquerait une troncature silencieuse.

**Recommandation** : Ajouter `@Column(name = "...", columnDefinition = "TEXT")` sur les deux champs. Non bloquant pour le scope actuel (SQLite uniquement) mais à adresser avant tout changement de base.

---

### [OBSERVATION] `providerSignatureDate` fourni par le client

**Fichier** : `CraValidation.tsx:69`, `CraValidationService.java:39`

Le `providerSignatureDate` est calculé côté frontend (`new Date().toISOString().slice(0, 10)`) et accepté tel quel par le backend. Le `validationDate` est lui calculé côté serveur (`LocalDate.now()`). Les deux sont nominalement identiques mais le client peut envoyer n'importe quelle date pour `providerSignatureDate`.

Pour un outil mono-utilisateur sans authentification, le risque est faible. Mais stocker un timestamp fourni par le client comme "timestamp de signature" alors que le backend calcule `validationDate` indépendamment est incohérent sémantiquement. Non bloquant.

---

### [MINEUR] `setTimeout` dans `CraValidation.handleConfirm` sans cleanup

**Fichier** : `CraValidation.tsx:77`

```ts
setTimeout(() => {
  onValidated(updated);
}, 2000);
```

Le timer n'est pas annulé si le composant est démonté avant les 2 secondes. En React 18 cela ne produit plus d'avertissement, mais le callback `onValidated` peut s'exécuter sur un composant parent potentiellement dans un état modifié. Correctif trivial : passer par un `useEffect` avec cleanup retournant `clearTimeout`.

---

## Décision

L'implémentation est fonctionnellement correcte et couvre la majorité des critères du ticket avec une bonne qualité de code. Deux problèmes bloquants empêchent l'approbation :

1. Le boundary serveur du `PUT /api/signature` n'a aucune validation d'entrée, violant le critère "Invalid files and oversized files are rejected" et la règle de sécurité "valider les entrées externes".
2. Le contrat HTTP de `ProviderSignatureSettingsController` n'est pas testé, en contradiction avec le critère de test explicite du ticket.

## Actions demandées

1. Ajouter `@NotBlank` sur `ProviderSignatureDto.signerName` et `ProviderSignatureDto.signatureImage`, `@Valid` sur `@RequestBody` dans `ProviderSignatureSettingsController.save()`, et une contrainte de taille sur `signatureImage` (ex. `@Size(max = 700000)`).
2. Ajouter `ProviderSignatureSettingsControllerTest.java` couvrant GET 404, GET 200, PUT 200, PUT 400 (body invalide), DELETE 204.
3. (Recommandé, non bloquant) Ajouter `columnDefinition = "TEXT"` sur les deux colonnes `signatureImage`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T051/reviews/implementation-review.md
- generated at: 2026-07-28T16:37:36Z

---

# PR Review — T051: Add provider signature capture and reusable signature settings

## Résumé

L'implémentation couvre l'ensemble des critères fonctionnels du ticket : dessin canvas avec PointerEvents, import de fichier, persistance en base via entité singleton, snapshot snapshot signature dans le CRA à la validation, immuabilité des CRA validés, et intégration dans le PDF. Les tests frontend sont complets et bien structurés. Le flow UX (no-sig → settings link, confirmation dialog, success) est bien implémenté.

Deux problèmes bloquants identifiés : absence de validation backend sur l'endpoint PUT `/api/signature` et absence de test HTTP pour `ProviderSignatureSettingsController`.

---

## Vérifications effectuées

- Lecture des entités `ProviderSignatureSettings`, `MonthlyCraReport` (colonnes ajoutées)
- Lecture `ProviderSignatureSettingsService`, `ProviderSignatureSettingsController`, `CraValidationService`, `CraValidationController`
- Lecture `ValidateCraRequestDto`, `CraDetailsDto`, `CraDetailsMapper`
- Lecture `CraPdfDownloadService` (vérification intégration signature dans PDF)
- Lecture frontend : `SignatureCanvas.tsx`, `SignatureSettings.tsx`, `CraValidation.tsx`, `App.tsx`, `signatureClient.ts`, `types.ts`
- Lecture tous les tests : `SignatureCanvas.test.tsx`, `SignatureSettings.test.tsx`, `CraValidation.test.tsx`, `CraValidation.axe.test.tsx`, `ProviderSignatureSettingsServiceTest.java`, `CraValidationServiceTest.java`, `CraValidationControllerTest.java`, `CraWorkflowIntegrationTest.java`
- Vérification de l'existence de fichiers de migration SQL (aucun trouvé — ddl-auto: update confirmé)
- Vérification des annotations de colonne pour les champs `signatureImage`

---

## Points validés

- **Dessin avec PointerEvents** : `SignatureCanvas.tsx` gère `onPointerDown/Move/Up/Leave`, `setPointerCapture`, `touchAction: none`. Le touch et la souris sont couverts. L'API `toDataURL/clear` via `useImperativeHandle` est propre.
- **Import de fichier** : Validation MIME (PNG/JPEG/SVG) et taille (500 Ko) en frontend avec messages d'erreur en français, `FileReader.readAsDataURL` correct.
- **Preview, replacement, deletion** : Géré dans `SignatureSettings.tsx` avec trois états clairs (preview / editor / saving). L'action "Remplacer" réinitialise l'état local sans passer par l'API.
- **Snapshot sur CRA** : `CraValidationService.validate()` stocke `signatureImage`, `signerName`, `signatureDate` directement sur l'entité `MonthlyCraReport`, indépendamment des settings. Le test `signatureSnapshotIsStoredOnCraIndependentlyOfSettings` valide ceci explicitement.
- **Immuabilité** : Le service vérifie `status == DRAFT` et lève `CraValidatedException` (HTTP 409) si déjà validé. Testé dans `CraValidationControllerTest`.
- **Intégration PDF** : `CraPdfDownloadService.toDocument()` propage correctement `providerSignatureDate` et `providerSignatureImage` vers le modèle PDF (`CraPdfProviderSignature`).
- **UX no-sig** : `CraValidation` gère explicitement le cas 404 sur `getSignature()` et redirige vers les settings via `onGoToSettings`. Testé.
- **Accessibilité** : Test axe sur le composant `CraValidation` dans deux états. Focus management (`triggerRef`, `dialogRef`) présent.
- **Scope respecté** : Aucune dérive vers certification qualifiée, providers externes, ni workflow client.

---

## Problèmes détectés

### [BLOQUANT 1] Absence de validation backend sur `PUT /api/signature`

**Fichier** : `ProviderSignatureSettingsController.java:31` et `ProviderSignatureDto.java`

Le `ProviderSignatureDto` n'a aucune annotation de validation (`@NotBlank`, etc.) et le contrôleur n'utilise pas `@Valid` :

```java
// ProviderSignatureDto — aucune contrainte
public record ProviderSignatureDto(String signerName, String signatureImage) {}

// Contrôleur — @Valid absent
@PutMapping
public ProviderSignatureDto save(@RequestBody ProviderSignatureDto request) { ... }
```

Conséquence : un appel direct à `PUT /api/signature` avec `{"signerName": "", "signatureImage": ""}` persiste une signature vide sans erreur. La validation de taille et de type de fichier (500 Ko, PNG/JPEG/SVG) est uniquement frontend — un appel API direct peut envoyer des megaoctets sans contrainte.

Le critère d'acceptation dit **"Invalid files and oversized files are rejected with clear messages"** — la validation au boundary serveur est nécessaire.

**Correction attendue** :
- Ajouter `@NotBlank` sur les champs de `ProviderSignatureDto`
- Ajouter `@Valid` sur le paramètre `@RequestBody` dans le contrôleur
- Ajouter une validation de taille maximale (ex. `@Size(max = 700000)` sur `signatureImage` pour couvrir l'overhead base64 de 500 Ko)

---

### [BLOQUANT 2] Absence de test HTTP pour `ProviderSignatureSettingsController`

**Constat** : Il existe `ProviderSignatureSettingsServiceTest.java` (5 tests de la couche service), mais **aucun `@WebMvcTest` pour `ProviderSignatureSettingsController`**.

Le contrat HTTP de l'endpoint signature (GET 404 si absent, PUT 200, DELETE 204, format de réponse JSON) n'est pas testé. Le critère d'acceptation dit explicitement : **"Tests cover drawing or upload, persistence, replacement, deletion, and CRA application."**

La persistance et la suppression au niveau HTTP sont non couvertes.

**Correction attendue** : Ajouter `ProviderSignatureSettingsControllerTest.java` avec `@WebMvcTest(ProviderSignatureSettingsController.class)` couvrant :
- `GET /api/signature` → 404 quand absent
- `GET /api/signature` → 200 avec DTO quand présent
- `PUT /api/signature` → 200 avec DTO
- `PUT /api/signature` avec body invalide → 400 (après ajout de `@Valid`)
- `DELETE /api/signature` → 204

---

## Risques éventuels

### [OBSERVATION] Colonnes `signatureImage` sans `columnDefinition = "TEXT"`

**Fichiers** : `ProviderSignatureSettings.java:18`, `MonthlyCraReport.java:92`

Les colonnes `signature_image` et `provider_signature_image` sont mappées comme `@Column(name = "...")` sans `length` ni `columnDefinition`. JPA génère par défaut VARCHAR(255), qui sera silencieusement trop court pour une image base64.

Sous SQLite (mode actuel avec `ddl-auto: update`) cela fonctionne car SQLite n'applique pas les limites de longueur VARCHAR. En revanche, toute migration vers PostgreSQL ou MySQL provoquerait une troncature silencieuse.

**Recommandation** : Ajouter `@Column(name = "...", columnDefinition = "TEXT")` sur les deux champs. Non bloquant pour le scope actuel (SQLite uniquement) mais à adresser avant tout changement de base.

---

### [OBSERVATION] `providerSignatureDate` fourni par le client

**Fichier** : `CraValidation.tsx:69`, `CraValidationService.java:39`

Le `providerSignatureDate` est calculé côté frontend (`new Date().toISOString().slice(0, 10)`) et accepté tel quel par le backend. Le `validationDate` est lui calculé côté serveur (`LocalDate.now()`). Les deux sont nominalement identiques mais le client peut envoyer n'importe quelle date pour `providerSignatureDate`.

Pour un outil mono-utilisateur sans authentification, le risque est faible. Mais stocker un timestamp fourni par le client comme "timestamp de signature" alors que le backend calcule `validationDate` indépendamment est incohérent sémantiquement. Non bloquant.

---

### [MINEUR] `setTimeout` dans `CraValidation.handleConfirm` sans cleanup

**Fichier** : `CraValidation.tsx:77`

```ts
setTimeout(() => {
  onValidated(updated);
}, 2000);
```

Le timer n'est pas annulé si le composant est démonté avant les 2 secondes. En React 18 cela ne produit plus d'avertissement, mais le callback `onValidated` peut s'exécuter sur un composant parent potentiellement dans un état modifié. Correctif trivial : passer par un `useEffect` avec cleanup retournant `clearTimeout`.

---

## Décision

L'implémentation est fonctionnellement correcte et couvre la majorité des critères du ticket avec une bonne qualité de code. Deux problèmes bloquants empêchent l'approbation :

1. Le boundary serveur du `PUT /api/signature` n'a aucune validation d'entrée, violant le critère "Invalid files and oversized files are rejected" et la règle de sécurité "valider les entrées externes".
2. Le contrat HTTP de `ProviderSignatureSettingsController` n'est pas testé, en contradiction avec le critère de test explicite du ticket.

## Actions demandées

1. Ajouter `@NotBlank` sur `ProviderSignatureDto.signerName` et `ProviderSignatureDto.signatureImage`, `@Valid` sur `@RequestBody` dans `ProviderSignatureSettingsController.save()`, et une contrainte de taille sur `signatureImage` (ex. `@Size(max = 700000)`).
2. Ajouter `ProviderSignatureSettingsControllerTest.java` couvrant GET 404, GET 200, PUT 200, PUT 400 (body invalide), DELETE 204.
3. (Recommandé, non bloquant) Ajouter `columnDefinition = "TEXT"` sur les deux colonnes `signatureImage`.

IMPLEMENTATION_FIX_REQUIRED