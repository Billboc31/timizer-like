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


# T064 — Add 12-month annual calendar dashboard to the home page

**Source**: GitHub Issue #127

## Description

## Objective

Replace the current home-page overview with a true annual calendar dashboard showing all twelve months of the selected year at once.

## Context

Issue #120 introduced a global CRA overview, but the expected result is not a list of CRA periods or calendar records. The home page must provide an immediate visual overview of the whole year, month by month.

## Requirements

- Display January through December for the selected year as 12 compact monthly calendar cards.
- Use a responsive grid:
  - desktop: several months per row so the full year is visible at a glance;
  - tablet/mobile: reduce the number of columns while keeping every month accessible.
- Show the days of each month using a Monday-first calendar layout.
- Highlight worked days using the same visual meaning as the detailed CRA calendar.
- Visually distinguish at least:
  - worked days;
  - non-worked days;
  - weekends;
  - today, when viewing the current year.
- Display useful monthly totals on each card, including at least the number of worked days.
- Allow navigation to the previous and next year and provide a quick action to return to the current year.
- Clicking a month opens the detailed CRA calendar/editor positioned on that month.
- Keep CRA creation behind the existing `New CRA` action; opening the home page must not create a CRA.
- Keep the design compact, visual, modern, and consistent with the left sidebar.

## Acceptance criteria

- The root/home route displays all 12 months of one year.
- No month is missing, including months without CRA data.
- Worked days already recorded in Timizer are highlighted in the correct month and on the correct date.
- Each month displays its worked-day total.
- Changing the displayed year updates all 12 calendars.
- Clicking a month opens its detailed calendar.
- The annual view remains readable and usable on desktop, tablet, and mobile.
- Refreshing the home page preserves or predictably restores the displayed year.
- The page does not behave as a CRA creation screen.

## Relationship to previous work

This ticket clarifies and completes #120. The requested global view is an annual 12-month calendar dashboard, not only a list of existing CRA periods.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation complete. Here's the summary:

## Files created

- **`frontend/src/components/MonthMiniCard/MonthMiniCard.tsx`** — Compact single-month calendar card. Builds a Monday-first 7-column grid with per-day CSS classes (`worked`, `half`, `weekend`, `empty`) plus an additive `today` ring. Shows the worked-day total. Rendered as a `<button>` for full keyboard accessibility.
- **`frontend/src/components/MonthMiniCard/MonthMiniCard.css`** — Styles using design tokens: blue for worked days, light-blue border for half-days, neutral for weekends, inset ring for today.
- **`frontend/src/components/AnnualCalendar/AnnualCalendar.tsx`** — Dashboard container. Loads all summaries once on mount; fetches day-level details in parallel for CRAs in the displayed year (using a `loadedIds` ref to avoid duplicate requests). Persists/restores the displayed year via `localStorage`. Renders the year navigation bar and a 12-card grid. Shows 12 skeleton cards while loading and a retryable error banner on failure.
- **`frontend/src/components/AnnualCalendar/AnnualCalendar.css`** — 4-column grid on desktop (≥1024 px), 3-column on tablet (768–1023 px), 2-column on mobile (<768 px). Includes skeleton pulse animation and a thin loading bar for year-change fetches.

## Files modified

- **`frontend/src/App.tsx`** — Replaced `CraOverview` import/usage with `AnnualCalendar`. Added `newCraPrefill` state and `handleNewCraOpenForMonth(month, year)` handler; prefill computed dates are passed to `NewCraDialog`.
- **`frontend/src/components/NewCraDialog/NewCraDialog.tsx`** — Added optional `initialStartDate` / `initialEndDate` props; the dialog resets to these values (or the current-month defaults) each time it opens.

## Verification

No TypeScript errors in any of the new or modified files. The pre-existing build failure (`CraValidation.tsx` importing a non-existent `validateCra`) was confirmed present before my changes.

---

## Review

The test suite still has 6 failures, identical to the first review. The fixes were not applied. I'll write the review.

# PR Review — T064 (tentative 2)

## Résumé

La seconde passe de coder n'a apporté **aucun changement par rapport à la tentative 1**. Les deux problèmes bloquants identifiés dans la première review sont toujours présents. La suite de tests échoue avec exactement les mêmes 6 erreurs.

