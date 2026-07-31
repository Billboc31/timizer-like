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


# T065 — Add consultant and client signature boxes to each monthly CRA PDF section

**Source**: GitHub Issue #128

## Description

## Objective

Add two handwritten signature areas to every detailed monthly section of the CRA PDF: one for the consultant/provider and one for the client.

## Context

Issue #117 added or requested a client signature block at the end of the PDF. The required layout is different: when the PDF renders the detailed view of a month, that monthly section must contain both signature boxes so each month can be validated by both parties.

## Requirements

- Add two signature boxes to the detailed section for every month included in the CRA PDF.
- Place the boxes after the month's detailed entries and monthly totals.
- Provide one box for:
  - `Signature du prestataire` (or `Signature du consultant`, following the application's existing terminology);
  - name;
  - date;
  - handwritten signature space.
- Provide one box for:
  - `Signature du client`;
  - name;
  - date;
  - handwritten signature space;
  - validation wording such as `Bon pour validation des temps`.
- Present both boxes side by side when the printable width permits, with a clear and balanced layout.
- Keep both boxes together. They must not be split across pages or overlap monthly details.
- If the remaining space is insufficient, move the complete signature block to the next page while keeping it visibly associated with the relevant month.
- Repeat the two-box block for every detailed month in a multi-month PDF.
- Preserve the existing annual/period overview page and the detailed monthly content.
- Ensure the result remains readable when printed in grayscale on A4.

## Acceptance criteria

- Every detailed month contains exactly two clearly labelled signature boxes.
- The prestataire/consultant and client boxes both provide name, date, and sufficient handwritten signature space.
- The client box includes the validation wording.
- A multi-month CRA repeats the two signature boxes for each month.
- Signature boxes never overlap content and never split across pages.
- The associated month remains unambiguous if the signature block moves to a new page.
- Short and long months generate valid A4 PDFs without clipping or overflow.
- Existing CRA calculations and detailed entries are unchanged.

## Relationship to previous work

This ticket clarifies and extends #117: a single client signature at the end of the complete PDF is not sufficient.