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


# T072 — Open CRA details in a shared modal from calendar and history

**Source**: GitHub Issue #143

## Description

## Objective

Open CRA details consistently in a dismissible modal or floating window from both the annual calendar and the history view.

## Current problems

- Clicking a month in the annual calendar navigates into that month's CRA and exposes previous/next CRA navigation at the top, which is unnecessary for this interaction.
- Opening a CRA from History renders the detail underneath the history content instead of as a focused overlay.
- The two entry points use inconsistent presentation and make it difficult to return to the overview.

## Desired behavior

- Clicking a month opens that month's CRA above the annual calendar in a modal or floating detail window.
- Clicking a CRA in History opens the selected CRA through the same reusable modal/floating component.
- The underlying annual calendar or history view remains mounted and visually in place.
- The selected CRA can be closed with:
  - a visible close `×` button;
  - the `Escape` key;
  - browser back when the modal state is represented in the URL;
  - backdrop click only if it cannot discard unsaved changes unexpectedly.
- Remove previous/next CRA navigation from this overlay workflow. The user returns to the overview and selects another CRA.

## Requirements

### Shared CRA overlay

- Create one reusable CRA detail overlay used by calendar and history entry points.
- Display the complete CRA detail and authorized actions without rendering it below the page.
- Preserve the originating view, filters, scroll position, selected year, and history pagination when the overlay closes.
- Prevent background interaction and scrolling while a modal overlay is active.
- Keep header and close controls visible when CRA content scrolls.
- Define a sensible maximum width/height and internal scrolling.
- Use a full-screen dialog or drawer adaptation on small screens.

### Routing and state

- Support direct/deep links to a CRA where existing routes require them.
- Opening and closing the overlay must behave predictably with browser back/forward.
- Refreshing a deep-linked CRA must either restore the overlay over its parent view or show an equivalent standalone detail page with an obvious close/home route.
- Avoid duplicate CRA fetches and stale content when selecting multiple records successively.

### Unsaved changes and accessibility

- If the CRA is editable and contains unsaved changes, closing must request confirmation.
- Focus must move into the dialog when opened and return to the triggering month/history row when closed.
- Use accessible dialog semantics, labelled title, focus trap, and keyboard-operable controls.
- The close button must have an explicit accessible label.

## Acceptance criteria

- Clicking a month opens the corresponding CRA in a modal/floating overlay.
- The annual calendar remains behind the overlay and is restored unchanged on close.
- Clicking a CRA in History uses the same overlay and does not append content below the list.
- No previous/next CRA navigation is displayed in the overlay.
- The overlay closes using the visible cross and Escape.
- Browser back closes an opened overlay without unexpectedly leaving the originating page.
- Closing restores filters, year, scroll position, and keyboard focus.
- Unsaved changes cannot be discarded silently.
- Desktop, tablet, and mobile layouts are usable.
- Automated tests cover both calendar and history entry points, close methods, browser navigation, focus restoration, and unsaved-change protection.