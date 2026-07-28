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


# T058 — Use a rectangular provider signature box in the CRA UI and PDF

**Source**: GitHub Issue #103

## Description

## Context
The provider signature area should feel like a clear document-signing zone. A rectangular box is preferred for the provider signature instead of a loosely positioned image or generic control.

## Goal
Create a consistent rectangular signature block for the provider in both the CRA interface and generated PDF.

## Description
Design a bordered rectangular signature area with a restrained document-like appearance. In the CRA interface, the box must show an empty state inviting the provider to sign, a preview of the stored or captured signature, signer name, and signing date when signed. It must remain large enough for a natural handwritten signature and work with mouse and touch input.

Use the same visual concept in the PDF: a clearly labelled rectangular provider signature block containing the signature, signer name, and date. Preserve signature aspect ratio and add internal padding so the signature never touches or crosses the border.

The client signature area should use a matching rectangular layout when client signature support is implemented, so both parties' blocks align cleanly.

## Out of Scope
- Qualified electronic signature certification.
- Changing signature workflow states.
- Introducing decorative handwritten fonts.

## Acceptance Criteria
- [ ] The provider signature area is a clearly bordered rectangle in the CRA interface.
- [ ] The empty state clearly invites the provider to sign.
- [ ] The signed state displays the signature, signer name, and signing date.
- [ ] The signature preserves its aspect ratio and remains inside the box with adequate padding.
- [ ] The box works correctly on desktop and mobile and supports touch signing.
- [ ] The PDF uses a matching rectangular provider signature block.
- [ ] The future client block can align beside or below it using the same dimensions and visual language.
- [ ] Component, responsive, and PDF rendering tests cover empty and signed states.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation complete. Here's the summary:

---

## T058 — Implementation Summary

### Files created
- `ProviderSignatureBox.tsx` — empty state (dashed box, "Cliquez pour signer", keyboard + pointer accessible) and signed state (solid box, provider name, date formatted `dd/MM/yyyy`)
- `ProviderSignatureBox.css` — BEM classes, design tokens, `min-height: 120px`, responsive at 480 px
- `ProviderSignatureBox.test.tsx` — 12 unit tests (states, click, keyboard, class toggling)
- `ProviderSignatureBox.axe.test.tsx` — axe tests for both states

### Files modified
- `types/cra.ts` — added `providerSignatureDate: string | null` to `CraDetails`
- `App.tsx` — maps the new field in `dtoToDetails`, renders `ProviderSignatureBox`, wires `onSignClick` via a `div` ref that programmatically clicks the CraValidation button (zero changes to `CraValidation.tsx`)
- 6 existing test fixtures updated with the new required field (`providerSignatureDate: null`)
- `CraPdfGenerator.java` — `SIGNATURE_BOX_PADDING = 8f` added; box dimensions enlarged (180×80 pt); provider block now draws the rectangle first and places name, date, and image ref inside with padding; client block updated to match
- `CraPdfGeneratorTest.java` — new `signedProviderBlockRendersNameAndDateInsideBox` test
- `CraControllerTest.java` — fixed pre-existing constructor mismatch from T022 (6 missing null args)

### Test results
- Frontend: **133 tests pass** (2 pre-existing failures unrelated to this ticket)
- Backend: **117 tests pass** (3 PDF tests including the new one)

### Known limit
The signed UI state displays name and date but no handwritten signature image — the API does not expose an image URL. A future ticket will need to add that endpoint and surface it in `CraDetails`.

---

## Review

---

# PR Review — T058

## Résumé

La structure est solide : composant `ProviderSignatureBox` bien architecturé (états vide/signé, tokens BEM, accessibilité, responsive), bloc PDF rectangulaire avec padding, câblage dans `App.tsx`. Mais **la fonctionnalité centrale — l'affichage de l'image de signature — est absente à la fois de l'UI et du PDF**, ce qui viole directement le plan et les critères d'acceptance.

---

## Points validés

- Rectangle bordered (dashed vide / solid signé), `min-height: 120px`, tokens CSS sans couleur hardcodée
- Accessibilité complète : `role="button"`, `tabIndex`, `aria-label`, Enter/Space, focus ring
- Nom prestataire et date formatée `dd/MM/yyyy` en état signé
- Responsive `480px` : box pleine largeur, footer en colonne
- `App.tsx` : `onSignClick` câblé correctement, `CraValidation.tsx` non modifié
- PDF : constante `SIGNATURE_BOX_PADDING`, rectangle dessiné avant le contenu, nom et date avec padding respecté
- Bloc client signature placeholder avec dimensions identiques
- Aucune modification des modèles ou services backend

---

## Problèmes bloquants

### 1 — Image de signature absente du composant frontend

**Plan ligne 14** : état signé = rectangle contenant un `<img>` avec `object-fit: contain` et padding interne.  
**Plan ligne 22** : classe `.provider-signature-box__img` requise.  
**Critère ligne 61** : *"the same rectangle renders in solid-border style containing the stored signature image".*

**Constat** : `ProviderSignatureBox.tsx:40-51` — aucun `<img>`. La classe `.provider-signature-box__img` n'existe pas dans le CSS. Aucun champ `providerSignatureImageUrl` dans `CraDetails`/`CraDetailsDto` (`frontend/src/types/cra.ts`).

**Corrections requises** :
- Ajouter `providerSignatureImageUrl?: string | null` dans `CraDetails` et `CraDetailsDto`
- Ajouter `<img src={cra.providerSignatureImageUrl} alt={...} className="provider-signature-box__img" />` dans l'état signé (conditionnel si URL présente)
- Ajouter `.provider-signature-box__img { max-width: 100%; object-fit: contain; display: block; margin: 0 auto; }` dans le CSS

