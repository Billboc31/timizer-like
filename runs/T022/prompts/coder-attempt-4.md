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

`frontend/src/api/cra.ts` is created. The fix is complete.

**What changed:**
- Created `frontend/src/api/cra.ts` — exports `fetchCra(year, month)` calling `GET /api/cras?year=Y&month=M`, which is the only blocking issue flagged across two reviews. The URL matches the `/api/cras/...` pattern already established in the backend controller tests.

**On the CalendarGrid update question from the review:** `App.tsx` passes `cra` as a prop to `<CalendarGrid>` but no `setCra` callback is wired through. If CalendarGrid needs to trigger a re-fetch after a day edit, that would require adding an `onDayUpdated` callback — but that component doesn't exist in this repo yet, so it's outside the scope of this ticket.

---

## Review

I now have a complete picture. Let me write the review.

---

# PR Review — T022: Create CRA total summary panel

## Résumé

Coder-attempt-3 a résolu le seul problème bloquant des deux reviews précédentes (`frontend/src/api/cra.ts` absent). Cependant, `App.tsx` importe `CalendarGrid` depuis un chemin qui n'existe pas dans le worktree — ce qui constitue un nouveau bloquant de compilation TypeScript/Vite, distinct du précédent.

---

## Vérifications effectuées

- Lecture des 5 fichiers source frontend, des 5 fichiers backend, des 2 tests de controllers
- Glob complet de `frontend/src/**/*` — 5 fichiers présents, aucun `CalendarGrid`
- Vérification dans `git show` que `frontend/src/api/cra.ts` a bien été créé dans coder-attempt-3 (commit `cfc6d1f`)
- Confirmation que `App.tsx` (commit `4279840`) introduit l'import `CalendarGrid` non résolu
- Lecture des reviews précédentes (review-attempt-1, implementation-review.md) pour comparaison
- Vérification que la base branch `ai-dev-factory/bootstrap-agent-layout` ne contient aucun répertoire `frontend/`

---

## Points validés

**Résolu depuis review-attempt-2**

- `frontend/src/api/cra.ts` — présent et correct : appel `fetch('/api/cras?year=…&month=…')`, vérification `res.ok`, re-throw en `Error`, typage retour `Promise<CraDetails>`. Résout le bloquant des deux reviews précédentes.

**Backend**

- `CraDetailsDto` : record Java à 14 champs incluant les 6 nouveaux provider/client, nullable `String` — correct
- `CraDetailsMapper.toDto()` : mappe les 6 champs via getters, calcul `totalWorkedDays` par sommation — minimal et acceptable (le ticket exclut une logique métier complexe de calcul, pas ce minimum)
- `CraDtoTest` : test `craDetailsDtoRoundTrip` mis à jour à 14 arguments avec assertions sur les 6 champs provider/client — couverture correcte
- `CraDayControllerTest` / `CraValidationControllerTest` : constantes `DRAFT_DTO` / `VALIDATED_DTO` mises à jour à 14 arguments, logique de test préservée

**Frontend — composant**

- `CraSummaryPanel.tsx` : composant purement présentationnel (aucun state, aucun `useEffect`), props-driven — réactivité totale garantie par React sans état local
- Affiche : période (nom de mois + année), statut, total worked days, provider (prénom+nom), provider company, client (prénom+nom)
- États `loading` / `error` / `cra null` gérés explicitement par early return
- Fallback `'—'` pour noms null via `filter(Boolean).join(' ') || '—'` et `?? '—'`
- HTML sémantique : `<section aria-label="CRA Summary">`, `<dl>/<dt>/<dd>`, `data-testid` cohérents

- `CraSummaryPanel.test.tsx` : 12 tests couvrant tous les champs, `rerender` pour l'AC réactivité du total, états loading/error/null, dash fallback pour noms nuls et company null — couverture solide

- `types/cra.ts` : interface `CraDetails` à 6 champs optionnels `string | null`, alignée avec le DTO backend

---

## Problèmes détectés

### 🔴 Bloquant — `CalendarGrid` importé mais inexistant

`App.tsx` ligne 4–5 :

```tsx
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
…
<CalendarGrid cra={cra} loading={loading} error={error} />
```

`frontend/src/components/CalendarGrid/` n'existe pas. Le glob de l'intégralité de `frontend/src/` ne retourne que 5 fichiers, aucun dans un sous-répertoire `CalendarGrid/`. La base branch n'a pas de `frontend/` du tout — ce composant n'a donc jamais existé. TypeScript et Vite échoueront à compiler `App.tsx`.

La "Calendar grid creation" est explicitement hors scope du ticket T022. L'import de `CalendarGrid` dans `App.tsx` est une dérive de scope qui introduit une dépendance cassée.

