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


# T062 — Replace New CRA home page with global calendar overview

**Source**: GitHub Issue #120

## Description

## Objective

Transform the application home page into a global overview of existing CRA calendars and remove `New CRA` as the home page concept.

## Context

CRA creation will become an explicit navigation action handled by a dedicated period-selection dialog. The landing page should instead help the user understand and access all CRA periods at a glance.

## Requirements

- Replace the current `New CRA` landing page with a global calendar overview.
- Remove the `New CRA` page title and any assumption that opening the application immediately starts CRA creation.
- Display existing CRA periods/calendars in a clear chronological overview.
- Allow the user to open an existing CRA from the overview.
- Clearly distinguish useful CRA states when those states already exist in the domain, such as draft, completed, validated, or exported.
- Provide a meaningful empty state with a call to action using the new `New CRA` navigation button.
- Preserve direct routing to the CRA calendar/editor for existing CRA records.

## UX expectations

- The overview must work as the application's main dashboard.
- The current or most recent periods should be easy to find.
- The screen should remain usable when many CRA periods exist.
- The design should be consistent with the planned left sidebar navigation.

## Acceptance criteria

- The root/home route renders the global CRA calendar overview.
- The page is no longer named or presented as `New CRA`.
- Existing CRA periods can be opened from the overview.
- The empty state directs the user toward the dedicated `New CRA` action.
- Refreshing the application does not unexpectedly start a new CRA.
- Existing CRA editing routes continue to work.

## Dependencies

- Depends on the dedicated `New CRA` period selection flow for new record creation.
- Must integrate with the left sidebar navigation.

## Out of scope

- Analytics or billing dashboards.
- Bulk CRA modification.
- Redesigning the CRA editor itself.