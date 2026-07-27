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


# T040 — Fix frontend runtime errors, React warnings, and failed API interactions

**Source**: GitHub Issue #72

## Description

## Context
The Timizer-like frontend is currently buggy and may expose runtime errors, React warnings, or broken API interactions.

## Goal
Eliminate all reproducible frontend errors in the main CRA workflows.

## Description
Run the application and exercise month selection, CRA creation and loading, day status changes, validation, history, and PDF download. Investigate and fix all reproducible JavaScript exceptions, React warnings, invalid state transitions, malformed requests, stale state issues, and unhandled API failures.

Do not hide errors by removing logging or suppressing warnings. Fix their underlying cause and add a regression test for each significant defect.

## Out of Scope
- Purely cosmetic redesign work.
- New business features.
- Suppressing warnings without resolving them.

## Acceptance Criteria
- [ ] Main CRA flows complete without uncaught frontend exceptions.
- [ ] Browser console contains no React warnings during normal use.
- [ ] Failed requests are handled without breaking the page.
- [ ] State remains consistent after rapid or repeated user interactions.
- [ ] Significant fixed defects have regression tests.
- [ ] Existing automated tests pass.
- [ ] A short list of fixed defects is included in the pull request description.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

**70/70 tests pass.** Here's a summary of every change made:

---

## Files modified

| File | Defect |
|------|--------|
| `src/api/httpClient.ts` | D2: `REACT_APP_API_BASE_URL` → `VITE_API_BASE_URL`; D7: optional `signal` on `apiGet`/`apiGetBlob`, re-throws `AbortError` |
| `src/api/types.ts` | D5: added `validationDate: string \| null` to `CraSummaryDto` |
| `src/types/cra.ts` | D5: removed duplicate `CraSummaryDto`, re-exported from `api/types` |
| `src/api/craClient.ts` | D7: added optional `signal` to `listCras` and `downloadCraPdf` |
| `src/App.tsx` | D1: `handleOpen` now calls `getCra(id)`; `craLoading`/`craError` state replaces hardcoded `false`/`null` props |
| `src/main.tsx` | D6: wrapped `<App />` in `<ErrorBoundary>` |
| `src/components/CraMonthSelector/CraMonthSelector.tsx` | D4: imports from `craClient`; D7: `useEffect` returns `AbortController` cleanup |
| `src/components/CraHistory/CraHistory.tsx` | D4: imports from `craClient`; D7: `useEffect` returns `AbortController` cleanup |
| `src/components/CraMonthSelector/CraMonthSelector.test.tsx` | D4: mock target updated to `../../api/craClient` |
| `src/components/CraHistory/CraHistory.test.tsx` | D4: mock target updated to `../../api/craClient` |
| `src/api/__tests__/craClient.test.ts` | Updated 3 `toHaveBeenCalledWith` assertions to include `undefined` second arg (consequence of D7) |

## Files created

| File | Defect |
|------|--------|
| `src/components/ErrorBoundary/ErrorBoundary.tsx` | D6: class component with `getDerivedStateFromError`/`componentDidCatch` and a "Try again" reset |
| `src/App.test.tsx` | Regression tests for D1 (4 cases) |
| `src/api/__tests__/httpClient.test.ts` | Regression tests for D2 + D7 (5 cases) |

## Files deleted

| File | Reason |
|------|--------|
| `src/api/cra.ts` | D4: zero active callers after migration to `craClient.ts` |

---

## Review

I now have a complete picture. Writing the review.

---

# PR Review — T040: Fix frontend runtime errors, React warnings, and failed API interactions

## Résumé

L'implémentation couvre correctement les 7 défauts identifiés dans le plan (D1–D7) et les 70 tests passent. Cependant, `tsc --noEmit` échoue avec 2 erreurs TypeScript, ce qui contredit directement le critère d'acceptation 6 du plan. Ces erreurs sont bloquantes.

---

## Vérifications effectuées

- Lecture du plan, des fichiers modifiés, créés et supprimés
- Exécution de `vitest run` → 70/70 ✅
- Exécution de `tsc --noEmit` → **2 erreurs** ❌
- Lecture du backend Python → aucun router CRA existant (D3 non vérifiable)
- Inspection croisée des types entre `api/types.ts` et `types/cra.ts`

---

## Points validés

- **D1** : `handleOpen` appelle bien `getCra(id)` ; `craLoading`/`craError` remplacent les props hardcodées `false`/`null` dans `App.tsx:30-42`.
- **D2** : `httpClient.ts:3` utilise `import.meta.env.VITE_API_BASE_URL`. Plus aucune référence `process.env.REACT_APP_*`.
- **D4** : `CraMonthSelector` et `CraHistory` importent depuis `craClient.ts`. `api/cra.ts` est supprimé.
- **D6** : `ErrorBoundary` correctement implémenté (`getDerivedStateFromError` + `componentDidCatch`) et appliqué dans `main.tsx:9`.
- **D7** : Les deux `useEffect` retournent un cleanup `AbortController`. L'`AbortError` est re-throwé sans être wrappé dans un `ApiError`.
- **Tests** : `App.test.tsx`, `httpClient.test.ts`, cas PDF dans `CraHistory.test.tsx` ajoutés. 70 tests ✅.

