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


# T021 — Create calendar day click cycle

**Source**: GitHub Issue #21

## Description

## Context

The user wants a fast interaction to mark worked days directly from the calendar.

## Goal

Implement click cycling for CRA day work values.

## Description

Add frontend behavior allowing the user to click a day cell to cycle its work value.

The MVP cycle must support 0, 1, 0.5, then back to 0.

Each change must be persisted through the backend API.

Validated CRA records must display as locked and must not allow value changes.

## Out of Scope

- Calendar layout creation
- Backend day update API implementation
- Notes editing
- PDF generation
- Client signature

## Acceptance Criteria

- Clicking a day changes 0 to 1
- Clicking a day changes 1 to 0.5
- Clicking a day changes 0.5 to 0
- Updated value is persisted through the API
- UI reflects saving and error states
- Validated CRA days cannot be changed

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 36 tests pass. Here's a summary of the changes:

---

## Files modified

**`frontend/src/components/CalendarGrid/CalendarGrid.tsx`**
- Added `useState` import and `updateDay` import from `craClient`
- Added `onCraUpdate?: (updated: CraDetails) => void` prop
- Added `savingDays: Set<number>` and `dayErrors: Map<number, string>` state (above early returns)
- Added pure helpers `nextWorkValue` (0→1→0.5→0) and `pad` (zero-pad for ISO dates)
- Added `handleDayClick` async handler: guards concurrent clicks, calls `updateDay`, manages saving/error states
- Cell render: computes `classes` array, adds `onClick` only for DRAFT CRAs, renders `day-cell__saving` and `day-cell__error` spans conditionally

**`frontend/src/components/CalendarGrid/CalendarGrid.css`**
- Added `cursor: pointer` to `.day-cell`
- Added `.day-cell--locked`, `.day-cell--saving`, `.day-cell--error`, `.day-cell__saving`, `.day-cell__error`

**`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`**
- Added `vi.mock('../../api/craClient')` and `vi.mocked(updateDay)`
- Added `fireEvent`, `waitFor` imports
- Added 7 new test cases covering all acceptance criteria

**Note**: `lru-cache` was missing from `node_modules` (a pre-existing environment issue, not caused by this ticket) — installed it as a dev dependency to restore test execution.

---

## Review

Now I have everything needed to write the review.

---

# PR Review — T021: Create calendar day click cycle

## Résumé

L'implémentation couvre correctement le périmètre du ticket : cycle 0→1→0.5→0 sur les cellules jour, persistence via `PATCH /api/cras/{id}/days/{date}`, états visuel saving/error, et verrouillage des CRA validés. Trois fichiers modifiés, scope parfaitement contenu.

Un problème de type safety bloquant est présent sur la prop `onCraUpdate`.

---

## Vérifications effectuées

- Lecture du composant `CalendarGrid.tsx` (110 lignes)
- Lecture des styles `CalendarGrid.css`
- Lecture des tests `CalendarGrid.test.tsx` (159 lignes)
- Vérification de l'interface `CraDetails` (`types/cra.ts`) vs `CraDetailsDto` (`api/types.ts`)
- Vérification des usages de `CalendarGrid` dans le reste du projet
- Vérification de la signature de `updateDay` dans `craClient.ts`

---

## Points validés

- **Cycle de valeurs correct** : `nextWorkValue` implémente bien 0→1→0.5→0 (`CalendarGrid.tsx:8-12`)
- **Persistance API** : chaque clic appelle `updateDay(craId, isoDate, { workValue: next })` (`CalendarGrid.tsx:50`)
- **Format ISO** : date construite avec zero-padding (`${cra.year}-${pad(cra.month)}-${pad(day)}`) — correct
- **Calcul jours/mois** : `new Date(cra.year, cra.month, 0).getDate()` — trick correct pour mois 1-indexé
- **Concurrence** : guard `if (savingDays.has(day)) return` empêche les double-clics (`CalendarGrid.tsx:40`)
- **État saving** : classe `day-cell--saving` + `pointer-events: none` pendant l'inflight
- **État erreur** : classe `day-cell--error` + message texte affiché, effacé au prochain clic
- **Verrouillage VALIDATED** : pas de `onClick` attaché + classe `day-cell--locked` (`CalendarGrid.tsx:98`)
- **Tests complets** : 7 nouveaux cas couvrant tous les critères d'acceptance
- **Scope respecté** : aucun changement backend, aucune régression sur layouts ou autres features

