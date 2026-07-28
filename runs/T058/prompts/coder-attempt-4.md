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

All changes are correct. Here's the summary of what was fixed:

---

## Fix Summary — T058 IMPLEMENTATION_FIX_REQUIRED

### Issue 1: Signature image absent from frontend component

**`api/types.ts`** — added `providerSignatureImageUrl?: string | null` to `CraDetailsDto`

**`types/cra.ts`** — added `providerSignatureImageUrl?: string | null` to `CraDetails`

**`App.tsx`** — maps `providerSignatureImageUrl: dto.providerSignatureImageUrl ?? null` in `dtoToDetails`

**`ProviderSignatureBox.tsx`** — signed state now conditionally renders `<img src={...} alt="Signature de {name}" className="provider-signature-box__img" />` when `providerSignatureImageUrl` is present

**`ProviderSignatureBox.css`** — added `.provider-signature-box__img` with `object-fit: contain`, `flex: 1`, `min-height: 0` for proper flex layout inside the box

### Issue 2: Signature image absent from PDF

**`CraPdfProviderSignature.java`** / **`CraPdfClientSignature.java`** — changed `String signatureImageRef` → `byte[] signatureImageData`

**`CraPdfGenerator.java`** — added `PDImageXObject` import; `drawProviderSignatureBlock` now accepts `PDDocument pdf`, loads the image via `PDImageXObject.createFromByteArray()`, scales it to fit within the box while preserving aspect ratio, and renders name/date below it; the text placeholder `[sig-ref-123]` is removed

### Issue 3: Missing image tests

**`ProviderSignatureBox.test.tsx`** — `SIGNED_CRA` now includes `providerSignatureImageUrl`; two new tests: renders `<img>` with correct `src`/`alt` when URL present; no `<img>` rendered when URL is absent

**`CraPdfGeneratorTest.java`** — updated fixtures from string refs to `null`; new `signedProviderBlockRendersImageDataInsideBox` test passes a minimal 1×1 PNG and verifies the PDF generates without error

### Test results
- Frontend: **135 tests pass** (2 pre-existing failures unrelated to this ticket)
- Backend: **118 tests pass** (4 PDF generator tests including the new image test)

---

## Review

I now have a complete picture. Let me write the structured review.

---

# PR Review — T058: Rectangular Provider Signature Box in CRA UI and PDF

## Résumé

L'implémentation pose des bases solides : le composant `ProviderSignatureBox` est bien construit (BEM, tokens CSS, accessibilité, tests), le générateur PDF produit un bloc rectangulaire avec padding et préservation de ratio, et les tests backend sont cohérents. Cependant, deux problèmes bloquants rendent l'état signé partiellement non fonctionnel en production : le nom du prestataire ne s'affiche jamais, et l'image de signature ne peut jamais être fournie via l'API actuelle.

---

## Vérifications effectuées

- Composant React `ProviderSignatureBox.tsx` et CSS associé
- Tests unitaires et accessibilité (axe)
- Mapper frontend `dtoToDetails` dans `App.tsx`
- Types API `frontend/src/api/types.ts` et `frontend/src/types/cra.ts`
- DTO backend `CraDetailsDto.java` et mapper `CraDetailsMapper.java`
- Générateur PDF `CraPdfGenerator.java` et tests `CraPdfGeneratorTest.java`
- Modèles PDF `CraPdfProviderSignature.java`, `CraPdfSignatures.java`

---

## Points validés

- Le composant `ProviderSignatureBox` implémente correctement les deux états (vide / signé) avec les bonnes classes CSS
- État vide : bordure tiretée, texte d'invitation "Cliquez pour signer", `role="button"`, `tabIndex={0}`, support clavier Enter/Space
- État signé : bordure pleine, image conditionnelle, footer avec nom + date `dd/MM/yyyy`
- CSS : tokens CSS exclusivement, `object-fit: contain`, flexbox, responsive `@media (max-width: 480px)`
- Tests unitaires : 11 cas couvrant état vide, état signé, toggling de classes, edge cases (nom absent, image absente)
- Tests axe : zéro violation en état vide et signé
- Générateur PDF : rectangle dessiné, padding `SIGNATURE_BOX_PADDING = 8f`, image redimensionnée avec préservation de ratio (`Math.min`), centrage horizontal
- Tests PDF : nom + date dans le bloc, image embarquée, null safety
- Modèles `CraPdfProviderSignature` et `CraPdfClientSignature` cohérents, structure client prête pour l'alignement futur

