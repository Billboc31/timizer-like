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


# T061 — Add New CRA period selection dialog

**Source**: GitHub Issue #119

## Description

## Objective

Provide a dedicated `New CRA` action in the application navigation that opens a dialog for selecting the CRA period before entering the calendar.

## Context

CRA creation is currently tied too closely to the landing page. Creating a CRA should become an explicit action available from anywhere in the application.

## Requirements

- Add a visible `New CRA` button/action to the main navigation.
- On click, open a modal dialog without navigating away from the current page.
- Let the user select:
  - Start date
  - End date
- Validate that:
  - Both dates are provided.
  - The end date is not before the start date.
- After confirmation, navigate to the CRA calendar/editor.
- Open the calendar positioned on the selected period rather than the current month.
- Make the selected period available to the CRA creation flow without requiring the user to select it again.
- Closing or cancelling the dialog must not create or modify a CRA.

## UX expectations

- The period selection should be quick and understandable.
- Default values may use the current month, while remaining editable.
- Validation errors must be shown inside the dialog.
- Keyboard and focus behavior should be accessible.

## Acceptance criteria

- `New CRA` is accessible from the navigation on every authenticated application page.
- Clicking it opens the period selection dialog.
- Invalid ranges cannot be submitted.
- Confirming a valid range opens the CRA calendar on the selected start month and period.
- Cancelling leaves the current page and data unchanged.
- The flow works for periods spanning multiple months.

## Dependencies

- The navigation placement must be compatible with the planned left sidebar.

## Out of scope

- Saving reusable period presets.
- Automatically generating recurring CRA records.
- Changing CRA business validation rules.