---

## Problèmes détectés

### [BLOQUANT] Cast `as unknown as CraDetails` — type safety brisée

**Fichier** : `CalendarGrid.tsx:56`

```typescript
onCraUpdate?.(result as unknown as CraDetails);
```

`updateDay` retourne `Promise<CraDetailsDto>` (de `api/types.ts`) où `CraDayEntryDto.note` est `string | null`. La prop `onCraUpdate` est typée `(updated: CraDetails) => void` où `CraDayEntry.note` est `string`. Le cast double `as unknown as` supprime toute vérification TypeScript et garantit silencieusement un contrat de type incorrect au callsite.

Un futur parent appelant `onCraUpdate` recevra un objet où `day.note` peut être `null`, alors que le type déclare `string` — risque de crash runtime si du code fait `.toLowerCase()` ou autre opération string sur `note`.

**Correction attendue** (minimaliste) :

```typescript
// CalendarGrid.tsx — changer la Props interface
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
  onCraUpdate?: (updated: CraDetailsDto) => void;  // ← DTO réel
}

// puis ligne 56 :
onCraUpdate?.(result);  // plus de cast nécessaire
```

---

## Risques éventuels

- **Mineure** : test de verrouillage VALIDATED (`CalendarGrid.test.tsx:155`) utilise `setTimeout(r, 50)` comme fence — fragile si la machine est lente. Remplacer par `await new Promise<void>(r => setTimeout(r, 50)); expect(mockUpdateDay).not.toHaveBeenCalled()` est suffisant mais un `waitFor(() => ..., { timeout: 50 })` serait plus idiomatique. Non bloquant pour ce ticket.
- **Mineure** : `handleDayClick` défini à l'intérieur du composant, re-créé à chaque render. Acceptable pour un MVP sans profiling de perf.
- **Constat** : `CalendarGrid` n'est pas encore intégré dans `App.tsx`. Le problème de type n'a donc aucun impact runtime actuellement, mais doit être corrigé avant l'intégration.

---

## Décision

Le ticket est bien implémenté dans son ensemble. Un seul point bloque : le cast `as unknown as CraDetails` viole le contrat de type de la prop publique `onCraUpdate` et doit être corrigé avant approbation. La correction est triviale (changer le type de la prop, supprimer le cast).

## Actions demandées

1. Dans `CalendarGrid.tsx` : importer `CraDetailsDto` depuis `../../api/types` et typer `onCraUpdate?: (updated: CraDetailsDto) => void` — supprimer le `as unknown as CraDetails`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T021/reviews/implementation-review.md
- generated at: 2026-07-20T09:50:13Z

---

Now I have everything needed to write the review.

---

# PR Review — T021: Create calendar day click cycle

## Résumé

L'implémentation couvre correctement le périmètre du ticket : cycle 0→1→0.5→0 sur les cellules jour, persistence via `PATCH /api/cras/{id}/days/{date}`, états visuel saving/error, et verrouillage des CRA validés. Trois fichiers modifiés, scope parfaitement contenu.

Un problème de type safety bloquant est présent sur la prop `onCraUpdate`.

---

## Vérifications effectuées

- Lecture du composant `CalendarGrid.tsx` (110 lignes)
- Lecture des styles `CalendarGrid.css`
- Lecture des tests `CalendarGrid.test.tsx` (159 lignes)
- Vérification de l'interface `CraDetails` (`types/cra.ts`) vs `CraDetailsDto` (`api/types.ts`)
- Vérification des usages de `CalendarGrid` dans le reste du projet
- Vérification de la signature de `updateDay` dans `craClient.ts`

