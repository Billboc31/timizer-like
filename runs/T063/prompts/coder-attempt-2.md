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


# T063 — Move application navigation to a responsive left sidebar

**Source**: GitHub Issue #121

## Description

## Objective

Replace the current top navigation with a modern, persistent left sidebar that becomes the primary application navigation.

## Context

The application navigation should support the new global CRA overview and the dedicated `New CRA` action while leaving more horizontal structure and clearer hierarchy for future features.

## Requirements

- Replace the current top navigation bar with a vertical sidebar on the left.
- Move all existing navigation destinations and actions into the sidebar.
- Include a prominent `New CRA` action that can open the CRA period-selection dialog.
- Include navigation to the global CRA overview/home page.
- Clearly indicate the active route.
- Keep the sidebar visible on desktop while the main content scrolls independently where appropriate.
- Provide a responsive mobile/tablet behavior, such as a collapsible drawer.
- Preserve access to account, settings, logout, and other existing navigation actions.
- Ensure the sidebar does not cover or shrink the main content beyond usable dimensions.
- Use semantic controls, keyboard navigation, visible focus states, and accessible labels.

## Design expectations

- Modern and compact visual design.
- Clear hierarchy between the primary creation action and navigation links.
- Consistent icon and label alignment.
- Optional collapsed desktop mode is acceptable but not required.

## Acceptance criteria

- The top navigation is replaced by a left sidebar on desktop.
- All previously accessible navigation actions remain available.
- The current page is visually identifiable in the sidebar.
- The `New CRA` action is available from the sidebar.
- The layout works on common desktop, tablet, and mobile viewport sizes.
- Keyboard-only users can access every sidebar action.
- Existing routes and deep links continue to work.

## Dependencies

- Must support the new CRA period-selection dialog.
- Must link to the global CRA calendar overview.

## Out of scope

- Redesigning the content of every application page.
- User-configurable sidebar ordering.
- Role-based menu customization.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation is complete. Here's a summary:

---

## Files created / modified

**Created:**
- `frontend/src/components/AppSidebar/AppSidebar.tsx` — new sidebar component with desktop persistent layout, mobile drawer with Escape/backdrop/focus-trap, `aria-current` active state, and keyboard-accessible nav items
- `frontend/src/components/AppSidebar/AppSidebar.css` — desktop: 220px sticky column; mobile (≤767px): fixed off-screen panel with CSS transition + semi-transparent backdrop overlay

**Modified:**
- `frontend/src/components/AppShell/AppShell.tsx` — removed `<header>`, added `<AppSidebar>` + mobile topbar with hamburger button, changed root layout to `flex-direction: row`
- `frontend/src/components/AppShell/AppShell.css` — root becomes `height: 100vh; flex-direction: row`; main gets `flex: 1; overflow-y: auto; min-width: 0`; mobile topbar is sticky; removed all old `__header`/`__nav`/`__nav-item` rules

**Unchanged:** `App.tsx`, all view components, `tokens.css`, `base.css` — view state wiring is unmodified.

**Verifications:** No TypeScript errors in modified files; all 278 existing tests pass.

---

## Review

# PR Review — T063: Move application navigation to a responsive left sidebar

## Résumé

L'implémentation est solide sur l'essentiel : le `<header>` horizontal est supprimé, `AppSidebar` est créé avec layout desktop persistant (220px), indicateur d'actif via `aria-current`, focus-visible sur chaque bouton, et un hamburger/drawer pour mobile. Le scope reste borné au ticket. Deux problèmes bloquants d'accessibilité mobile sont identifiés, issus d'une divergence entre le plan et ce qui a réellement été codé.

## Vérifications effectuées

- Diff du commit coder (`e17f9b99`) sur `AppShell.tsx`, `AppShell.css`, `AppSidebar.tsx`, `AppSidebar.css`
- Comparaison avec l'état pre-T063 (commit parent) pour vérifier la suppression du `<header>`
- Lecture du plan (`runs/T063/plan.md`) et du ticket
- Vérification de l'ordre DOM sur mobile et de l'arbre d'accessibilité

## Points validés