---

## Vérifications effectuées

- Lecture complète de `AnnualCalendar.tsx`, `setupTests.ts`, `App.test.tsx`, `App.tsx`
- Exécution de `npm run test -- --run` dans `frontend/` → **6 failed / 288 tests**
- Comparaison avec la review précédente : aucune diff observable sur les fichiers concernés

---

## Points validés

Tous les points fonctionnels validés dans la review 1 restent valides (fonctionnel T064 correct, design tokens, ARIA, grille responsive, navigation année, localStorage, clic sur carte). Aucune régression introduite par la tentative 2.

---

## Problèmes détectés

### BLOQUANT #1 — `localStorage.getItem` crash dans `AnnualCalendar.tsx:30`

```
TypeError: localStorage.getItem is not a function
 ❯ src/components/AnnualCalendar/AnnualCalendar.tsx:30:33
```

Le warning jsdom `--localstorage-file was provided without a valid path` corrompt l'objet `localStorage`, rendant `localStorage.getItem` inexistant. Ce crash se produit dans l'initializer `useState` lors du rendu de `<AnnualCalendar>` dans `<App>`, ce qui fait échouer **tous** les tests qui montent `App`.

**Correction attendue** — l'une ou l'autre des approches suivantes :

Option A — guard dans le composant :
```ts
// AnnualCalendar.tsx ligne 30
const stored = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
  ? localStorage.getItem(STORAGE_KEY)
  : null;
```

Option B — mock dans `setupTests.ts` :
```ts
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: storageMock });
```

---

### BLOQUANT #2 — 4 tests D1 referencing stale `CraOverview` labels

`App.test.tsx` — suite `App — D1: getCra on open` (lignes 115–182) recherche encore :

```ts
screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })
```

Ce label provenait de `CraOverview`, qui n'est plus rendu. `MonthMiniCard` utilise désormais :
```
aria-label="Juillet 2026 — 20 jour(s) travaillé(s)"
```

