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


# T022 — Create CRA total summary panel

**Source**: GitHub Issue #22

## Description

## Context

The user needs to see the monthly worked-day total before validating the CRA.

## Goal

Display a CRA summary panel in the frontend.

## Description

Add a summary panel showing the selected period, CRA status, total worked days, provider, provider company, and client.

The total must update when day values change.

## Out of Scope

- Calendar grid creation
- PDF rendering
- Backend total calculation implementation
- Client signature
- Expenses details

## Acceptance Criteria

- Summary panel displays the selected period
- Summary panel displays CRA status
- Summary panel displays total worked days
- Summary panel displays provider and client information
- Total updates after a day value change
- Loading and error states are handled

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All implementation files are present and untracked (new). Here's the complete summary of what was implemented for T022:

---

## Implementation — T022: CRA Total Summary Panel

### Backend (5 files)

**`backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java`**
Added 6 new fields: `providerFirstName`, `providerLastName`, `providerCompany`, `clientFirstName`, `clientLastName`, `clientCompany`.

**`backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java`**
`toDto()` now reads and maps all 6 new fields from `MonthlyCraReport`.

**3 test files updated** (`CraDtoTest`, `CraDayControllerTest`, `CraValidationControllerTest`)
Each had a direct `new CraDetailsDto(...)` constructor call expanded from 8 to 14 arguments. `CraDtoTest` also gained assertions on the new fields.

### Frontend (4 files)

**`frontend/src/types/cra.ts`**
Added 6 optional fields (`providerFirstName?`, `providerLastName?`, `providerCompany?`, `clientFirstName?`, `clientLastName?`, `clientCompany?`) to `CraDetails`. Existing test fixtures require no changes.

**`frontend/src/components/CraSummaryPanel/CraSummaryPanel.tsx`** *(new)*
Displays period, status, total worked days, provider, provider company, client. Handles loading/error/null states with `data-testid` attributes for testing.

**`frontend/src/components/CraSummaryPanel/CraSummaryPanel.test.tsx`** *(new)*
12 Vitest tests covering all displayed fields, total update on prop change, loading/error/null states, and dash fallback for null provider/client names.

**`frontend/src/App.tsx`**
`<CraSummaryPanel>` rendered above `<CalendarGrid>` — total auto-updates whenever parent `cra` state changes after a day edit.

---

## Review

I have all the information needed. Here is the structured review:

---

# PR Review — T022: Create CRA total summary panel

## Résumé

9 fichiers source modifiés (5 backend, 4 frontend). L'implémentation couvre correctement tous les critères d'acceptance dans le composant et les tests — mais **un fichier critique est toujours manquant**, empêchant la compilation TypeScript. Ce problème avait déjà été signalé en review-attempt-1 et n'a pas été corrigé dans coder-attempt-2.

## Vérifications effectuées

- Ticket T022 lu et critères d'acceptance vérifiés
- Plan `runs/T022/plan.md` consulté
- Les 9 fichiers source du diff lus en intégralité
- Existence de `frontend/src/api/` vérifiée par glob (résultat: absent)
- Reviews précédentes consultées (`implementation-review.md`, `review-attempt-1.md`)

## Points validés

**Backend**
- `CraDetailsDto` : 6 nouveaux champs provider/client ajoutés correctement en tant que `String` nullable
- `CraDetailsMapper.toDto()` : mappe les 6 champs depuis `MonthlyCraReport`, calcul de `totalWorkedDays` par boucle — minimal et acceptable
- `CraDtoTest` : test `craDetailsDtoRoundTrip()` mis à jour à 14 arguments, assertions sur les 6 nouveaux champs
- `CraDayControllerTest` / `CraValidationControllerTest` : constantes `DRAFT_DTO` et `VALIDATED_DTO` mises à jour à 14 arguments — logique des tests inchangée