- **Topbar supprimée** : `<header class="app-shell__header">` et les règles `.app-shell__nav` / `.app-shell__nav-item` sont complètement retirées. Aucun résidu.
- **Layout desktop** : `.app-shell { flex-direction: row; height: 100vh }` + sidebar `width: 220px; flex-shrink: 0; overflow-y: auto` — correct, la sidebar reste collée à gauche, le contenu scroll indépendamment.
- **Indicateur actif** : `aria-current="page"` + left-border accent pour les items de navigation, `background-color: var(--color-primary-dark)` pour New CRA actif.
- **Focus-visible** : `box-shadow: var(--focus-ring); outline: none` sur chaque élément interactif de la sidebar et du hamburger — cohérent avec le design system existant.
- **Accessible labels** : Hamburger a `aria-label="Open navigation menu"` + `aria-expanded={sidebarOpen}`. Nav a `aria-label="Main navigation"`.
- **Fermeture drawer** : Escape, clic backdrop, et sélection d'item ferment tous le drawer — 3 méthodes conforme au plan.
- **Scope** : `App.tsx`, tous les composants de vues, `tokens.css`, `base.css` inchangés. Scope rigoureusement respecté.
- **Qualité CSS** : Variables design system utilisées partout (`var(--color-primary)`, `var(--space-*)`, etc.). Aucune valeur magique en dehors de `220px` (largeur sidebar documentée dans le plan) et `280px` (mobile drawer, justifié).

## Problèmes détectés

### 🔴 BLOQUANT — Éléments sidebar accessibles au clavier quand le drawer est fermé sur mobile

**Fichier** : `AppSidebar.tsx:51-88` / `AppSidebar.css:86-121`

Sur mobile (< 768px), la sidebar est hors écran via `transform: translateX(-100%)` mais reste dans l'arbre DOM et l'ordre de tabulation. L'`<aside>` n'a ni `aria-hidden`, ni attribut `inert`, ni `tabindex="-1"` sur ses enfants quand `isOpen === false`.

L'ordre DOM est :
```
<aside class="app-sidebar">           ← invisible, mais tabulable
  <button>New CRA</button>
  <button>History</button>
  <button>Paramètres</button>
</aside>
<div class="app-shell__mobile-topbar">  ← hamburger visible
<main>...</main>
```

Un utilisateur clavier sur mobile tab dans 3 boutons invisibles avant d'atteindre le hamburger. C'est une régression d'accessibilité directe par rapport à la topbar initiale.

**Correction attendue** : ajouter `aria-hidden={!isOpen}` sur `<aside>` et `inert={!isOpen || undefined}` (ou bloquer le tabindex des enfants quand fermé). L'attribut `inert` est supporté nativement depuis 2023 dans tous les navigateurs cibles modernes.

```tsx
<aside
  ref={sidebarRef}
  className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}
  aria-hidden={!isOpen}          // ← retirer de l'arbre a11y quand fermé
  inert={!isOpen || undefined}   // ← bloquer focus + interactions
>
```

Note : `inert` est suffisant à lui seul (implique `aria-hidden`). On peut se limiter à `inert` si le target browser le supporte, sinon combiner les deux.

---

### 🔴 BLOQUANT — Absence de `role="dialog"` / `aria-modal` sur le drawer mobile

**Fichier** : `AppSidebar.tsx:58-87`

Le plan spécifie explicitement : *"On mobile, the `<nav>` is rendered inside a `<dialog>` (or `role="dialog"`) drawer"*. L'implémentation utilise `<aside>` sans sémantique modale.

Quand le drawer est ouvert, les screen readers ne comprennent pas que c'est un contexte modal : ils peuvent lire le contenu derrière le backdrop. Pour un overlay avec backdrop et focus trap, le rôle dialog est la sémantique correcte.

**Correction attendue** : ajouter `role="dialog"` et `aria-modal="true"` conditionnellement sur mobile quand ouvert, ou restructurer pour utiliser l'élément `<dialog>` natif. Solution minimale :

```tsx
<aside
  ref={sidebarRef}
  className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}
  role={isOpen ? 'dialog' : undefined}
  aria-modal={isOpen ? true : undefined}
  aria-label={isOpen ? 'Navigation menu' : undefined}
  ...
>
```

---

### 🟡 MINEUR — Focus initial non déplacé à l'ouverture du drawer

**Fichier** : `AppSidebar.tsx:15-44`

Quand `isOpen` passe à `true`, le focus reste sur le hamburger (`<div class="app-shell__mobile-topbar">`). Le focus trap est en place pour le cycle Tab/Shift+Tab, mais le focus initial n'est pas positionné dans le drawer. Un utilisateur clavier doit presser Tab pour entrer dans le drawer, ce qui peut paraître défaillant.

**Recommandation** : dans le `useEffect`, après ouverture, déplacer le focus sur le premier élément focusable du drawer :

```tsx
useEffect(() => {
  if (!isOpen) return;
  const first = sidebarRef.current?.querySelector<HTMLElement>('button:not(:disabled)');
  first?.focus();
  ...
}, [isOpen, onClose]);
```

---

### 🟡 MINEUR — Suppression du `max-width` sur `<main>`

**Fichier** : `AppShell.css:34-40`