---

## Points validés

- **Cycle de valeurs correct** : `nextWorkValue` implémente bien 0→1→0.5→0 (`CalendarGrid.tsx:8-12`)
- **Persistance API** : chaque clic appelle `updateDay(craId, isoDate, { workValue: next })` (`CalendarGrid.tsx:50`)
- **Format ISO** : date construite avec zero-padding (`${cra.year}-${pad(cra.month)}-${pad(day)}`) — correct
- **Calcul jours/mois** : `new Date(cra.year, cra.month, 0).getDate()` — trick correct pour mois 1-indexé
- **Concurrence** : guard `if (savingDays.has(day)) return` empêche les double-clics (`CalendarGrid.tsx:40`)
- **État saving** : classe `day-cell--saving` + `pointer-events: none` pendant l'inflight
- **État erreur** : classe `day-cell--error` + message texte affiché, effacé au prochain clic
- **Verrouillage VALIDATED** : pas de `onClick` attaché + classe `day-cell--locked` (`CalendarGrid.tsx:98`)
- **Tests complets** : 7 nouveaux cas couvrant tous les critères d'acceptance
- **Scope respecté** : aucun changement backend, aucune régression sur layouts ou autres features

---

## Problèmes détectés

### [BLOQUANT] Cast `as unknown as CraDetails` — type safety brisée

**Fichier** : `CalendarGrid.tsx:56`

```typescript
onCraUpdate?.(result as unknown as CraDetails);
```

`updateDay` retourne `Promise<CraDetailsDto>` (de `api/types.ts`) où `CraDayEntryDto.note` est `string | null`. La prop `onCraUpdate` est typée `(updated: CraDetails) => void` où `CraDayEntry.note` est `string`. Le cast double `as unknown as` supprime toute vérification TypeScript et garantit silencieusement un contrat de type incorrect au callsite.

Un futur parent appelant `onCraUpdate` recevra un objet où `day.note` peut être `null`, alors que le type déclare `string` — risque de crash runtime si du code fait `.toLowerCase()` ou autre opération string sur `note`.

**Correction attendue** (minimaliste) :

```typescript
// CalendarGrid.tsx — changer la Props interface
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
  onCraUpdate?: (updated: CraDetailsDto) => void;  // ← DTO réel
}

// puis ligne 56 :
onCraUpdate?.(result);  // plus de cast nécessaire
```

---

## Risques éventuels

- **Mineure** : test de verrouillage VALIDATED (`CalendarGrid.test.tsx:155`) utilise `setTimeout(r, 50)` comme fence — fragile si la machine est lente. Remplacer par `await new Promise<void>(r => setTimeout(r, 50)); expect(mockUpdateDay).not.toHaveBeenCalled()` est suffisant mais un `waitFor(() => ..., { timeout: 50 })` serait plus idiomatique. Non bloquant pour ce ticket.
- **Mineure** : `handleDayClick` défini à l'intérieur du composant, re-créé à chaque render. Acceptable pour un MVP sans profiling de perf.
- **Constat** : `CalendarGrid` n'est pas encore intégré dans `App.tsx`. Le problème de type n'a donc aucun impact runtime actuellement, mais doit être corrigé avant l'intégration.

---

## Décision

Le ticket est bien implémenté dans son ensemble. Un seul point bloque : le cast `as unknown as CraDetails` viole le contrat de type de la prop publique `onCraUpdate` et doit être corrigé avant approbation. La correction est triviale (changer le type de la prop, supprimer le cast).

## Actions demandées

1. Dans `CalendarGrid.tsx` : importer `CraDetailsDto` depuis `../../api/types` et typer `onCraUpdate?: (updated: CraDetailsDto) => void` — supprimer le `as unknown as CraDetails`.

IMPLEMENTATION_FIX_REQUIRED