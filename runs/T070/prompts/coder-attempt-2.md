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


# T070 — Fix annual calendar card overlap and responsive resizing

**Source**: GitHub Issue #141

## Description

## Objective

Fix overlapping month cards and improve the responsive behavior of the annual calendar dashboard.

## Current problems

- Some monthly calendars overlap neighbouring cards when the pointer hovers over them.
- The annual calendar grid does not resize cleanly when the viewport width changes.
- Intermediate window sizes produce cramped, clipped, or visually unstable layouts.

## Requirements

### Hover behavior

- Remove or adjust hover transforms that make a calendar card overlap adjacent cards.
- If visual elevation or scaling is retained, reserve enough grid space and use controlled stacking without covering readable content or controls.
- Hovering one month must not move other cards or cause layout shift.
- Keep the focused/hovered month visually identifiable without obscuring neighbouring months.

### Responsive layout

- Use a stable responsive grid with explicit breakpoints or fluid columns.
- Ensure month cards have a usable minimum width and never overflow their grid cells.
- Support at least:
  - wide desktop;
  - standard desktop/laptop;
  - tablet;
  - mobile.
- Reflow calendars naturally when resizing the browser.
- Avoid horizontal page scrolling.
- Keep month names, weekday headers, days, worked-day markers, and totals readable.
- Handle rapid resize and device-orientation changes without stale dimensions.
- Ensure empty months and months with six calendar rows have the same stable card behavior.

## Acceptance criteria

- Hovering a calendar never covers or overlaps another calendar.
- Hover and keyboard focus do not cause layout shifts.
- All 12 months remain readable across supported viewport widths.
- Resizing the browser reflows the grid without clipping, overlap, or horizontal scrolling.
- Month cards do not escape their container.
- Mobile layout remains usable without requiring pinch zoom.
- Keyboard focus styling provides the same information as hover.
- Visual regression tests cover representative desktop, tablet, and mobile widths.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All changes are correct. Here's a summary:

---

## Changes made

### `frontend/src/components/MonthMiniCard/MonthMiniCard.css`
- Added `position: relative` to `.month-mini-card` (required for `z-index` to take effect)
- Removed `transform: translateY(-2px)` from `.month-mini-card:hover` — this was the direct cause of card overlap
- Removed `transform` from the `transition` property (no longer needed)
- Added `z-index: 1` to both `.month-mini-card:hover` and `.month-mini-card:focus-visible` so the elevated shadow renders above neighbours without physically moving any card

### `frontend/src/components/AnnualCalendar/AnnualCalendar.css`
- Added `.annual-calendar-grid > * { min-width: 0; }` to prevent grid cells from overflowing their column (CSS grid item default `min-width: auto` can cause overflow)
- Added `@media (max-width: 399px)` breakpoint with `grid-template-columns: 1fr` for narrow mobile single-column layout

### `frontend/playwright.config.ts`
- Added `tablet` project with `viewport: { width: 768, height: 1024 }`

### `frontend/e2e/visual.spec.ts`
- Added three new visual regression tests: `Annual calendar – desktop`, `Annual calendar – tablet`, `Annual calendar – mobile` — each scoped to its own project, mocking `/api/cras` with `mockCraList`, waiting for `.annual-calendar-grid`, and disabling animations before screenshot

---

## Review

---

# PR Review — T070: Fix annual calendar card overlap and responsive resizing

## Résumé

L'implémentation corrige le bug de chevauchement des cartes au hover et améliore la responsive du calendrier annuel. Les quatre fichiers ciblés par le plan ont été modifiés correctement. Un problème bloquant a été identifié : les snapshots de référence pour les trois nouveaux tests visuels ne sont pas committés.

## Vérifications effectuées

- Diff de chaque fichier modifié par rapport à la base (`ai-dev-factory/bootstrap-agent-layout`)
- Conformité avec le plan (`runs/T070/plan.md`)
- Conformité avec les critères d'acceptation du ticket
- État des snapshots visuels existants et manquants
- Configuration CI (`frontend-ci.yml`)

## Points validés

**MonthMiniCard.css** — Corrections chirurgicales et correctes :
- `position: relative` ajouté sur `.month-mini-card` — nécessaire pour que `z-index` soit effectif
- `transform: translateY(-2px)` retiré du `:hover` — cause racine du chevauchement
- `transform` retiré de la `transition` — nettoyage cohérent
- `z-index: 1` ajouté sur `:hover` et `:focus-visible` — le shadow reste visible sans déplacer la carte

**AnnualCalendar.css** — Deux additions minimales et correctes :
- `.annual-calendar-grid > * { min-width: 0; }` — corrige l'overflow CSS Grid (défaut `min-width: auto`)
- `@media (max-width: 399px)` — colonne unique sur narrow mobile (390px iPhone couvert par ce breakpoint)

**playwright.config.ts** — Ajout du projet `tablet` (768×1024) conforme au plan.

**visual.spec.ts** — Trois tests correctement scopés via `test.skip()` avec le pattern existant, mock API et sélecteur `.annual-calendar-grid` corrects.

## Problèmes détectés

### [BLOQUANT] Snapshots de référence manquants

