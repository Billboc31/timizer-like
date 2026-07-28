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

All 129 tests pass (including the new 5 in `ProviderSignatureSettingsControllerTest`). Let me do a final review of all changes made.

**Summary of all changes:**

**Fix 1 — Backend input validation (BLOQUANT 1):**
- `ProviderSignatureDto.java`: added `@NotBlank` on `signerName` and `signatureImage`, `@Size(max = 700_000)` on `signatureImage`
- `ProviderSignatureSettingsController.java`: added `@Valid` on `@RequestBody` in `save()`

**Fix 2 — Controller HTTP test (BLOQUANT 2):**
- Created `ProviderSignatureSettingsControllerTest.java` in `com.timizerlike.backend.cra.web` (same package as all other controller tests) covering GET 404, GET 200, PUT 200, PUT 400 (blank body), DELETE 204

**Observation addressed:** The `columnDefinition = "TEXT"` recommendation was NOT applied because H2 (used by all JPA tests) doesn't support `TEXT` as a domain type — it would break 8 existing tests. The review explicitly marked this non-blocking for the current SQLite-only scope.

All 129 backend tests pass.

---

## Review

---

# PR Review — T051: Add provider signature capture and reusable signature settings

## Résumé

Implémentation complète et bien structurée. Tous les critères d'acceptation du ticket sont couverts. Les deux blocages des reviews précédentes (`@Valid` manquant + tests HTTP manquants) ont été corrigés. Deux nouveaux défauts ont été identifiés.

## Points validés

- Dessin pointer events (mouse + touch) avec `setPointerCapture` ✓
- Upload avec validation MIME + taille aux deux couches ✓
- Preview / remplacement / suppression ✓
- Snapshot immutable sur CRA (`MonthlyCraReport` stocke directement image + nom) ✓
- Blocage CRA si pas de signature configurée (404 → message settings) ✓
- Intégration PDF (`signatureImageRef` propagé) ✓
- 129 tests backend + ~26 tests frontend spécifiques ✓

## Problèmes bloquants

### [1] `<dialog>` sans `onCancel` — bug accessibilité clavier

**`CraValidation.tsx` ligne 151** : la touche Escape ferme le dialog nativement (via l'événement `cancel` du navigateur) sans passer par React. `uiState` reste à `'confirming'`, le `useEffect` de focus ne se déclenche pas, et le focus clavier est perdu.

**Correction :** ajouter `onCancel={handleCancel}` sur l'élément `<dialog>`. `handleCancel` existe déjà et gère correctement le retour à `'idle'`.

### [2] `setTimeout` sans cleanup — risque sur unmount

**`CraValidation.tsx` ligne 77** : le timer de 2s n'est pas annulé si le composant est démonté. En React strict mode, le callback s'exécute quand même. Stocker l'id dans une `ref` et appeler `clearTimeout` dans un effet de cleanup.

Un test simulant `fireEvent(dialog, new Event('cancel'))` doit accompagner la correction du point 1.

## Décision

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T051/reviews/implementation-review.md
- generated at: 2026-07-28T17:21:25Z

---

---

# PR Review — T051: Add provider signature capture and reusable signature settings

## Résumé

Implémentation complète et bien structurée. Tous les critères d'acceptation du ticket sont couverts. Les deux blocages des reviews précédentes (`@Valid` manquant + tests HTTP manquants) ont été corrigés. Deux nouveaux défauts ont été identifiés.

## Points validés

- Dessin pointer events (mouse + touch) avec `setPointerCapture` ✓
- Upload avec validation MIME + taille aux deux couches ✓
- Preview / remplacement / suppression ✓
- Snapshot immutable sur CRA (`MonthlyCraReport` stocke directement image + nom) ✓
- Blocage CRA si pas de signature configurée (404 → message settings) ✓
- Intégration PDF (`signatureImageRef` propagé) ✓
- 129 tests backend + ~26 tests frontend spécifiques ✓

## Problèmes bloquants

### [1] `<dialog>` sans `onCancel` — bug accessibilité clavier

**`CraValidation.tsx` ligne 151** : la touche Escape ferme le dialog nativement (via l'événement `cancel` du navigateur) sans passer par React. `uiState` reste à `'confirming'`, le `useEffect` de focus ne se déclenche pas, et le focus clavier est perdu.

**Correction :** ajouter `onCancel={handleCancel}` sur l'élément `<dialog>`. `handleCancel` existe déjà et gère correctement le retour à `'idle'`.

### [2] `setTimeout` sans cleanup — risque sur unmount

**`CraValidation.tsx` ligne 77** : le timer de 2s n'est pas annulé si le composant est démonté. En React strict mode, le callback s'exécute quand même. Stocker l'id dans une `ref` et appeler `clearTimeout` dans un effet de cleanup.

Un test simulant `fireEvent(dialog, new Event('cancel'))` doit accompagner la correction du point 1.

## Décision

IMPLEMENTATION_FIX_REQUIRED