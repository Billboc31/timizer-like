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

# Role — Planner

## Mission

Lire un ticket et produire un plan d’implémentation court, concret, borné et actionnable.

## Tu dois

- comprendre le ticket
- proposer les étapes minimales
- lister les fichiers à créer ou modifier
- identifier les risques
- expliciter le hors scope
- produire un plan Markdown versionnable
- signaler les hypothèses nécessaires

## Tu ne dois pas

- coder
- réécrire le ticket
- anticiper les tickets suivants
- élargir le scope
- masquer les incertitudes

## Sortie attendue

Un fichier de plan conforme à `ai/templates/plan-template.md`.

## Règles

- le plan doit rester court
- le plan doit être exécutable par un Coder sans ambiguïté
- toute hypothèse doit être explicite
- toute dérive de scope doit être refusée

## Structure obligatoire

Tout plan doit contenir au minimum **les sections suivantes** (titres
Markdown niveau 2 — `##`). Les variantes anglaises sont acceptées à l'identique :

| Français (recommandé)         | English equivalent       |
|-------------------------------|--------------------------|
| `## Contexte`                 | `## Context`             |
| `## Objectif`                 | `## Objective`           |
| `## Inclus`                   | `## Included`            |
| `## Hors scope`               | `## Excluded`            |
| `## Critères d'acceptation`   | `## Acceptance criteria` |

Choisis une langue par plan, ne mélange pas FR et EN dans un même plan.

Ces titres sont obligatoires même si une section est courte : un ticket
trivial peut produire un plan court, mais la structure doit rester stable.

Ne jamais produire uniquement un résumé.
Ne jamais produire un compte rendu d’implémentation.

## Interdictions absolues

Tu ne dois jamais écrire :
- "implémentation terminée"
- "syntaxe valide"
- "changements appliqués"
- "voici ce qui a été fait"

Tu dois produire uniquement un plan futur, pas un compte rendu passé.

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

# SKILL: architecture-discipline

# Skill — Architecture Discipline

## Objectif

Préserver la cohérence architecture du projet dans le temps.

## Règles

- respecter les invariants documentés
- éviter les couplages implicites
- éviter les dépendances inutiles
- éviter les refactors transversaux non demandés
- documenter toute nouvelle règle structurante
- privilégier les changements locaux et bornés

## Refuser si

- le scope dérive
- plusieurs couches sont modifiées sans justification
- des conventions existantes sont cassées
- la mémoire projet devient incohérente

---

# SKILL: documentation

# Skill — Documentation

## Objectif

Maintenir une documentation utile, concise et alignée avec le code réel.

## Règles

- documenter les décisions importantes
- éviter les documentations vagues
- garder la mémoire projet cohérente
- expliciter les invariants architecture
- préférer Markdown simple et versionnable

## Refuser si

- la documentation diverge du comportement réel
- la mémoire contient des suppositions non validées
- des décisions importantes ne sont pas tracées

---

# TASK

The ticket follows.
# Generic Planner Task Read the ticket below and produce a detailed implementation plan.

## Artifact-only output (strict)

Your response will be written verbatim to `runs/<ticket>/plan.md`.
Rewrite the artifact itself. Do not describe the modifications.
Do not explain what changed. Do not produce a status report.

This rule applies to both initial plans and rewrites after a review.
Examples of forbidden openings: "The plan has been rewritten…",
"This plan now covers…", "Plan rewritten as a real implementation
document…", "Key points covered…", "The document now contains…",
"Plan written to `runs/…/plan.md`…", "`runs/…/plan.md` is written…".

Do not use the Write tool on `plan.md` and then print a status summary —
your stdout IS the artifact. If you do write the file, stdout must still
be the full plan (same four headings), not a report about it.

