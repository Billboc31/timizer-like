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


# T060 — Add compact monthly calendar overview to CRA PDF cover page

**Source**: GitHub Issue #118

## Description

## Objective

Redesign the first page of the CRA PDF as a visual period overview using compact monthly calendars that highlight worked days.

## Context

The CRA PDF should provide an immediate, readable summary before the detailed daily content. For a CRA spanning one or several months, the first page must show each covered month as a small calendar.

## Requirements

- Add a dedicated cover/summary page before the detailed CRA pages.
- Display the CRA period and its main totals, including at least:
  - Start and end dates
  - Total worked days
  - Total declared duration when available
- Render every month intersecting the selected CRA period as a compact calendar card.
- Highlight worked days clearly and consistently.
- Visually distinguish days outside the CRA period when the first or last month is partial.
- Use a compact grid capable of displaying several months on one A4 page.
- Keep the design modern, clean, and readable at print size.
- Ensure the result remains understandable when printed in grayscale.
- Continue the detailed CRA content after this overview page.

## Design expectations

- Small calendar cards with a visible month/year heading.
- Monday-first week layout.
- Clear legend for worked and non-worked days.
- Balanced spacing and typography; avoid a spreadsheet-like appearance.

## Acceptance criteria

- The first PDF page is a visual summary page.
- Every month included in the CRA period appears exactly once.
- All worked days represented in the detailed CRA are highlighted in the overview.
- Partial months do not visually imply work outside the selected period.
- The layout remains readable for periods covering up to 12 months.
- The output is valid A4 and does not overlap, clip, or overflow.
- Existing detailed CRA pages remain available after the cover page.

## Dependencies

- Compatible with the client signature section introduced separately.

## Out of scope

- Editing CRA entries directly from the PDF.
- Interactive PDF controls.
- Digital signature support.