**Action requise** : retirer l'import `CalendarGrid` et son usage de `App.tsx`. L'app doit rendre uniquement `<CraSummaryPanel>` dans le scope de ce ticket. `CalendarGrid` sera ajouté lorsque son ticket sera implémenté.

```tsx
// App.tsx — version corrigée
import { useEffect, useState } from 'react';
import { fetchCra } from './api/cra';
import type { CraDetails } from './types/cra';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';

export default function App() {
  const [cra, setCra] = useState<CraDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCra(2026, 7)
      .then(data => { setCra(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>CRA — July 2026</h1>
      <CraSummaryPanel cra={cra} loading={loading} error={error} />
    </div>
  );
}
```

---

### 🟡 Observation — Package Java incohérent (carry-over)

`CraDetailsMapper` est déclaré dans `com.timizer.backend.cra` alors que les DTOs sont dans `com.timizerlike.backend.cra.dto`. Les tests importent des exceptions depuis `com.timizer.backend.cra`, ce qui suggère une convention de double-package pré-existante. Acceptable si intentionnel, à vérifier.

---

### 🟡 Observation — Période hardcodée dans `App.tsx`

`fetchCra(2026, 7)` et `<h1>CRA — July 2026</h1>` sont fixes. Hors scope pour ce ticket, à paramétrer lors de l'implémentation du sélecteur de période.

---

## Risques éventuels

- **AC "Total updates after a day value change"** : sans `CalendarGrid`, il n'existe aucun mécanisme pour déclencher une mise à jour depuis les saisies de jours. L'AC est vérifiable uniquement via le test unitaire `rerender`. Une fois `CalendarGrid` implémenté (futur ticket), il devra appeler un callback `onUpdate` ou équivalent pour propager les changements dans le state `cra` d'`App.tsx`.
- **Infrastructure frontend absente** : aucun `package.json`, `tsconfig.json`, `vite.config.ts`, ni `index.html` dans le diff ou le worktree. Les tests ne peuvent pas s'exécuter et l'app ne peut pas se builder sans ces fichiers. À confirmer si ces artefacts sont gérés en dehors du scope du coder (CI bootstrap, image Docker, etc.).

---

## Décision

1 problème bloquant : import `CalendarGrid` non résolu dans `App.tsx`, causant une erreur de compilation TypeScript/Vite.

## Action requise

**[Bloquant]** Retirer l'import `{ CalendarGrid }` et le JSX `<CalendarGrid …>` de `App.tsx`. Le scope de ce ticket est limité au panel de résumé — `CalendarGrid` est hors scope et ne peut être importé avant son implémentation.

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T022/reviews/implementation-review.md
- generated at: 2026-07-12T16:19:49Z

---

I now have a complete picture. Let me write the review.

---

# PR Review — T022: Create CRA total summary panel

## Résumé

Coder-attempt-3 a résolu le seul problème bloquant des deux reviews précédentes (`frontend/src/api/cra.ts` absent). Cependant, `App.tsx` importe `CalendarGrid` depuis un chemin qui n'existe pas dans le worktree — ce qui constitue un nouveau bloquant de compilation TypeScript/Vite, distinct du précédent.

---

## Vérifications effectuées

- Lecture des 5 fichiers source frontend, des 5 fichiers backend, des 2 tests de controllers
- Glob complet de `frontend/src/**/*` — 5 fichiers présents, aucun `CalendarGrid`
- Vérification dans `git show` que `frontend/src/api/cra.ts` a bien été créé dans coder-attempt-3 (commit `cfc6d1f`)
- Confirmation que `App.tsx` (commit `4279840`) introduit l'import `CalendarGrid` non résolu
- Lecture des reviews précédentes (review-attempt-1, implementation-review.md) pour comparaison
- Vérification que la base branch `ai-dev-factory/bootstrap-agent-layout` ne contient aucun répertoire `frontend/`

---

## Points validés

**Résolu depuis review-attempt-2**

- `frontend/src/api/cra.ts` — présent et correct : appel `fetch('/api/cras?year=…&month=…')`, vérification `res.ok`, re-throw en `Error`, typage retour `Promise<CraDetails>`. Résout le bloquant des deux reviews précédentes.

**Backend**

- `CraDetailsDto` : record Java à 14 champs incluant les 6 nouveaux provider/client, nullable `String` — correct
- `CraDetailsMapper.toDto()` : mappe les 6 champs via getters, calcul `totalWorkedDays` par sommation — minimal et acceptable (le ticket exclut une logique métier complexe de calcul, pas ce minimum)
- `CraDtoTest` : test `craDetailsDtoRoundTrip` mis à jour à 14 arguments avec assertions sur les 6 champs provider/client — couverture correcte
- `CraDayControllerTest` / `CraValidationControllerTest` : constantes `DRAFT_DTO` / `VALIDATED_DTO` mises à jour à 14 arguments, logique de test préservée

