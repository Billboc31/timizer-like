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


# T075 — Optimize CRA PDF pagination and remove the redundant signature page

**Source**: GitHub Issue #150

## Description

## Objective

Optimize CRA PDF pagination by removing the obsolete final signature-only page and placing the monthly calendar table together with the following monthly detail content whenever both fit on one A4 page.

## Current problems

- The PDF contains an extra final page with a signature box that is now redundant.
- The compact calendar/table and the content currently starting on page 2 are separated even when they can fit together.
- The resulting PDF wastes space and appears unnecessarily long.

## Requirements

### Remove the redundant final page

- Identify the legacy signature-only block/page introduced before the per-month two-signature layout.
- Remove the obsolete final signature page and its forced page break.
- Keep the consultant and client signature blocks required for each detailed month by #128 and #131.
- Do not remove actual stored signatures, signer identities, timestamps, or pending-signature states from the correct monthly sections.
- Ensure no blank trailing page remains after PDF generation.

### Combine calendar and monthly detail content

- Place the monthly calendar/table and the first related detailed section on the same page when their measured content fits within the printable A4 area.
- Remove unconditional page breaks between the overview/calendar table and page-2 content.
- Use content-aware pagination rather than fixed page numbers or hard-coded breaks.
- Keep logical blocks together:
  - calendar/table header and its rows;
  - monthly totals;
  - signature blocks;
  - headings with the content they introduce.
- When content does not fit, move the complete next block to a new page without overlap or clipping.
- Maintain printable margins, headers, footers, and page numbering.
- Preserve grayscale readability and the existing visual design.

## Expected layout

For a normal one-month CRA whose content fits:

```text
Page 1
- CRA header and period summary
- monthly calendar/table with worked days
- detailed monthly entries/totals
- consultant and client signature blocks when space permits
```

Additional pages should be created only when actual measured content requires them.

## Acceptance criteria

- The obsolete final signature-only page no longer exists.
- No blank or nearly empty trailing page is generated.
- Required consultant and client signatures still appear in the correct monthly section.
- For a standard one-month CRA that fits, the calendar/table and former page-2 content render together.
- Longer months and multi-month CRA files paginate without overlap, clipping, split rows, or missing content.
- Signature blocks are never split across pages.
- Page numbering reflects the final actual page count.
- Tests cover:
  - a short one-month CRA;
  - a full one-month CRA;
  - a multi-month CRA;
  - signed and unsigned states;
  - content just below and just above a page-break threshold.
- PDF visual regression snapshots confirm there is no redundant page and that all required content remains readable.

## Relationship to existing work

This ticket corrects the layout produced by #118, #128, and #131. It removes only the obsolete global signature page; it must preserve the current per-month two-party signature workflow.