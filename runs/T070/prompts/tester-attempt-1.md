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


# T070 — Fix annual calendar card overlap and responsive resizing

**Source**: GitHub Issue #141

## Description

## Objective

Fix overlapping month cards and improve the responsive behavior of the annual calendar dashboard.

## Current problems

- Some monthly calendars overlap neighbouring cards when the pointer hovers over them.
- The annual calendar grid does not resize cleanly when the viewport width changes.
- Intermediate window sizes produce cramped, clipped, or visually unstable layouts.

## Requirements

### Hover behavior

- Remove or adjust hover transforms that make a calendar card overlap adjacent cards.
- If visual elevation or scaling is retained, reserve enough grid space and use controlled stacking without covering readable content or controls.
- Hovering one month must not move other cards or cause layout shift.
- Keep the focused/hovered month visually identifiable without obscuring neighbouring months.

### Responsive layout

- Use a stable responsive grid with explicit breakpoints or fluid columns.
- Ensure month cards have a usable minimum width and never overflow their grid cells.
- Support at least:
  - wide desktop;
  - standard desktop/laptop;
  - tablet;
  - mobile.
- Reflow calendars naturally when resizing the browser.
- Avoid horizontal page scrolling.
- Keep month names, weekday headers, days, worked-day markers, and totals readable.
- Handle rapid resize and device-orientation changes without stale dimensions.
- Ensure empty months and months with six calendar rows have the same stable card behavior.

## Acceptance criteria

- Hovering a calendar never covers or overlaps another calendar.
- Hover and keyboard focus do not cause layout shifts.
- All 12 months remain readable across supported viewport widths.
- Resizing the browser reflows the grid without clipping, overlap, or horizontal scrolling.
- Month cards do not escape their container.
- Mobile layout remains usable without requiring pinch zoom.
- Keyboard focus styling provides the same information as hover.
- Visual regression tests cover representative desktop, tablet, and mobile widths.