## Required output structure (strict) Your reply **MUST** be a Markdown document containing **exactly** these four level-2 headings, in this order, spelled exactly as shown:
## Objective
## Included
## Excluded
## Acceptance criteria
These headings are mandatory even for trivial tickets. A short plan is acceptable — an unstructured plan is not. - ## Objective — one or two sentences describing what the change achieves. - ## Included — concrete changes (files, functions, logic, tests). - ## Excluded — what is explicitly out of scope for this ticket. - ## Acceptance criteria — verifiable conditions a reviewer can check. ## Invalid output Your reply is **invalid** if any of the four headings above is missing, renamed, mistyped, or replaced by a synonym (e.g. ## Goal, ## Scope, ## In scope, ## Out of scope, ## Plan, ## Tasks are **not** accepted). An invalid reply will be rejected by the automated validator and the ticket will be retried. You **MUST NOT** write: - "implementation done" - "changes applied" - "here is what was done" - any past-tense report of work already performed You produce a *future* plan, not a status report. ## Minimal valid example (for a trivial ticket)
markdown
## Objective
Rename the helper `foo()` to `bar()` in `utils.py` to align with the new
naming convention. Behaviour is preserved.

## Included
- `utils.py`: rename `foo` → `bar`, update the docstring.
- `tests/test_utils.py`: update the single import and assertion.

## Excluded
- Renaming callers in other modules (tracked in a follow-up ticket).
- Any logic change inside `foo` / `bar`.

## Acceptance criteria
- `utils.py` no longer defines `foo`.
- `pytest tests/test_utils.py` passes.
- No other file references the old name.

The ticket follows.



# T072 — Open CRA details in a shared modal from calendar and history

**Source**: GitHub Issue #143

## Description

## Objective

Open CRA details consistently in a dismissible modal or floating window from both the annual calendar and the history view.

## Current problems

- Clicking a month in the annual calendar navigates into that month's CRA and exposes previous/next CRA navigation at the top, which is unnecessary for this interaction.
- Opening a CRA from History renders the detail underneath the history content instead of as a focused overlay.
- The two entry points use inconsistent presentation and make it difficult to return to the overview.

## Desired behavior

- Clicking a month opens that month's CRA above the annual calendar in a modal or floating detail window.
- Clicking a CRA in History opens the selected CRA through the same reusable modal/floating component.
- The underlying annual calendar or history view remains mounted and visually in place.
- The selected CRA can be closed with:
  - a visible close `×` button;
  - the `Escape` key;
  - browser back when the modal state is represented in the URL;
  - backdrop click only if it cannot discard unsaved changes unexpectedly.
- Remove previous/next CRA navigation from this overlay workflow. The user returns to the overview and selects another CRA.

## Requirements

### Shared CRA overlay

- Create one reusable CRA detail overlay used by calendar and history entry points.
- Display the complete CRA detail and authorized actions without rendering it below the page.
- Preserve the originating view, filters, scroll position, selected year, and history pagination when the overlay closes.
- Prevent background interaction and scrolling while a modal overlay is active.
- Keep header and close controls visible when CRA content scrolls.
- Define a sensible maximum width/height and internal scrolling.
- Use a full-screen dialog or drawer adaptation on small screens.

### Routing and state

- Support direct/deep links to a CRA where existing routes require them.
- Opening and closing the overlay must behave predictably with browser back/forward.
- Refreshing a deep-linked CRA must either restore the overlay over its parent view or show an equivalent standalone detail page with an obvious close/home route.
- Avoid duplicate CRA fetches and stale content when selecting multiple records successively.

### Unsaved changes and accessibility

- If the CRA is editable and contains unsaved changes, closing must request confirmation.
- Focus must move into the dialog when opened and return to the triggering month/history row when closed.
- Use accessible dialog semantics, labelled title, focus trap, and keyboard-operable controls.
- The close button must have an explicit accessible label.

## Acceptance criteria

- Clicking a month opens the corresponding CRA in a modal/floating overlay.
- The annual calendar remains behind the overlay and is restored unchanged on close.
- Clicking a CRA in History uses the same overlay and does not append content below the list.
- No previous/next CRA navigation is displayed in the overlay.
- The overlay closes using the visible cross and Escape.
- Browser back closes an opened overlay without unexpectedly leaving the originating page.
- Closing restores filters, year, scroll position, and keyboard focus.
- Unsaved changes cannot be discarded silently.
- Desktop, tablet, and mobile layouts are usable.
- Automated tests cover both calendar and history entry points, close methods, browser navigation, focus restoration, and unsaved-change protection.