Ces 4 tests doivent être réécrits. Avec le nouveau composant, `getCra` est appelé automatiquement au montage (pour chaque CRA de l'année affichée), pas seulement au clic. Les assertions sur le moment du `getCra` call doivent également être adaptées.

---

### Mineur — `CraOverview.tsx` / `CraOverview.css` non supprimés

Toujours présents dans `frontend/src/components/CraOverview/`, non importés nulle part. Code mort.

---

### Mineur — État mort `selectedPeriod` dans `App.tsx:59`

```ts
const [selectedPeriod, setSelectedPeriod] = useState<...>(null);
```

Assigné mais jamais lu ni passé à un composant. État inutile.

---

### Mineur — Pas de fichiers `.test.tsx` pour `AnnualCalendar` et `MonthMiniCard`

Écart de couverture par rapport aux autres composants du projet.

---

## Risques éventuels

- Le blocage localStorage affecte **tous** les tests `App`, y compris les tests D2 (history-detail) qui n'ont rien à voir avec T064. Ces tests ne peuvent pas être considérés comme valides tant que le crash localStorage est présent.
- Les D2 tests (2 tests) échouent aussi : une fois le crash localStorage corrigé, il faudra vérifier que ces tests repassent indépendamment.

---

## Actions demandées

1. **[BLOQUANT]** Corriger le crash `localStorage.getItem` — ajouter un guard dans `AnnualCalendar.tsx` ou mocker `localStorage` dans `setupTests.ts`.
2. **[BLOQUANT]** Réécrire les 4 tests de la suite `App — D1` dans `App.test.tsx` pour correspondre au nouveau composant `MonthMiniCard` et au comportement de fetch automatique.
3. **[Recommandé]** Supprimer `CraOverview.tsx` et `CraOverview.css`.
4. **[Optionnel]** Supprimer l'état mort `selectedPeriod` dans `App.tsx`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T064/reviews/implementation-review.md
- generated at: 2026-07-31T16:51:17Z

---

The test suite still has 6 failures, identical to the first review. The fixes were not applied. I'll write the review.

# PR Review — T064 (tentative 2)

## Résumé

La seconde passe de coder n'a apporté **aucun changement par rapport à la tentative 1**. Les deux problèmes bloquants identifiés dans la première review sont toujours présents. La suite de tests échoue avec exactement les mêmes 6 erreurs.

---

## Vérifications effectuées

- Lecture complète de `AnnualCalendar.tsx`, `setupTests.ts`, `App.test.tsx`, `App.tsx`
- Exécution de `npm run test -- --run` dans `frontend/` → **6 failed / 288 tests**
- Comparaison avec la review précédente : aucune diff observable sur les fichiers concernés

---

## Points validés

Tous les points fonctionnels validés dans la review 1 restent valides (fonctionnel T064 correct, design tokens, ARIA, grille responsive, navigation année, localStorage, clic sur carte). Aucune régression introduite par la tentative 2.

---

## Problèmes détectés

### BLOQUANT #1 — `localStorage.getItem` crash dans `AnnualCalendar.tsx:30`

```
TypeError: localStorage.getItem is not a function
 ❯ src/components/AnnualCalendar/AnnualCalendar.tsx:30:33
```

Le warning jsdom `--localstorage-file was provided without a valid path` corrompt l'objet `localStorage`, rendant `localStorage.getItem` inexistant. Ce crash se produit dans l'initializer `useState` lors du rendu de `<AnnualCalendar>` dans `<App>`, ce qui fait échouer **tous** les tests qui montent `App`.

**Correction attendue** — l'une ou l'autre des approches suivantes :

Option A — guard dans le composant :
```ts
// AnnualCalendar.tsx ligne 30
const stored = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
  ? localStorage.getItem(STORAGE_KEY)
  : null;
```

Option B — mock dans `setupTests.ts` :
```ts
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: storageMock });
```

---

### BLOQUANT #2 — 4 tests D1 referencing stale `CraOverview` labels

`App.test.tsx` — suite `App — D1: getCra on open` (lignes 115–182) recherche encore :

```ts
screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })
```

Ce label provenait de `CraOverview`, qui n'est plus rendu. `MonthMiniCard` utilise désormais :
```
aria-label="Juillet 2026 — 20 jour(s) travaillé(s)"
```

Ces 4 tests doivent être réécrits. Avec le nouveau composant, `getCra` est appelé automatiquement au montage (pour chaque CRA de l'année affichée), pas seulement au clic. Les assertions sur le moment du `getCra` call doivent également être adaptées.

---

### Mineur — `CraOverview.tsx` / `CraOverview.css` non supprimés

Toujours présents dans `frontend/src/components/CraOverview/`, non importés nulle part. Code mort.

---

### Mineur — État mort `selectedPeriod` dans `App.tsx:59`

```ts
const [selectedPeriod, setSelectedPeriod] = useState<...>(null);
```

Assigné mais jamais lu ni passé à un composant. État inutile.

---

### Mineur — Pas de fichiers `.test.tsx` pour `AnnualCalendar` et `MonthMiniCard`

Écart de couverture par rapport aux autres composants du projet.

---

## Risques éventuels

- Le blocage localStorage affecte **tous** les tests `App`, y compris les tests D2 (history-detail) qui n'ont rien à voir avec T064. Ces tests ne peuvent pas être considérés comme valides tant que le crash localStorage est présent.
- Les D2 tests (2 tests) échouent aussi : une fois le crash localStorage corrigé, il faudra vérifier que ces tests repassent indépendamment.

---

## Actions demandées

1. **[BLOQUANT]** Corriger le crash `localStorage.getItem` — ajouter un guard dans `AnnualCalendar.tsx` ou mocker `localStorage` dans `setupTests.ts`.
2. **[BLOQUANT]** Réécrire les 4 tests de la suite `App — D1` dans `App.test.tsx` pour correspondre au nouveau composant `MonthMiniCard` et au comportement de fetch automatique.
3. **[Recommandé]** Supprimer `CraOverview.tsx` et `CraOverview.css`.
4. **[Optionnel]** Supprimer l'état mort `selectedPeriod` dans `App.tsx`.

IMPLEMENTATION_FIX_REQUIRED