**Frontend — composant**

- `CraSummaryPanel.tsx` : composant purement présentationnel (aucun state, aucun `useEffect`), props-driven — réactivité totale garantie par React sans état local
- Affiche : période (nom de mois + année), statut, total worked days, provider (prénom+nom), provider company, client (prénom+nom)
- États `loading` / `error` / `cra null` gérés explicitement par early return
- Fallback `'—'` pour noms null via `filter(Boolean).join(' ') || '—'` et `?? '—'`
- HTML sémantique : `<section aria-label="CRA Summary">`, `<dl>/<dt>/<dd>`, `data-testid` cohérents

- `CraSummaryPanel.test.tsx` : 12 tests couvrant tous les champs, `rerender` pour l'AC réactivité du total, états loading/error/null, dash fallback pour noms nuls et company null — couverture solide

- `types/cra.ts` : interface `CraDetails` à 6 champs optionnels `string | null`, alignée avec le DTO backend

---

## Problèmes détectés

### 🔴 Bloquant — `CalendarGrid` importé mais inexistant

`App.tsx` ligne 4–5 :

```tsx
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
…
<CalendarGrid cra={cra} loading={loading} error={error} />
```

`frontend/src/components/CalendarGrid/` n'existe pas. Le glob de l'intégralité de `frontend/src/` ne retourne que 5 fichiers, aucun dans un sous-répertoire `CalendarGrid/`. La base branch n'a pas de `frontend/` du tout — ce composant n'a donc jamais existé. TypeScript et Vite échoueront à compiler `App.tsx`.

La "Calendar grid creation" est explicitement hors scope du ticket T022. L'import de `CalendarGrid` dans `App.tsx` est une dérive de scope qui introduit une dépendance cassée.

**Action requise** : retirer l'import `CalendarGrid` et son usage de `App.tsx`. L'app doit rendre uniquement `<CraSummaryPanel>` dans le scope de ce ticket. `CalendarGrid` sera ajouté lorsque son ticket sera implémenté.

```tsx
// App.tsx — version corrigée
import { useEffect, useState } from 'react';
import { fetchCra } from './api/cra';
import type { CraDetails } from './types/cra';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';

export default function App() {
  const [cra, setCra] = useState<CraDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCra(2026, 7)
      .then(data => { setCra(data); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>CRA — July 2026</h1>
      <CraSummaryPanel cra={cra} loading={loading} error={error} />
    </div>
  );
}
```

---

### 🟡 Observation — Package Java incohérent (carry-over)

`CraDetailsMapper` est déclaré dans `com.timizer.backend.cra` alors que les DTOs sont dans `com.timizerlike.backend.cra.dto`. Les tests importent des exceptions depuis `com.timizer.backend.cra`, ce qui suggère une convention de double-package pré-existante. Acceptable si intentionnel, à vérifier.

---

### 🟡 Observation — Période hardcodée dans `App.tsx`

`fetchCra(2026, 7)` et `<h1>CRA — July 2026</h1>` sont fixes. Hors scope pour ce ticket, à paramétrer lors de l'implémentation du sélecteur de période.

---

## Risques éventuels

- **AC "Total updates after a day value change"** : sans `CalendarGrid`, il n'existe aucun mécanisme pour déclencher une mise à jour depuis les saisies de jours. L'AC est vérifiable uniquement via le test unitaire `rerender`. Une fois `CalendarGrid` implémenté (futur ticket), il devra appeler un callback `onUpdate` ou équivalent pour propager les changements dans le state `cra` d'`App.tsx`.
- **Infrastructure frontend absente** : aucun `package.json`, `tsconfig.json`, `vite.config.ts`, ni `index.html` dans le diff ou le worktree. Les tests ne peuvent pas s'exécuter et l'app ne peut pas se builder sans ces fichiers. À confirmer si ces artefacts sont gérés en dehors du scope du coder (CI bootstrap, image Docker, etc.).

---

## Décision

1 problème bloquant : import `CalendarGrid` non résolu dans `App.tsx`, causant une erreur de compilation TypeScript/Vite.

## Action requise

**[Bloquant]** Retirer l'import `{ CalendarGrid }` et le JSX `<CalendarGrid …>` de `App.tsx`. Le scope de ce ticket est limité au panel de résumé — `CalendarGrid` est hors scope et ne peut être importé avant son implémentation.

---

IMPLEMENTATION_FIX_REQUIRED