---

## Problèmes détectés

### Bloquant — TypeScript ne compile pas (`tsc --noEmit` échoue)

Le critère d'acceptation 6 du plan stipule : *"`tsc --noEmit` reports zero errors"*. Ce n'est pas le cas :

**Erreur 1** — `src/api/__tests__/craClient.test.ts:18`

```
error TS2741: Property 'validationDate' is missing in type
'{ id: ..., status: "DRAFT"; }' but required in type 'CraSummaryDto'.
```

Le fixture `mockSummaries` n'a pas été mis à jour après l'ajout de `validationDate: string | null` dans `CraSummaryDto` (D5). Correction simple :

```typescript
// avant
const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT' },
];
// après
const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT', validationDate: null },
];
```

---

**Erreur 2** — `src/types/cra.ts:24`

```
error TS2304: Cannot find name 'CraSummaryDto'.
```

`types/cra.ts` fait un `export type { CraSummaryDto } from '../api/types'`. Ce `export type` ne met pas `CraSummaryDto` dans la portée locale. L'interface `CraDetailsDto` à la ligne 24 essaie de faire `extends CraSummaryDto`, qui n'est pas résolu.

Ce problème révèle aussi un résidu de D5 : le plan demandait de consolider les types dupliqués, mais `types/cra.ts` déclare toujours un `CraDetailsDto` local (avec `days: CraDayEntry[]` où `worked: number`) structurellement différent de `api/types.CraDetailsDto` (avec `days: CraDayEntryDto[]` où `worked: 0 | 0.5 | 1`).

Correction recommandée — ajouter l'import en plus du re-export :

```typescript
// types/cra.ts
import type { CraSummaryDto } from '../api/types';
export type { CraSummaryDto } from '../api/types';
// ... reste du fichier inchangé
```

---

### Observation (non bloquante) — D3 non vérifiable, URL inconsistente conservée

Le backend Python (`backend/app/main.py`) n'a aucun router CRA. Il est donc impossible de vérifier si l'endpoint de création est `/api/cra` ou `/api/cras`. `craClient.ts:10` appelle `POST /api/cra` tandis que toutes les autres fonctions (listCras, getCra…) utilisent `/api/cras`. Ce risque de 404 à la création reste latent et devra être résolu dès que le backend implémentera les routes.

---

### Observation (non bloquante) — Bruit jsdom dans la sortie de tests

```
Error: Not implemented: navigation (except hash changes)
```

Ce message vient du `a.click()` dans `handleDownloadPdf` (jsdom ne supporte pas la navigation). Les tests passent, mais le bruit stderr peut masquer de vraies erreurs en CI. Envisager d'asserter uniquement `craApi.downloadCraPdf` a été appelé, sans déclencher le clic sur l'ancre synthétique.

---

## Risques éventuels

- Le `CraDetailsDto` local dans `types/cra.ts` (non utilisé par `App.tsx`) peut induire des confusions de typage si un futur développeur importe depuis `types/cra` plutôt que `api/types`.
- L'URL `/api/cra` pour la création est un bug potentiel en production dès que le backend sera disponible.

---

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES**

## Actions demandées

1. **(Bloquant)** Ajouter `validationDate: null` au fixture `mockSummaries` dans `src/api/__tests__/craClient.test.ts:18`.
2. **(Bloquant)** Ajouter `import type { CraSummaryDto } from '../api/types'` dans `src/types/cra.ts` (en plus du re-export existant) pour résoudre l'erreur de compilation à la ligne 24.
3. **(Recommandé)** Vérifier et aligner l'URL de `createCra` (`/api/cra` vs `/api/cras`) dès que le backend implémentera les routes CRA.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T040/reviews/implementation-review.md
- generated at: 2026-07-27T20:28:24Z

---

I now have a complete picture. Writing the review.

---

# PR Review — T040: Fix frontend runtime errors, React warnings, and failed API interactions

## Résumé

L'implémentation couvre correctement les 7 défauts identifiés dans le plan (D1–D7) et les 70 tests passent. Cependant, `tsc --noEmit` échoue avec 2 erreurs TypeScript, ce qui contredit directement le critère d'acceptation 6 du plan. Ces erreurs sont bloquantes.

---

## Vérifications effectuées

- Lecture du plan, des fichiers modifiés, créés et supprimés
- Exécution de `vitest run` → 70/70 ✅
- Exécution de `tsc --noEmit` → **2 erreurs** ❌
- Lecture du backend Python → aucun router CRA existant (D3 non vérifiable)
- Inspection croisée des types entre `api/types.ts` et `types/cra.ts`