Les trois nouveaux tests visuels n'ont aucune baseline committée :
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-desktop-darwin.png`
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-tablet-darwin.png`
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-mobile-darwin.png`

Sans ces fichiers, `npm run test:e2e` échoue au premier run en CI. Le critère d'acceptation du plan stipule explicitement **"new baselines committed"**. Ce critère n'est pas satisfait.

### [BLOQUANT] Snapshot collateral — projet `tablet` sur le test `CRA screen`

Le test `CRA screen` ne filtre aucun projet (pas de `test.skip()`). Il s'exécutait avant sur `chromium`, `desktop`, `mobile`. Avec l'ajout du projet `tablet`, il s'exécutera également sur `tablet`, ce qui nécessite une baseline `cra-screen-tablet-darwin.png` inexistante. Cela causera un échec CI supplémentaire.

## Risques éventuels

- La CI installe uniquement Chromium (`npx playwright install --with-deps chromium`). Les projets `tablet` et `desktop` héritent de Chromium par défaut — comportement correct. Les baselines générées en macOS (suffixe `-darwin`) ne matcheront pas celles attendues en CI Linux (suffixe `-linux`). Ce problème est pré-existant et hors scope T070, mais mérite d'être noté.

## Décision

- REQUEST_CHANGES

Les corrections CSS sont exactes et minimalistes. L'infrastructure de test est structurellement correcte. La seule raison de blocage est l'absence des baselines de snapshots — celles-ci doivent être générées (`npx playwright test --update-snapshots`) puis committées avant que la PR puisse être approuvée.

## Actions demandées

1. Générer les snapshots manquants (dans le worktree local) :
   ```
   cd frontend
   npx playwright test e2e/visual.spec.ts --update-snapshots
   ```
2. Vérifier que `cra-screen-tablet-darwin.png` est également généré.
3. Committer tous les nouveaux fichiers `.png` dans `e2e/__snapshots__/visual.spec.ts-snapshots/`.
4. Valider que `npm run test:e2e` passe sans erreur avant de repasser en review.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T070/reviews/implementation-review.md
- generated at: 2026-08-01T23:21:02Z

---

---

# PR Review — T070: Fix annual calendar card overlap and responsive resizing

## Résumé

L'implémentation corrige le bug de chevauchement des cartes au hover et améliore la responsive du calendrier annuel. Les quatre fichiers ciblés par le plan ont été modifiés correctement. Un problème bloquant a été identifié : les snapshots de référence pour les trois nouveaux tests visuels ne sont pas committés.

## Vérifications effectuées

- Diff de chaque fichier modifié par rapport à la base (`ai-dev-factory/bootstrap-agent-layout`)
- Conformité avec le plan (`runs/T070/plan.md`)
- Conformité avec les critères d'acceptation du ticket
- État des snapshots visuels existants et manquants
- Configuration CI (`frontend-ci.yml`)

## Points validés

**MonthMiniCard.css** — Corrections chirurgicales et correctes :
- `position: relative` ajouté sur `.month-mini-card` — nécessaire pour que `z-index` soit effectif
- `transform: translateY(-2px)` retiré du `:hover` — cause racine du chevauchement
- `transform` retiré de la `transition` — nettoyage cohérent
- `z-index: 1` ajouté sur `:hover` et `:focus-visible` — le shadow reste visible sans déplacer la carte

**AnnualCalendar.css** — Deux additions minimales et correctes :
- `.annual-calendar-grid > * { min-width: 0; }` — corrige l'overflow CSS Grid (défaut `min-width: auto`)
- `@media (max-width: 399px)` — colonne unique sur narrow mobile (390px iPhone couvert par ce breakpoint)

**playwright.config.ts** — Ajout du projet `tablet` (768×1024) conforme au plan.

**visual.spec.ts** — Trois tests correctement scopés via `test.skip()` avec le pattern existant, mock API et sélecteur `.annual-calendar-grid` corrects.

## Problèmes détectés

### [BLOQUANT] Snapshots de référence manquants

Les trois nouveaux tests visuels n'ont aucune baseline committée :
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-desktop-darwin.png`
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-tablet-darwin.png`
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-mobile-darwin.png`

Sans ces fichiers, `npm run test:e2e` échoue au premier run en CI. Le critère d'acceptation du plan stipule explicitement **"new baselines committed"**. Ce critère n'est pas satisfait.

### [BLOQUANT] Snapshot collateral — projet `tablet` sur le test `CRA screen`

Le test `CRA screen` ne filtre aucun projet (pas de `test.skip()`). Il s'exécutait avant sur `chromium`, `desktop`, `mobile`. Avec l'ajout du projet `tablet`, il s'exécutera également sur `tablet`, ce qui nécessite une baseline `cra-screen-tablet-darwin.png` inexistante. Cela causera un échec CI supplémentaire.

## Risques éventuels

- La CI installe uniquement Chromium (`npx playwright install --with-deps chromium`). Les projets `tablet` et `desktop` héritent de Chromium par défaut — comportement correct. Les baselines générées en macOS (suffixe `-darwin`) ne matcheront pas celles attendues en CI Linux (suffixe `-linux`). Ce problème est pré-existant et hors scope T070, mais mérite d'être noté.

## Décision

- REQUEST_CHANGES

Les corrections CSS sont exactes et minimalistes. L'infrastructure de test est structurellement correcte. La seule raison de blocage est l'absence des baselines de snapshots — celles-ci doivent être générées (`npx playwright test --update-snapshots`) puis committées avant que la PR puisse être approuvée.

## Actions demandées

1. Générer les snapshots manquants (dans le worktree local) :
   ```
   cd frontend
   npx playwright test e2e/visual.spec.ts --update-snapshots
   ```
2. Vérifier que `cra-screen-tablet-darwin.png` est également généré.
3. Committer tous les nouveaux fichiers `.png` dans `e2e/__snapshots__/visual.spec.ts-snapshots/`.
4. Valider que `npm run test:e2e` passe sans erreur avant de repasser en review.

IMPLEMENTATION_FIX_REQUIRED