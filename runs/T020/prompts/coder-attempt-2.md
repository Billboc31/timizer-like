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


# T020 — Create CRA calendar grid

**Source**: GitHub Issue #20

## Description

## Context

The main user workflow is clicking days in a calendar to mark worked time.

## Goal

Create the frontend calendar grid for a monthly CRA.

## Description

Add a calendar grid displaying all days of the selected CRA month.

Each day must show the day number, weekday, and current work value.

Weekends must be visually distinguishable from weekdays.

## Out of Scope

- Click cycling behavior
- Backend persistence
- Validation button
- PDF download
- CRA history

## Acceptance Criteria

- Calendar displays every day of the selected month
- Weekday labels are visible
- Current work value is visible for each day
- Weekends are visually distinguishable
- Calendar updates when a different CRA month is loaded
- Empty and loading states are handled

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation complete. Here's a summary:

---

## T020 — Implementation Summary

### Files created

| File | Purpose |
|------|---------|
| `frontend/package.json` | Vite + React + TypeScript + Vitest + RTL setup; `start` alias for `vite` |
| `frontend/index.html` | Vite entry HTML |
| `frontend/vite.config.ts` | Vite config with jsdom test environment |
| `frontend/tsconfig*.json` | TypeScript config (app + node) |
| `frontend/.env.development` | `VITE_API_BASE_URL=http://localhost:8080` |
| `frontend/.gitignore` | Excludes `node_modules/`, `dist/` |
| `frontend/src/types/cra.ts` | `CraDayEntry` and `CraDetails` types per plan |
| `frontend/src/api/cra.ts` | `fetchCra(year, month)` → `POST /api/cra` |
| `frontend/src/components/CalendarGrid/CalendarGrid.tsx` | Renders loading/error/empty/grid states; weekend class logic |
| `frontend/src/components/CalendarGrid/CalendarGrid.css` | Grid layout + `day-cell--weekend` background |
| `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` | 7 passing tests (cell count, weekend class, worked values, states) |
| `frontend/src/App.tsx` | Wires `fetchCra(2026, 7)` on mount → `<CalendarGrid />` |
| `frontend/src/main.tsx` + `src/index.css` + `src/setupTests.ts` | App bootstrap |

### Verifications
- `npm test` → **7/7 passing**
- `npm start` → dev server starts on port 4173, serves HTML correctly
- Weekend days (Sat/Sun) get `day-cell--weekend` class; weekdays do not
- Loading, error, and empty states handled

### Notes
- Used Vite instead of CRA (deprecated) — consistent with the rest of the project. Env var prefix is `VITE_` not `REACT_APP_`.
- RTL auto-cleanup wasn't firing with vitest globals disabled; added explicit `afterEach(cleanup)` in the test file.

---

## Review

I have everything I need. Here is the review.

---

# PR Review — T020 Create CRA Calendar Grid

## Résumé

Implementation of the CalendarGrid React component covering the full monthly CRA display. The component code itself is correct and complete. The blocking issue is in the test suite.

## Vérifications effectuées

- All acceptance criteria checked against component code
- Test suite reviewed line by line
- TypeScript configuration reviewed
- API integration and state management reviewed
- Scope compliance against ticket Out of Scope list

## Points validés

- **Days count** — `new Date(cra.year, cra.month, 0).getDate()` correctly computes days in month for any year/month input.
- **Weekday labels** — `WEEKDAY_ABBR[weekdayIndex]` renders Sun–Sat abbreviations per cell.
- **Worked value display** — `dayMap.get(day)?.worked ?? 0` correctly defaults to 0 for missing days.
- **Weekend distinction** — `day-cell--weekend` applied to Saturday (6) and Sunday (0) indices; CSS gives clear visual contrast.
- **Component reactivity** — CalendarGrid is purely prop-driven; it will re-render correctly for any new `cra` object passed to it.
- **State handling** — loading, error, and empty (null CRA) branches are all present and distinct.
- **Scope discipline** — no month selector, no click cycling, no persistence; stays within T020 bounds.
- **TypeScript** — strict mode enabled; explicit types throughout.

## Problèmes détectés

### [BLOCKING] Test `shows the worked value for days present in cra.days` is ambiguous

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` line 38–46

```typescript
days: [{ day: 1, worked: 1, note: '' }],
// ...
expect(cells[0]).toHaveTextContent('1');
```

`cells[0]` is day 1, which renders text content `"1Wed1"` (day number "1", weekday "Wed", worked "1"). `toHaveTextContent('1')` matches because the **day number** is "1" — regardless of whether the worked value is rendered. Removing the `<span className="day-cell__worked">` from the component would not cause this test to fail.

The acceptance criterion "Current work value is visible for each day" has no reliable test coverage.

**Fix:** Use a day/worked pair where the values differ, e.g. `day: 3, worked: 1`, then assert on the specific span:

```typescript
it('shows the worked value for days present in cra.days', () => {
  const cra: CraDetails = {
    ...JULY_2026,
    days: [{ day: 3, worked: 1, note: '' }],
  };
  render(<CalendarGrid cra={cra} loading={false} error={null} />);
  const cells = screen.getAllByTestId('day-cell');
  // Day 3 has worked=1; day number is 3, so "1" unambiguously comes from worked
  expect(cells[2].querySelector('.day-cell__worked')).toHaveTextContent('1');
});
```

---

### [OBSERVATION] `afterEach(cleanup)` placed between import statements

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` lines 4–5

```typescript
import { describe, it, expect, afterEach } from 'vitest';

afterEach(cleanup);          // ← executable statement mid-imports
import { CalendarGrid } from './CalendarGrid';
```

ESM hoisting makes this work, but it is misleading. Move `afterEach(cleanup)` after all imports.