La version précédente avait `max-width: var(--content-max-width)` sur `.app-shell__main`. La nouvelle version supprime ce max-width (conforme au plan). Sur des écrans très larges, le contenu des pages s'étale désormais sur toute la largeur disponible. Ce changement est intentionnel et justifié par la présence de la sidebar fixe, mais pourrait affecter la lisibilité sur moniteurs > 1600px selon la valeur de `--content-max-width`. Pas bloquant ici, mais à surveiller visuellement.

## Risques éventuels

- **Compatibilité `inert`** : supporté depuis Chrome 102, Safari 15.5, Firefox 112. Si des cibles plus anciennes sont requises, fallback via `tabindex="-1"` sur chaque enfant interactif + `aria-hidden`.
- **Z-index ordering** : sidebar mobile à `z-index: 200`, backdrop à `z-index: 199`, topbar mobile à `z-index: 100`. Ordre cohérent, aucun conflit visible.

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES** — 2 problèmes bloquants d'accessibilité mobile

## Actions demandées

1. **[BLOQUANT]** Ajouter `inert` (et/ou `aria-hidden`) sur `<aside>` quand le drawer est fermé sur mobile — empêche le focus et la lecture par screen reader des éléments off-screen.
2. **[BLOQUANT]** Ajouter `role="dialog"` + `aria-modal="true"` sur `<aside>` quand `isOpen === true` sur mobile — informe les technologies d'assistance du contexte modal.
3. **[MINEUR]** Déplacer le focus sur le premier bouton du drawer à l'ouverture.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T063/reviews/implementation-review.md
- generated at: 2026-07-29T18:13:39Z

---

# PR Review — T063: Move application navigation to a responsive left sidebar

## Résumé

L'implémentation est solide sur l'essentiel : le `<header>` horizontal est supprimé, `AppSidebar` est créé avec layout desktop persistant (220px), indicateur d'actif via `aria-current`, focus-visible sur chaque bouton, et un hamburger/drawer pour mobile. Le scope reste borné au ticket. Deux problèmes bloquants d'accessibilité mobile sont identifiés, issus d'une divergence entre le plan et ce qui a réellement été codé.

## Vérifications effectuées

- Diff du commit coder (`e17f9b99`) sur `AppShell.tsx`, `AppShell.css`, `AppSidebar.tsx`, `AppSidebar.css`
- Comparaison avec l'état pre-T063 (commit parent) pour vérifier la suppression du `<header>`
- Lecture du plan (`runs/T063/plan.md`) et du ticket
- Vérification de l'ordre DOM sur mobile et de l'arbre d'accessibilité

## Points validés

- **Topbar supprimée** : `<header class="app-shell__header">` et les règles `.app-shell__nav` / `.app-shell__nav-item` sont complètement retirées. Aucun résidu.
- **Layout desktop** : `.app-shell { flex-direction: row; height: 100vh }` + sidebar `width: 220px; flex-shrink: 0; overflow-y: auto` — correct, la sidebar reste collée à gauche, le contenu scroll indépendamment.
- **Indicateur actif** : `aria-current="page"` + left-border accent pour les items de navigation, `background-color: var(--color-primary-dark)` pour New CRA actif.
- **Focus-visible** : `box-shadow: var(--focus-ring); outline: none` sur chaque élément interactif de la sidebar et du hamburger — cohérent avec le design system existant.
- **Accessible labels** : Hamburger a `aria-label="Open navigation menu"` + `aria-expanded={sidebarOpen}`. Nav a `aria-label="Main navigation"`.
- **Fermeture drawer** : Escape, clic backdrop, et sélection d'item ferment tous le drawer — 3 méthodes conforme au plan.
- **Scope** : `App.tsx`, tous les composants de vues, `tokens.css`, `base.css` inchangés. Scope rigoureusement respecté.
- **Qualité CSS** : Variables design system utilisées partout (`var(--color-primary)`, `var(--space-*)`, etc.). Aucune valeur magique en dehors de `220px` (largeur sidebar documentée dans le plan) et `280px` (mobile drawer, justifié).

## Problèmes détectés

### 🔴 BLOQUANT — Éléments sidebar accessibles au clavier quand le drawer est fermé sur mobile

**Fichier** : `AppSidebar.tsx:51-88` / `AppSidebar.css:86-121`

Sur mobile (< 768px), la sidebar est hors écran via `transform: translateX(-100%)` mais reste dans l'arbre DOM et l'ordre de tabulation. L'`<aside>` n'a ni `aria-hidden`, ni attribut `inert`, ni `tabindex="-1"` sur ses enfants quand `isOpen === false`.

L'ordre DOM est :
```
<aside class="app-sidebar">           ← invisible, mais tabulable
  <button>New CRA</button>
  <button>History</button>
  <button>Paramètres</button>
</aside>
<div class="app-shell__mobile-topbar">  ← hamburger visible
<main>...</main>
```

