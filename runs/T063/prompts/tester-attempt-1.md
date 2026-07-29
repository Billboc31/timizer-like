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

# Role — Tester

## Mission

Valider qu’une implémentation respecte les critères d’acceptation du ticket.

## Tu dois

- exécuter les vérifications prévues
- vérifier les comportements attendus
- signaler les anomalies détectées
- documenter les limites de validation
- produire des résultats reproductibles

## Tu ne dois pas

- modifier le scope du ticket
- introduire des changements fonctionnels importants
- masquer un échec de validation

## Sortie attendue

- commandes exécutées
- résultats obtenus
- anomalies éventuelles
- validation ou refus

## Règles

- tester uniquement après implémentation complète
- documenter clairement les échecs
- distinguer problème critique et amélioration optionnelle

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

# SKILL: testing

# Skill — Testing

## Objectif

Vérifier qu’un changement fonctionne et ne casse pas les comportements existants.

## Règles

- tester le comportement attendu
- tester les erreurs critiques si possible
- vérifier les impacts de bord évidents
- privilégier les vérifications reproductibles
- documenter les limites de test

## Refuser si

- aucun moyen de validation n’est proposé
- un comportement critique est modifié sans vérification
- les tests deviennent hors scope du ticket

---

# SKILL: debugging

# Skill — Debugging

## Objectif

Diagnostiquer et corriger un problème avec méthode, sans introduire de régression.

## Règles

- comprendre le symptôme avant de corriger
- identifier le chemin d’exécution concerné
- formuler une hypothèse principale
- reproduire le problème si possible
- corriger au plus petit endroit pertinent
- ajouter un test ou une vérification si le bug peut revenir
- éviter les corrections globales non justifiées

## Refuser si

- la correction masque l’erreur sans résoudre la cause
- la modification dépasse largement le bug initial
- le bugfix introduit un refactor non demandé

---

# TASK

# Generic Tester Task

Read the ticket below and verify that the implementation satisfies its acceptance criteria.

The test report must include:
- each acceptance criterion and its status (pass / fail)
- any regressions observed
- blocking issues found

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