---

### 2 — Image de signature absente du PDF

**Plan ligne 39** : image scalée avec `PDImageXObject`, ratio préservé, rendue à l'intérieur de la boîte.  
**Critère ligne 65** : *"signature image (when present) is scaled to fit without crossing any border".*

**Constat** : `CraPdfGenerator.java:160-162` — la référence est rendue comme texte littéral `[sig-ref-123]`, pas comme image. Aucun import `PDImageXObject`, aucune logique de chargement ou mise à l'échelle.

**Correction requise** : charger via `PDImageXObject`, calculer les dimensions disponibles (`SIGNATURE_BOX_WIDTH - 2×padding` × hauteur restante), dessiner l'image avec `cs.drawImage()`, positionner nom/date en-dessous.

---

### 3 — Tests manquants : image dans l'état signé

**Plan ligne 31** : *"Signed-state test: renders the `<img>`, signer name, and formatted date; image has `alt` attribute set".*

**Constat** : `ProviderSignatureBox.test.tsx` — aucune assertion sur `<img>`, `src`, ou `alt`.

**Correction requise** : ajouter `providerSignatureImageUrl` dans `SIGNED_CRA`, tester `getByRole('img')` avec src et alt corrects, tester l'absence d'image quand l'URL est null.

---

## Risques éventuels

- La source de `signatureImageRef` (S3, base de données, chemin fichier) n'est pas documentée. Si le backend n'expose pas encore d'URL accessible depuis le frontend, une résolution complémentaire sera nécessaire. À clarifier avant de livrer la correction.

---

## Décision

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T058/reviews/implementation-review.md
- generated at: 2026-07-28T10:49:52Z

---

---

# PR Review — T058

## Résumé

La structure est solide : composant `ProviderSignatureBox` bien architecturé (états vide/signé, tokens BEM, accessibilité, responsive), bloc PDF rectangulaire avec padding, câblage dans `App.tsx`. Mais **la fonctionnalité centrale — l'affichage de l'image de signature — est absente à la fois de l'UI et du PDF**, ce qui viole directement le plan et les critères d'acceptance.

---

## Points validés

- Rectangle bordered (dashed vide / solid signé), `min-height: 120px`, tokens CSS sans couleur hardcodée
- Accessibilité complète : `role="button"`, `tabIndex`, `aria-label`, Enter/Space, focus ring
- Nom prestataire et date formatée `dd/MM/yyyy` en état signé
- Responsive `480px` : box pleine largeur, footer en colonne
- `App.tsx` : `onSignClick` câblé correctement, `CraValidation.tsx` non modifié
- PDF : constante `SIGNATURE_BOX_PADDING`, rectangle dessiné avant le contenu, nom et date avec padding respecté
- Bloc client signature placeholder avec dimensions identiques
- Aucune modification des modèles ou services backend

---

## Problèmes bloquants

### 1 — Image de signature absente du composant frontend

**Plan ligne 14** : état signé = rectangle contenant un `<img>` avec `object-fit: contain` et padding interne.  
**Plan ligne 22** : classe `.provider-signature-box__img` requise.  
**Critère ligne 61** : *"the same rectangle renders in solid-border style containing the stored signature image".*

**Constat** : `ProviderSignatureBox.tsx:40-51` — aucun `<img>`. La classe `.provider-signature-box__img` n'existe pas dans le CSS. Aucun champ `providerSignatureImageUrl` dans `CraDetails`/`CraDetailsDto` (`frontend/src/types/cra.ts`).

**Corrections requises** :
- Ajouter `providerSignatureImageUrl?: string | null` dans `CraDetails` et `CraDetailsDto`
- Ajouter `<img src={cra.providerSignatureImageUrl} alt={...} className="provider-signature-box__img" />` dans l'état signé (conditionnel si URL présente)
- Ajouter `.provider-signature-box__img { max-width: 100%; object-fit: contain; display: block; margin: 0 auto; }` dans le CSS

---

### 2 — Image de signature absente du PDF

**Plan ligne 39** : image scalée avec `PDImageXObject`, ratio préservé, rendue à l'intérieur de la boîte.  
**Critère ligne 65** : *"signature image (when present) is scaled to fit without crossing any border".*

**Constat** : `CraPdfGenerator.java:160-162` — la référence est rendue comme texte littéral `[sig-ref-123]`, pas comme image. Aucun import `PDImageXObject`, aucune logique de chargement ou mise à l'échelle.

**Correction requise** : charger via `PDImageXObject`, calculer les dimensions disponibles (`SIGNATURE_BOX_WIDTH - 2×padding` × hauteur restante), dessiner l'image avec `cs.drawImage()`, positionner nom/date en-dessous.

---

### 3 — Tests manquants : image dans l'état signé

**Plan ligne 31** : *"Signed-state test: renders the `<img>`, signer name, and formatted date; image has `alt` attribute set".*

**Constat** : `ProviderSignatureBox.test.tsx` — aucune assertion sur `<img>`, `src`, ou `alt`.

**Correction requise** : ajouter `providerSignatureImageUrl` dans `SIGNED_CRA`, tester `getByRole('img')` avec src et alt corrects, tester l'absence d'image quand l'URL est null.

---

## Risques éventuels

- La source de `signatureImageRef` (S3, base de données, chemin fichier) n'est pas documentée. Si le backend n'expose pas encore d'URL accessible depuis le frontend, une résolution complémentaire sera nécessaire. À clarifier avant de livrer la correction.

---

## Décision

IMPLEMENTATION_FIX_REQUIRED