Un utilisateur clavier sur mobile tab dans 3 boutons invisibles avant d'atteindre le hamburger. C'est une régression d'accessibilité directe par rapport à la topbar initiale.

**Correction attendue** : ajouter `aria-hidden={!isOpen}` sur `<aside>` et `inert={!isOpen || undefined}` (ou bloquer le tabindex des enfants quand fermé). L'attribut `inert` est supporté nativement depuis 2023 dans tous les navigateurs cibles modernes.

```tsx
<aside
  ref={sidebarRef}
  className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}
  aria-hidden={!isOpen}          // ← retirer de l'arbre a11y quand fermé
  inert={!isOpen || undefined}   // ← bloquer focus + interactions
>
```

Note : `inert` est suffisant à lui seul (implique `aria-hidden`). On peut se limiter à `inert` si le target browser le supporte, sinon combiner les deux.

---

### 🔴 BLOQUANT — Absence de `role="dialog"` / `aria-modal` sur le drawer mobile

**Fichier** : `AppSidebar.tsx:58-87`

Le plan spécifie explicitement : *"On mobile, the `<nav>` is rendered inside a `<dialog>` (or `role="dialog"`) drawer"*. L'implémentation utilise `<aside>` sans sémantique modale.

Quand le drawer est ouvert, les screen readers ne comprennent pas que c'est un contexte modal : ils peuvent lire le contenu derrière le backdrop. Pour un overlay avec backdrop et focus trap, le rôle dialog est la sémantique correcte.

**Correction attendue** : ajouter `role="dialog"` et `aria-modal="true"` conditionnellement sur mobile quand ouvert, ou restructurer pour utiliser l'élément `<dialog>` natif. Solution minimale :

```tsx
<aside
  ref={sidebarRef}
  className={`app-sidebar${isOpen ? ' app-sidebar--open' : ''}`}
  role={isOpen ? 'dialog' : undefined}
  aria-modal={isOpen ? true : undefined}
  aria-label={isOpen ? 'Navigation menu' : undefined}
  ...
>
```

---

### 🟡 MINEUR — Focus initial non déplacé à l'ouverture du drawer

**Fichier** : `AppSidebar.tsx:15-44`

Quand `isOpen` passe à `true`, le focus reste sur le hamburger (`<div class="app-shell__mobile-topbar">`). Le focus trap est en place pour le cycle Tab/Shift+Tab, mais le focus initial n'est pas positionné dans le drawer. Un utilisateur clavier doit presser Tab pour entrer dans le drawer, ce qui peut paraître défaillant.

**Recommandation** : dans le `useEffect`, après ouverture, déplacer le focus sur le premier élément focusable du drawer :

```tsx
useEffect(() => {
  if (!isOpen) return;
  const first = sidebarRef.current?.querySelector<HTMLElement>('button:not(:disabled)');
  first?.focus();
  ...
}, [isOpen, onClose]);
```

---

### 🟡 MINEUR — Suppression du `max-width` sur `<main>`

**Fichier** : `AppShell.css:34-40`

La version précédente avait `max-width: var(--content-max-width)` sur `.app-shell__main`. La nouvelle version supprime ce max-width (conforme au plan). Sur des écrans très larges, le contenu des pages s'étale désormais sur toute la largeur disponible. Ce changement est intentionnel et justifié par la présence de la sidebar fixe, mais pourrait affecter la lisibilité sur moniteurs > 1600px selon la valeur de `--content-max-width`. Pas bloquant ici, mais à surveiller visuellement.

## Risques éventuels

- **Compatibilité `inert`** : supporté depuis Chrome 102, Safari 15.5, Firefox 112. Si des cibles plus anciennes sont requises, fallback via `tabindex="-1"` sur chaque enfant interactif + `aria-hidden`.
- **Z-index ordering** : sidebar mobile à `z-index: 200`, backdrop à `z-index: 199`, topbar mobile à `z-index: 100`. Ordre cohérent, aucun conflit visible.

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES** — 2 problèmes bloquants d'accessibilité mobile

## Actions demandées

1. **[BLOQUANT]** Ajouter `inert` (et/ou `aria-hidden`) sur `<aside>` quand le drawer est fermé sur mobile — empêche le focus et la lecture par screen reader des éléments off-screen.
2. **[BLOQUANT]** Ajouter `role="dialog"` + `aria-modal="true"` sur `<aside>` quand `isOpen === true` sur mobile — informe les technologies d'assistance du contexte modal.
3. **[MINEUR]** Déplacer le focus sur le premier bouton du drawer à l'ouverture.

IMPLEMENTATION_FIX_REQUIRED