**Frontend**
- `types/cra.ts` : 6 champs optionnels `string | null` ajoutés à `CraDetails` — cohérence avec le DTO backend
- `CraSummaryPanel.tsx` : composant purement présentationnel, props-driven. Affiche tous les champs requis (période, statut, total, provider, company, client). États loading/error/null gérés. HTML sémantique (`<section aria-label>`, `<dl>/<dt>/<dd>`). Fallback `'—'` pour les noms null
- `CraSummaryPanel.test.tsx` : 12 tests couvrant les 6 champs, la réactivité via `rerender`, les états loading/error/null, et les fallbacks null — couverture solide
- `App.tsx` : `CraSummaryPanel` intégré et rendu avec les props `cra`, `loading`, `error` — réactivité assurée par le state React existant

## Problèmes détectés

### [BLOQUANT] `frontend/src/api/cra.ts` manquant — deuxième signalement

`App.tsx` ligne 2 importe `fetchCra` depuis `'./api/cra'` :

```typescript
import { fetchCra } from './api/cra';
```

Le répertoire `frontend/src/api/` n'existe pas. Ce problème a été signalé dans `review-attempt-1` comme bloquant. `coder-attempt-2` n'a pas créé ce fichier. La compilation TypeScript échoue, l'application ne peut pas démarrer.

**Action requise** : créer `frontend/src/api/cra.ts` exposant :

```typescript
import type { CraDetails } from '../types/cra';

export async function fetchCra(year: number, month: number): Promise<CraDetails> {
  const res = await fetch(`/api/cras?year=${year}&month=${month}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CraDetails>;
}
```

L'URL exacte doit correspondre à l'endpoint backend existant.

### [Mineur] Incohérence de package Java

`CraDetailsMapper` est déclaré dans `com.timizer.backend.cra` tandis que les DTOs sont dans `com.timizerlike.backend.cra.dto`. Ce pattern double-package était présent avant ce ticket — à confirmer si convention existante, sinon à corriger pour cohérence.

### [Observation] Période hardcodée dans App.tsx

`fetchCra(2026, 7)` et `<h1>CRA — July 2026</h1>` sont hardcodés. Acceptable dans le scope de ce ticket (sélecteur de période hors scope), mais à paramétrer lors de l'ajout du sélecteur.

## Risques éventuels

- **Totalisation hors scope** : le ticket marque "Backend total calculation implementation" hors scope, mais le mapper calcule `totalWorkedDays` par sommation. Cette logique est minimale et nécessaire pour alimenter le DTO — acceptable.
- **Mise à jour du total** : l'AC "Total updates after a day value change" repose sur le fait que `CalendarGrid` déclenche une mise à jour du state `cra` dans `App.tsx`. Ce câblage n'est pas visible dans les fichiers de ce ticket — à vérifier que `CalendarGrid` appelle `setCra` ou un équivalent lors d'une modification.

## Décision

REQUEST_CHANGES — 1 bloquant persistant non résolu après deux tentatives coder.

## Actions demandées

1. **[Bloquant]** Créer `frontend/src/api/cra.ts` avec la fonction `fetchCra(year: number, month: number): Promise<CraDetails>` appelant l'endpoint backend réel.
2. **[Vérification]** Confirmer que `CalendarGrid` propage les mises à jour de jour dans le state `cra` de `App.tsx` (prérequis pour l'AC "Total updates after a day value change").

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T022/reviews/implementation-review.md
- generated at: 2026-07-12T16:13:06Z

---

I have all the information needed. Here is the structured review:

---

# PR Review — T022: Create CRA total summary panel

## Résumé

9 fichiers source modifiés (5 backend, 4 frontend). L'implémentation couvre correctement tous les critères d'acceptance dans le composant et les tests — mais **un fichier critique est toujours manquant**, empêchant la compilation TypeScript. Ce problème avait déjà été signalé en review-attempt-1 et n'a pas été corrigé dans coder-attempt-2.

## Vérifications effectuées

- Ticket T022 lu et critères d'acceptance vérifiés
- Plan `runs/T022/plan.md` consulté
- Les 9 fichiers source du diff lus en intégralité
- Existence de `frontend/src/api/` vérifiée par glob (résultat: absent)
- Reviews précédentes consultées (`implementation-review.md`, `review-attempt-1.md`)

## Points validés

**Backend**
- `CraDetailsDto` : 6 nouveaux champs provider/client ajoutés correctement en tant que `String` nullable
- `CraDetailsMapper.toDto()` : mappe les 6 champs depuis `MonthlyCraReport`, calcul de `totalWorkedDays` par boucle — minimal et acceptable
- `CraDtoTest` : test `craDetailsDtoRoundTrip()` mis à jour à 14 arguments, assertions sur les 6 nouveaux champs
- `CraDayControllerTest` / `CraValidationControllerTest` : constantes `DRAFT_DTO` et `VALIDATED_DTO` mises à jour à 14 arguments — logique des tests inchangée

**Frontend**
- `types/cra.ts` : 6 champs optionnels `string | null` ajoutés à `CraDetails` — cohérence avec le DTO backend
- `CraSummaryPanel.tsx` : composant purement présentationnel, props-driven. Affiche tous les champs requis (période, statut, total, provider, company, client). États loading/error/null gérés. HTML sémantique (`<section aria-label>`, `<dl>/<dt>/<dd>`). Fallback `'—'` pour les noms null
- `CraSummaryPanel.test.tsx` : 12 tests couvrant les 6 champs, la réactivité via `rerender`, les états loading/error/null, et les fallbacks null — couverture solide
- `App.tsx` : `CraSummaryPanel` intégré et rendu avec les props `cra`, `loading`, `error` — réactivité assurée par le state React existant

## Problèmes détectés

### [BLOQUANT] `frontend/src/api/cra.ts` manquant — deuxième signalement

`App.tsx` ligne 2 importe `fetchCra` depuis `'./api/cra'` :

```typescript
import { fetchCra } from './api/cra';
```

Le répertoire `frontend/src/api/` n'existe pas. Ce problème a été signalé dans `review-attempt-1` comme bloquant. `coder-attempt-2` n'a pas créé ce fichier. La compilation TypeScript échoue, l'application ne peut pas démarrer.

**Action requise** : créer `frontend/src/api/cra.ts` exposant :

```typescript
import type { CraDetails } from '../types/cra';

