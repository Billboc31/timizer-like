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


# T073 — Enable all CRA editing and workflow actions inside the shared modal

**Source**: GitHub Issue #148

## Description

## Objective

Make the CRA modal introduced by #143 fully interactive so every action available on the normal CRA screen can also be performed inside the modal.

## Current problem

The CRA now opens correctly in a modal, but its content is effectively read-only or exposes only part of the available functionality. The user cannot modify the CRA or complete the normal workflow without leaving the modal.

## Requirements

- Reuse the same CRA editor/domain component in the modal and standalone/deep-link views.
- Do not maintain a separate read-only implementation that can diverge from the main CRA screen.
- Inside the modal, expose every action authorized for the CRA's current state, including when applicable:
  - modify worked and non-worked days;
  - modify hours, durations, comments, categories, or existing CRA fields;
  - save changes;
  - validate and add the consultant signature;
  - generate/copy the client-signature link;
  - view signature status;
  - download or regenerate the PDF;
  - reopen or return a CRA to draft when permitted;
  - delete the CRA when that action already exists and is authorized.
- Apply the same backend permissions, status checks, validation messages, and confirmation dialogs as the standalone CRA view.
- Refresh modal data and the underlying annual calendar/history row after a successful mutation.
- Keep unsaved local edits while the modal remains open.
- Warn before closing, changing route, or clicking the backdrop when unsaved changes exist.
- Prevent duplicate submissions while save, validation, signature, or PDF actions are running.
- Keep action buttons visible and usable when modal content scrolls.
- Preserve keyboard accessibility and focus management from #143.
- On small screens, the full-screen modal/drawer must retain all actions.

## State consistency

- The modal must display the current server state after opening.
- Mutations performed in the modal must immediately update:
  - the modal;
  - the originating annual-calendar month;
  - the corresponding History entry;
  - status and signature indicators.
- Closing and reopening must not show stale data.
- A backend rejection must show its precise reason without silently discarding edits.

## Acceptance criteria

- A draft CRA opened from the annual calendar can be edited and saved entirely inside the modal.
- A CRA opened from History provides the same authorized actions.
- Consultant validation/signature and client-link actions work from the modal.
- PDF download/generation works from the modal.
- Actions unavailable for the current status are hidden or disabled with an understandable reason.
- Closing with unsaved edits requires confirmation.
- Successful mutations update the underlying calendar/history without a full page reload.
- No feature is available only in the old standalone CRA screen unless explicitly documented as out of scope.
- Shared component tests prove parity between modal and standalone/deep-link rendering.
- Integration tests cover editing, saving, validation, PDF download, error handling, and unsaved-change protection.

## Relationship to existing work

This ticket completes #143. The shared CRA modal must be a complete working view, not only a read-only detail preview.