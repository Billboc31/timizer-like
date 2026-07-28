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


# T056 — Add a detailed CRA history view with explicit covered period

**Source**: GitHub Issue #101

## Description

## Context
The CRA history currently does not expose enough information to understand what each archived CRA contains. At minimum, the user must be able to identify the exact covered period and inspect the CRA details before downloading the PDF.

## Goal
Provide a dedicated history detail view for each CRA, with a clear period and complete read-only monthly information.

## Description
Extend the CRA history experience so each history entry can open a detailed read-only view. Display the exact covered period, provider, client, client contact, total worked days, CRA status, provider-signature status, client-signature status, validation date, signature dates when available, and the daily worked values for the month.

The covered period must be shown prominently in a human-readable form such as `1 juillet 2026 – 31 juillet 2026`, while retaining the month and year as the main title. Provide actions to return to history and download the corresponding PDF.

Historical details must come from the CRA snapshot and must not be replaced by current provider or client settings.

## Out of Scope
- Editing an archived or signed CRA.
- Deleting historical CRAs.
- Comparing several CRAs.

## Acceptance Criteria
- [ ] Each history entry opens a dedicated CRA detail view.
- [ ] The exact start and end dates of the covered period are prominently displayed.
- [ ] Provider, client, contact, total, status, validation, and signature information are visible.
- [ ] All days in the covered month and their values are shown read-only.
- [ ] The PDF download action is available when applicable.
- [ ] Historical values come from the CRA snapshot rather than current settings.
- [ ] Loading, missing, and error states are handled.
- [ ] Desktop, mobile, component, and integration tests cover the detail view.