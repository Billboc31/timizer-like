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


# T074 — Remove the obsolete inline CRA detail panel from History

**Source**: GitHub Issue #149

## Description

## Objective

Remove the obsolete inline `Détail CRA` panel from the History page now that CRA records open in the shared modal.

## Current problem

After opening or selecting a CRA from History, an old or duplicated `Détail CRA` section still remains rendered inside/below the History page. This creates a strange empty or stale window and duplicates the modal experience introduced by #143.

## Requirements

- Remove the legacy inline CRA-detail container from the History page.
- Remove associated headings, empty placeholders, borders, reserved spacing, and stale selected-detail content.
- A History row/card click must open only the shared CRA modal.
- Closing the modal must return to a clean History list with no residual detail panel.
- Remove obsolete state, effects, props, event handlers, and CSS used only by the inline detail rendering.
- Preserve History filters, sorting, pagination, selected year/period, and scroll position.
- Ensure no duplicate CRA API request is triggered by both the modal and the removed inline panel.
- Ensure selecting several CRA records successively never leaves the previous detail visible.
- Keep deep-link and browser back/forward behavior defined by #143.

## Acceptance criteria

- The History page never renders an inline or below-list `Détail CRA` window.
- Clicking a CRA opens exactly one detail UI: the shared modal.
- Closing the modal shows only the History page and restores the triggering row focus.
- No blank space or container remains where the old detail panel was.
- No stale detail appears after selecting or closing another CRA.
- History filtering, sorting, pagination, and scrolling remain unchanged.
- Network/integration tests confirm that opening a record does not cause duplicate detail fetches.
- Obsolete inline-detail code and styling are removed rather than merely hidden.

## Relationship to existing work

This is a cleanup/fix following #143 and must use the same shared modal enhanced by the full-action modal ticket.