---

## Points validés

- **D1** : `handleOpen` appelle bien `getCra(id)` ; `craLoading`/`craError` remplacent les props hardcodées `false`/`null` dans `App.tsx:30-42`.
- **D2** : `httpClient.ts:3` utilise `import.meta.env.VITE_API_BASE_URL`. Plus aucune référence `process.env.REACT_APP_*`.
- **D4** : `CraMonthSelector` et `CraHistory` importent depuis `craClient.ts`. `api/cra.ts` est supprimé.
- **D6** : `ErrorBoundary` correctement implémenté (`getDerivedStateFromError` + `componentDidCatch`) et appliqué dans `main.tsx:9`.
- **D7** : Les deux `useEffect` retournent un cleanup `AbortController`. L'`AbortError` est re-throwé sans être wrappé dans un `ApiError`.
- **Tests** : `App.test.tsx`, `httpClient.test.ts`, cas PDF dans `CraHistory.test.tsx` ajoutés. 70 tests ✅.

---

## Problèmes détectés

### Bloquant — TypeScript ne compile pas (`tsc --noEmit` échoue)

Le critère d'acceptation 6 du plan stipule : *"`tsc --noEmit` reports zero errors"*. Ce n'est pas le cas :

**Erreur 1** — `src/api/__tests__/craClient.test.ts:18`

```
error TS2741: Property 'validationDate' is missing in type
'{ id: ..., status: "DRAFT"; }' but required in type 'CraSummaryDto'.
```

Le fixture `mockSummaries` n'a pas été mis à jour après l'ajout de `validationDate: string | null` dans `CraSummaryDto` (D5). Correction simple :

```typescript
// avant
const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT' },
];
// après
const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT', validationDate: null },
];
```

---

**Erreur 2** — `src/types/cra.ts:24`

```
error TS2304: Cannot find name 'CraSummaryDto'.
```

`types/cra.ts` fait un `export type { CraSummaryDto } from '../api/types'`. Ce `export type` ne met pas `CraSummaryDto` dans la portée locale. L'interface `CraDetailsDto` à la ligne 24 essaie de faire `extends CraSummaryDto`, qui n'est pas résolu.

Ce problème révèle aussi un résidu de D5 : le plan demandait de consolider les types dupliqués, mais `types/cra.ts` déclare toujours un `CraDetailsDto` local (avec `days: CraDayEntry[]` où `worked: number`) structurellement différent de `api/types.CraDetailsDto` (avec `days: CraDayEntryDto[]` où `worked: 0 | 0.5 | 1`).

Correction recommandée — ajouter l'import en plus du re-export :

```typescript
// types/cra.ts
import type { CraSummaryDto } from '../api/types';
export type { CraSummaryDto } from '../api/types';
// ... reste du fichier inchangé
```

---

### Observation (non bloquante) — D3 non vérifiable, URL inconsistente conservée

Le backend Python (`backend/app/main.py`) n'a aucun router CRA. Il est donc impossible de vérifier si l'endpoint de création est `/api/cra` ou `/api/cras`. `craClient.ts:10` appelle `POST /api/cra` tandis que toutes les autres fonctions (listCras, getCra…) utilisent `/api/cras`. Ce risque de 404 à la création reste latent et devra être résolu dès que le backend implémentera les routes.

---

### Observation (non bloquante) — Bruit jsdom dans la sortie de tests

```
Error: Not implemented: navigation (except hash changes)
```

Ce message vient du `a.click()` dans `handleDownloadPdf` (jsdom ne supporte pas la navigation). Les tests passent, mais le bruit stderr peut masquer de vraies erreurs en CI. Envisager d'asserter uniquement `craApi.downloadCraPdf` a été appelé, sans déclencher le clic sur l'ancre synthétique.

---

## Risques éventuels

- Le `CraDetailsDto` local dans `types/cra.ts` (non utilisé par `App.tsx`) peut induire des confusions de typage si un futur développeur importe depuis `types/cra` plutôt que `api/types`.
- L'URL `/api/cra` pour la création est un bug potentiel en production dès que le backend sera disponible.

---

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES**

## Actions demandées

1. **(Bloquant)** Ajouter `validationDate: null` au fixture `mockSummaries` dans `src/api/__tests__/craClient.test.ts:18`.
2. **(Bloquant)** Ajouter `import type { CraSummaryDto } from '../api/types'` dans `src/types/cra.ts` (en plus du re-export existant) pour résoudre l'erreur de compilation à la ligne 24.
3. **(Recommandé)** Vérifier et aligner l'URL de `createCra` (`/api/cra` vs `/api/cras`) dès que le backend implémentera les routes CRA.

IMPLEMENTATION_FIX_REQUIRED