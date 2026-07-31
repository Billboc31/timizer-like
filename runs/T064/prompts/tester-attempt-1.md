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