---

## Problèmes détectés

### BLOQUANT 1 — Le nom du prestataire ne s'affiche jamais dans l'UI

**Fichiers**: `frontend/src/api/types.ts`, `frontend/src/App.tsx`

Le backend (`CraDetailsDto.java`) retourne correctement `providerFirstName` et `providerLastName` via le mapper Java. Mais:

1. `frontend/src/api/types.ts` — l'interface `CraDetailsDto` **ne déclare pas** ces champs
2. `frontend/src/App.tsx` — `dtoToDetails()` **ne les mappe pas** vers `CraDetails`

Résultat : `cra.providerFirstName` et `cra.providerLastName` sont toujours `undefined` dans le state React. Le composant ne rend jamais le `<span className="provider-signature-box__name">`.

**Correction requise** :
```typescript
// api/types.ts — ajouter à CraDetailsDto :
providerFirstName?: string | null;
providerLastName?: string | null;

// App.tsx — ajouter dans dtoToDetails() :
providerFirstName: dto.providerFirstName ?? null,
providerLastName: dto.providerLastName ?? null,
```

---

### BLOQUANT 2 — `providerSignatureImageUrl` n'existe pas dans l'API backend

**Fichiers**: `frontend/src/api/types.ts`, `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java`

`frontend/src/api/types.ts` déclare `providerSignatureImageUrl?: string | null` et le mapper `dtoToDetails` l'utilise, mais le backend ne retourne jamais ce champ. `CraDetailsDto.java` ne contient aucune référence à `providerSignatureImageUrl`, ni le mapper Java `CraDetailsMapper.toDto()`.

Résultat : `cra.providerSignatureImageUrl` est toujours `null` — l'image de signature ne s'affiche jamais dans l'UI.

Le ticket exige explicitement : *"a preview of the stored or captured signature"* et *"The signed state displays the signature, signer name, and signing date"*.