---

### [OBSERVATION] Typo in `tsconfig.app.json` silently disables a compiler check

**File:** `frontend/tsconfig.app.json`

```json
"noFalltreoughCasesInSwitch": true   // typo: "treough" instead of "through"
```

TypeScript ignores unknown compiler options without error. The `noFallthroughCasesInSwitch` rule is effectively off. Fix the spelling.

---

### [OBSERVATION] Acceptance criterion "Calendar updates when a different CRA month is loaded" has no test

The component renders correctly for any month, but there is no test exercising a second month (e.g. February 2026 → 28 cells). This criterion is partially verified by the month logic itself, but a second test case would close the gap.

## Risques éventuels

None on the implementation side. The ambiguous test creates a risk that future work silently removes worked value display without test failure.

## Décision

- REQUEST_CHANGES — one blocking test quality issue; component implementation is correct.

## Actions demandées

1. Fix test `shows the worked value for days present in cra.days` to use `day ≠ worked` values and assert on `.day-cell__worked` element directly.
2. (Optional) Move `afterEach(cleanup)` after all import statements.
3. (Optional) Fix typo `noFalltreoughCasesInSwitch` → `noFallthroughCasesInSwitch`.
4. (Optional) Add a test verifying a month other than July renders the correct number of cells.

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T020/reviews/implementation-review.md
- generated at: 2026-07-12T11:10:05Z

---

I have everything I need. Here is the review.

---

# PR Review — T020 Create CRA Calendar Grid

## Résumé

Implementation of the CalendarGrid React component covering the full monthly CRA display. The component code itself is correct and complete. The blocking issue is in the test suite.

## Vérifications effectuées

- All acceptance criteria checked against component code
- Test suite reviewed line by line
- TypeScript configuration reviewed
- API integration and state management reviewed
- Scope compliance against ticket Out of Scope list

## Points validés

- **Days count** — `new Date(cra.year, cra.month, 0).getDate()` correctly computes days in month for any year/month input.
- **Weekday labels** — `WEEKDAY_ABBR[weekdayIndex]` renders Sun–Sat abbreviations per cell.
- **Worked value display** — `dayMap.get(day)?.worked ?? 0` correctly defaults to 0 for missing days.
- **Weekend distinction** — `day-cell--weekend` applied to Saturday (6) and Sunday (0) indices; CSS gives clear visual contrast.
- **Component reactivity** — CalendarGrid is purely prop-driven; it will re-render correctly for any new `cra` object passed to it.
- **State handling** — loading, error, and empty (null CRA) branches are all present and distinct.
- **Scope discipline** — no month selector, no click cycling, no persistence; stays within T020 bounds.
- **TypeScript** — strict mode enabled; explicit types throughout.

## Problèmes détectés

### [BLOCKING] Test `shows the worked value for days present in cra.days` is ambiguous

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` line 38–46

```typescript
days: [{ day: 1, worked: 1, note: '' }],
// ...
expect(cells[0]).toHaveTextContent('1');
```

`cells[0]` is day 1, which renders text content `"1Wed1"` (day number "1", weekday "Wed", worked "1"). `toHaveTextContent('1')` matches because the **day number** is "1" — regardless of whether the worked value is rendered. Removing the `<span className="day-cell__worked">` from the component would not cause this test to fail.

The acceptance criterion "Current work value is visible for each day" has no reliable test coverage.

**Fix:** Use a day/worked pair where the values differ, e.g. `day: 3, worked: 1`, then assert on the specific span:

```typescript
it('shows the worked value for days present in cra.days', () => {
  const cra: CraDetails = {
    ...JULY_2026,
    days: [{ day: 3, worked: 1, note: '' }],
  };
  render(<CalendarGrid cra={cra} loading={false} error={null} />);
  const cells = screen.getAllByTestId('day-cell');
  // Day 3 has worked=1; day number is 3, so "1" unambiguously comes from worked
  expect(cells[2].querySelector('.day-cell__worked')).toHaveTextContent('1');
});
```

---

### [OBSERVATION] `afterEach(cleanup)` placed between import statements

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` lines 4–5

```typescript
import { describe, it, expect, afterEach } from 'vitest';

afterEach(cleanup);          // ← executable statement mid-imports
import { CalendarGrid } from './CalendarGrid';
```

ESM hoisting makes this work, but it is misleading. Move `afterEach(cleanup)` after all imports.

---

### [OBSERVATION] Typo in `tsconfig.app.json` silently disables a compiler check

**File:** `frontend/tsconfig.app.json`

```json
"noFalltreoughCasesInSwitch": true   // typo: "treough" instead of "through"
```

TypeScript ignores unknown compiler options without error. The `noFallthroughCasesInSwitch` rule is effectively off. Fix the spelling.

---

### [OBSERVATION] Acceptance criterion "Calendar updates when a different CRA month is loaded" has no test

The component renders correctly for any month, but there is no test exercising a second month (e.g. February 2026 → 28 cells). This criterion is partially verified by the month logic itself, but a second test case would close the gap.

## Risques éventuels

None on the implementation side. The ambiguous test creates a risk that future work silently removes worked value display without test failure.

## Décision

- REQUEST_CHANGES — one blocking test quality issue; component implementation is correct.

## Actions demandées

1. Fix test `shows the worked value for days present in cra.days` to use `day ≠ worked` values and assert on `.day-cell__worked` element directly.
2. (Optional) Move `afterEach(cleanup)` after all import statements.
3. (Optional) Fix typo `noFalltreoughCasesInSwitch` → `noFallthroughCasesInSwitch`.
4. (Optional) Add a test verifying a month other than July renders the correct number of cells.

---

IMPLEMENTATION_FIX_REQUIRED