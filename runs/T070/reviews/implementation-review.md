---

# PR Review — T070: Fix annual calendar card overlap and responsive resizing (attempt 2)

## Résumé

Deuxième review après correction. Les deux blockers de la review 1 sont traités. L'implémentation est conforme au plan et satisfait tous les critères d'acceptation.

## Vérifications effectuées

- État des snapshots dans `e2e/__snapshots__/visual.spec.ts-snapshots/`
- Relecture de `MonthMiniCard.css`, `AnnualCalendar.css`, `visual.spec.ts`, `playwright.config.ts`
- Conformité plan + ticket
- Lecture de `runs/T070/fixes/cra-screen-preexisting.md`

## Points validés

**MonthMiniCard.css** — Correctif hover chirurgical et correct :
- `position: relative` sur `.month-mini-card` — prérequis `z-index`
- `transform: translateY(-2px)` absent du `:hover` — cause racine supprimée
- `z-index: 1` sur `:hover` et `:focus-visible` — élévation sans déplacement physique, parité clavier/souris

**AnnualCalendar.css** — Deux additions minimales :
- `.annual-calendar-grid > * { min-width: 0; }` — corrige l'overflow natif CSS Grid
- `@media (max-width: 399px)` → colonne unique pour les téléphones étroits
- Breakpoints complets : 4 → 3 → 2 → 1 colonnes

**Baselines visuelles committées** :
- `annual-calendar-desktop-desktop-darwin.png` ✓
- `annual-calendar-tablet-tablet-darwin.png` ✓
- `annual-calendar-mobile-mobile-darwin.png` ✓

**Blocker 1 (snapshots manquants)** : résolu. Les noms réels incluent le suffixe projet injecté par Playwright — les fichiers sont présents.

**Blocker 2 (`cra-screen-tablet`)** : résolu dans le sens où aucune baseline n'est nécessaire. Le test échoue sur les sélecteurs `#month-select`/`#year-input` (refactor pré-existant) avant toute prise de screenshot. T070 ajoute un quatrième run d'un test déjà cassé identiquement sur 3 autres projets. Documenté dans `runs/T070/fixes/cra-screen-preexisting.md`, correction renvoyée vers un ticket dédié : correct.

## Problèmes détectés

Aucun bloquant. Une observation : `cra-screen` reste en échec sur un projet supplémentaire — pre-existing, hors scope, documenté.

## Risques éventuels

- Baselines macOS (`-darwin`) ne matcheront pas Linux CI (`-linux`) — pré-existant, hors scope.
- `z-index: 1` au hover : risque de stacking context parent ; non présent dans la grille actuelle.

## Décision

IMPLEMENTATION_APPROVED
