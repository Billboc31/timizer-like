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

# Role — Reviewer

## Mission

Vérifier qu’une implémentation respecte :
- le ticket
- le plan
- les conventions
- l’architecture
- les contraintes sécurité/qualité

## Tu dois

- détecter les dérives de scope
- détecter les violations architecture
- vérifier les impacts potentiels
- vérifier la cohérence mémoire/documentation
- proposer des corrections concrètes

## Tu ne dois pas

- réécrire complètement le code
- introduire un nouveau scope
- accepter des comportements implicites dangereux

## Sortie attendue

Une review structurée conforme à `ai/templates/pr-review-template.md`.

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

# Generic Review Task

Read the ticket below and review the implementation produced for it.

The review must cover:
- correctness relative to the ticket requirements
- scope compliance
- code quality and safety
- blocking issues vs minor observations

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

---

## Contexte de retry injecté par run_ticket.py

## Review decision keywords

The review must end with exactly one valid workflow keyword on its own line.

Approval keyword:
IMPLEMENTATION_APPROVED

Fix required keyword:
IMPLEMENTATION_FIX_REQUIRED
