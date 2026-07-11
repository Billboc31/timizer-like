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


# T012 — Create CRA day update API

**Source**: GitHub Issue #12

## Description

## Context

The user must be able to click calendar days and persist work values.

## Goal

Expose a backend API for updating CRA day entries.

## Description

Add an API endpoint that updates the work value and optional note of a specific day entry in a CRA.

Only allowed work values are 0, 0.5, and 1.

Validated CRA records must not be editable unless the product scope later explicitly allows reopening.

## Out of Scope

- CRA creation
- CRA validation
- PDF generation
- Frontend calendar
- Client signature

## Acceptance Criteria

- API can update one day entry work value
- API can update one day entry note
- Invalid work values are rejected
- Updating a validated CRA is rejected
- API returns updated CRA details or updated day entry clearly
- Existing tests still pass

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

## Summary — attempt 5

**IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT** (5th consecutive).

**Files modified**: only `runs/T012/implementation-output.md`.

**Verified state (2026-07-11)**:
- No `backend/` module in the worktree (only `ai/ docs/ prompts/ runs/ tickets/`).
- All 6 prerequisite branches (T009, T002, T003, T004, T005, T007) report `NOT MERGED`.
- 27 files changed vs. base, 100% under `runs/T012/**` — zero application code on this branch.

**Why no code change**: the plan explicitly forbids silent bootstrapping when the "starting state" assumptions (backend module, entities, DTOs) are false. Implementing anyway would recreate the work of 6 upstream tickets, violating scope and the Coder role's non-negotiables. Four prior reviews confirmed the refusal is correct.

**Required operator action** (unchanged since attempt 2):
1. Halt Coder retries — the loop is a livelock.
2. Either merge/rebase T009 → T002 → T003 → T004 → T005 → T007 into T012's base, or return T012 to the Planner for re-scope.

Full escalation documented in `runs/T012/implementation-output.md`.

---

## Review

# PR Review — T012 (Create CRA day update API), attempt 5

## Résumé

Cinquième review consécutive dans un état strictement identique aux quatre précédentes. Aucun code applicatif n'a été produit sur `ticket/T012-create-cra-day-update-api` ; aucun critère d'acceptation du ticket n'est vérifiable ; le blocage racine (six branches prérequises non mergées dans la base de T012) n'a toujours pas été levé.

## Vérifications effectuées

- Racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`, `tickets/`. Aucun `backend/` ni `frontend/`.
- `git diff 4128616..HEAD --stat` : 28 fichiers, 100 % sous `runs/T012/**`. Zéro Java (prod/test).
- Prérequis (`git merge-base --is-ancestor`) : T009, T002, T003, T004, T005, T007 → **NOT MERGED**.
- `implementation-output.md` attempt 5 : escalade `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` (5ᵉ occurrence), aucun code revendiqué.

## Points validés

- Coder conforme au plan (« do not silently expand scope »), à `workflow-discipline`, à `refactor-safety`. Aucun bootstrap silencieux, aucun refactor transversal, aucune fuite, aucune dépendance ajoutée.

## Problèmes détectés

Bloquants :

1. Aucun critère d'acceptation vérifiable (endpoint absent, aucun test, `mvn test` impossible).
2. Blocage upstream non levé après 4 reviews consécutives demandant l'action opérateur.
3. Harness ne respecte pas la signalisation `UPSTREAM_PERSISTENT` — livelock reconnu.

## Décision

Fix requis. L'action attendue est opérateur/harness, pas Coder. Détails complets dans `runs/T012/reviews/review-attempt-5.md`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T012/reviews/implementation-review.md
- generated at: 2026-07-11T14:25:36Z

---

# PR Review — T012 (Create CRA day update API), attempt 5

## Résumé

Cinquième review consécutive dans un état strictement identique aux quatre précédentes. Aucun code applicatif n'a été produit sur `ticket/T012-create-cra-day-update-api` ; aucun critère d'acceptation du ticket n'est vérifiable ; le blocage racine (six branches prérequises non mergées dans la base de T012) n'a toujours pas été levé.

## Vérifications effectuées

- Racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`, `tickets/`. Aucun `backend/` ni `frontend/`.
- `git diff 4128616..HEAD --stat` : 28 fichiers, 100 % sous `runs/T012/**`. Zéro Java (prod/test).
- Prérequis (`git merge-base --is-ancestor`) : T009, T002, T003, T004, T005, T007 → **NOT MERGED**.
- `implementation-output.md` attempt 5 : escalade `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` (5ᵉ occurrence), aucun code revendiqué.

## Points validés

- Coder conforme au plan (« do not silently expand scope »), à `workflow-discipline`, à `refactor-safety`. Aucun bootstrap silencieux, aucun refactor transversal, aucune fuite, aucune dépendance ajoutée.

## Problèmes détectés

Bloquants :

1. Aucun critère d'acceptation vérifiable (endpoint absent, aucun test, `mvn test` impossible).
2. Blocage upstream non levé après 4 reviews consécutives demandant l'action opérateur.
3. Harness ne respecte pas la signalisation `UPSTREAM_PERSISTENT` — livelock reconnu.

## Décision

Fix requis. L'action attendue est opérateur/harness, pas Coder. Détails complets dans `runs/T012/reviews/review-attempt-5.md`.

IMPLEMENTATION_FIX_REQUIRED