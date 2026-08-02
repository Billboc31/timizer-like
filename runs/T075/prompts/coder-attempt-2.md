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