**Correction requise** : Soit ajouter `providerSignatureImageUrl` au `CraDetailsDto.java` backend et le populer depuis le domaine, soit documenter explicitement que cette feature sera implémentée dans un ticket ultérieur (mais dans ce cas, la condition d'acceptance est non remplie).

---

### Mineur — Définition morte et confuse de `CraDetailsDto` dans `cra.ts`

**Fichier**: `frontend/src/types/cra.ts` lignes 27-36

`cra.ts` redéfinit localement une interface `CraDetailsDto` (qui étend `CraSummaryDto` et contient les champs nom prestataire) différente de celle de `api/types.ts`. Cette interface n'est importée par personne (`App.tsx` importe depuis `api/types.ts`). C'est du code mort qui génère confusion et risque de divergence silencieuse.

**Correction requise** : Supprimer la définition de `CraDetailsDto` dans `cra.ts`. Si des champs supplémentaires sont nécessaires dans le type domaine `CraDetails`, les ajouter uniquement là.

---

### Mineur — Handler `onSignClick` fragile (DOM query)

**Fichier**: `frontend/src/App.tsx` ligne 64

```typescript
const btn = craValidationRef.current?.querySelector<HTMLButtonElement>('.cra-validation__button');
btn?.click();
```

Cette approche contourne React et crée un couplage sur le CSS class name interne de `CraValidation`. Si le bouton n'est pas encore rendu (CRA null, loading), le click est silencieusement ignoré — ce qui est probablement acceptable ici. Pas bloquant mais fragile.

---

## Risques éventuels

- L'absence du nom du prestataire dans l'UI (bloquant 1) affecte la lisibilité du document signé et la confiance de l'utilisateur dans l'outil
- L'absence de l'image de signature dans l'UI (bloquant 2) rend le composant UI partiellement vide — un CRA "signé" n'affiche que la date
- Le PDF fonctionne indépendamment (il utilise `CraPdfProviderSignature` qui est alimenté ailleurs dans la stack), ce qui crée une asymétrie UI/PDF

---

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[BLOQUANT]** Ajouter `providerFirstName` et `providerLastName` (et optionnellement `providerCompany`) à `CraDetailsDto` dans `api/types.ts`, et les mapper dans `dtoToDetails()` (`App.tsx`)
2. **[BLOQUANT]** Clarifier et implémenter le canal de `providerSignatureImageUrl` : soit l'ajouter au backend `CraDetailsDto.java` avec sa source de données, soit retirer le champ du frontend et le tracker dans un ticket séparé
3. **[MINEUR]** Supprimer l'interface `CraDetailsDto` redondante dans `cra.ts`

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T058/reviews/implementation-review.md
- generated at: 2026-07-28T11:07:05Z

---

I now have a complete picture. Let me write the structured review.

---

# PR Review — T058: Rectangular Provider Signature Box in CRA UI and PDF

## Résumé

L'implémentation pose des bases solides : le composant `ProviderSignatureBox` est bien construit (BEM, tokens CSS, accessibilité, tests), le générateur PDF produit un bloc rectangulaire avec padding et préservation de ratio, et les tests backend sont cohérents. Cependant, deux problèmes bloquants rendent l'état signé partiellement non fonctionnel en production : le nom du prestataire ne s'affiche jamais, et l'image de signature ne peut jamais être fournie via l'API actuelle.

---

## Vérifications effectuées

- Composant React `ProviderSignatureBox.tsx` et CSS associé
- Tests unitaires et accessibilité (axe)
- Mapper frontend `dtoToDetails` dans `App.tsx`
- Types API `frontend/src/api/types.ts` et `frontend/src/types/cra.ts`
- DTO backend `CraDetailsDto.java` et mapper `CraDetailsMapper.java`
- Générateur PDF `CraPdfGenerator.java` et tests `CraPdfGeneratorTest.java`
- Modèles PDF `CraPdfProviderSignature.java`, `CraPdfSignatures.java`

---

## Points validés

- Le composant `ProviderSignatureBox` implémente correctement les deux états (vide / signé) avec les bonnes classes CSS
- État vide : bordure tiretée, texte d'invitation "Cliquez pour signer", `role="button"`, `tabIndex={0}`, support clavier Enter/Space
- État signé : bordure pleine, image conditionnelle, footer avec nom + date `dd/MM/yyyy`
- CSS : tokens CSS exclusivement, `object-fit: contain`, flexbox, responsive `@media (max-width: 480px)`
- Tests unitaires : 11 cas couvrant état vide, état signé, toggling de classes, edge cases (nom absent, image absente)
- Tests axe : zéro violation en état vide et signé
- Générateur PDF : rectangle dessiné, padding `SIGNATURE_BOX_PADDING = 8f`, image redimensionnée avec préservation de ratio (`Math.min`), centrage horizontal
- Tests PDF : nom + date dans le bloc, image embarquée, null safety
- Modèles `CraPdfProviderSignature` et `CraPdfClientSignature` cohérents, structure client prête pour l'alignement futur

---

## Problèmes détectés

### BLOQUANT 1 — Le nom du prestataire ne s'affiche jamais dans l'UI

**Fichiers**: `frontend/src/api/types.ts`, `frontend/src/App.tsx`

Le backend (`CraDetailsDto.java`) retourne correctement `providerFirstName` et `providerLastName` via le mapper Java. Mais:

1. `frontend/src/api/types.ts` — l'interface `CraDetailsDto` **ne déclare pas** ces champs
2. `frontend/src/App.tsx` — `dtoToDetails()` **ne les mappe pas** vers `CraDetails`

Résultat : `cra.providerFirstName` et `cra.providerLastName` sont toujours `undefined` dans le state React. Le composant ne rend jamais le `<span className="provider-signature-box__name">`.

**Correction requise** :
```typescript
// api/types.ts — ajouter à CraDetailsDto :
providerFirstName?: string | null;
providerLastName?: string | null;

// App.tsx — ajouter dans dtoToDetails() :
providerFirstName: dto.providerFirstName ?? null,
providerLastName: dto.providerLastName ?? null,
```

---

### BLOQUANT 2 — `providerSignatureImageUrl` n'existe pas dans l'API backend

**Fichiers**: `frontend/src/api/types.ts`, `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java`

`frontend/src/api/types.ts` déclare `providerSignatureImageUrl?: string | null` et le mapper `dtoToDetails` l'utilise, mais le backend ne retourne jamais ce champ. `CraDetailsDto.java` ne contient aucune référence à `providerSignatureImageUrl`, ni le mapper Java `CraDetailsMapper.toDto()`.

Résultat : `cra.providerSignatureImageUrl` est toujours `null` — l'image de signature ne s'affiche jamais dans l'UI.

Le ticket exige explicitement : *"a preview of the stored or captured signature"* et *"The signed state displays the signature, signer name, and signing date"*.

**Correction requise** : Soit ajouter `providerSignatureImageUrl` au `CraDetailsDto.java` backend et le populer depuis le domaine, soit documenter explicitement que cette feature sera implémentée dans un ticket ultérieur (mais dans ce cas, la condition d'acceptance est non remplie).

---

### Mineur — Définition morte et confuse de `CraDetailsDto` dans `cra.ts`

**Fichier**: `frontend/src/types/cra.ts` lignes 27-36

`cra.ts` redéfinit localement une interface `CraDetailsDto` (qui étend `CraSummaryDto` et contient les champs nom prestataire) différente de celle de `api/types.ts`. Cette interface n'est importée par personne (`App.tsx` importe depuis `api/types.ts`). C'est du code mort qui génère confusion et risque de divergence silencieuse.

**Correction requise** : Supprimer la définition de `CraDetailsDto` dans `cra.ts`. Si des champs supplémentaires sont nécessaires dans le type domaine `CraDetails`, les ajouter uniquement là.

---

### Mineur — Handler `onSignClick` fragile (DOM query)

**Fichier**: `frontend/src/App.tsx` ligne 64

```typescript
const btn = craValidationRef.current?.querySelector<HTMLButtonElement>('.cra-validation__button');
btn?.click();
```

Cette approche contourne React et crée un couplage sur le CSS class name interne de `CraValidation`. Si le bouton n'est pas encore rendu (CRA null, loading), le click est silencieusement ignoré — ce qui est probablement acceptable ici. Pas bloquant mais fragile.

---

## Risques éventuels

- L'absence du nom du prestataire dans l'UI (bloquant 1) affecte la lisibilité du document signé et la confiance de l'utilisateur dans l'outil
- L'absence de l'image de signature dans l'UI (bloquant 2) rend le composant UI partiellement vide — un CRA "signé" n'affiche que la date
- Le PDF fonctionne indépendamment (il utilise `CraPdfProviderSignature` qui est alimenté ailleurs dans la stack), ce qui crée une asymétrie UI/PDF

---

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[BLOQUANT]** Ajouter `providerFirstName` et `providerLastName` (et optionnellement `providerCompany`) à `CraDetailsDto` dans `api/types.ts`, et les mapper dans `dtoToDetails()` (`App.tsx`)
2. **[BLOQUANT]** Clarifier et implémenter le canal de `providerSignatureImageUrl` : soit l'ajouter au backend `CraDetailsDto.java` avec sa source de données, soit retirer le champ du frontend et le tracker dans un ticket séparé
3. **[MINEUR]** Supprimer l'interface `CraDetailsDto` redondante dans `cra.ts`

---

IMPLEMENTATION_FIX_REQUIRED