export async function fetchCra(year: number, month: number): Promise<CraDetails> {
  const res = await fetch(`/api/cras?year=${year}&month=${month}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CraDetails>;
}
```

L'URL exacte doit correspondre à l'endpoint backend existant.

### [Mineur] Incohérence de package Java

`CraDetailsMapper` est déclaré dans `com.timizer.backend.cra` tandis que les DTOs sont dans `com.timizerlike.backend.cra.dto`. Ce pattern double-package était présent avant ce ticket — à confirmer si convention existante, sinon à corriger pour cohérence.

### [Observation] Période hardcodée dans App.tsx

`fetchCra(2026, 7)` et `<h1>CRA — July 2026</h1>` sont hardcodés. Acceptable dans le scope de ce ticket (sélecteur de période hors scope), mais à paramétrer lors de l'ajout du sélecteur.

## Risques éventuels

- **Totalisation hors scope** : le ticket marque "Backend total calculation implementation" hors scope, mais le mapper calcule `totalWorkedDays` par sommation. Cette logique est minimale et nécessaire pour alimenter le DTO — acceptable.
- **Mise à jour du total** : l'AC "Total updates after a day value change" repose sur le fait que `CalendarGrid` déclenche une mise à jour du state `cra` dans `App.tsx`. Ce câblage n'est pas visible dans les fichiers de ce ticket — à vérifier que `CalendarGrid` appelle `setCra` ou un équivalent lors d'une modification.

## Décision

REQUEST_CHANGES — 1 bloquant persistant non résolu après deux tentatives coder.

## Actions demandées

1. **[Bloquant]** Créer `frontend/src/api/cra.ts` avec la fonction `fetchCra(year: number, month: number): Promise<CraDetails>` appelant l'endpoint backend réel.
2. **[Vérification]** Confirmer que `CalendarGrid` propage les mises à jour de jour dans le state `cra` de `App.tsx` (prérequis pour l'AC "Total updates after a day value change").

---

IMPLEMENTATION_FIX_REQUIRED