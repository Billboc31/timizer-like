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

Blocked. I did not implement the ticket. The plan's starting-state assumptions require an existing `backend/` Spring Boot module (entities, DTOs, repository, exceptions, DTOs, application entry-point). None of that exists on this branch — the T012 branch shares only the AI Dev Factory bootstrap commit (`0031ccd`) with the prerequisite ticket branches (`T009`, `T002`, `T003`, `T004`, `T005`, `T007`), which are not merged in.

Per the plan's own instruction ("stop and flag if any assumption is false; do not silently expand scope") and the Coder role's `workflow-discipline` / `refactor-safety` rules, I recorded the blocker in `runs/T012/implementation-output.md` and made no code changes.

**Summary of changes**: only `runs/T012/implementation-output.md` was updated to document the blocker.
**Verifications**: worktree root has no `backend/` dir; `git merge-base` confirms prerequisite branches are unmerged.
**Next step for the operator**: either merge/rebase the prerequisite ticket branches (T009 → T002 → T003 → T004 → T005) into T012's base, or re-plan T012 with an explicitly expanded bootstrap scope.

---

## Review

Review written to `runs/T012/reviews/review-attempt-1.md`.

# PR Review — T012 (Create CRA day update API), attempt 1

## Résumé

Le Coder n'a produit aucun changement de code. Le seul artefact modifié est `runs/T012/implementation-output.md`, dans lequel le Coder documente un blocage : les prérequis du plan (module `backend/` Spring Boot, entités, DTOs, repository, `ValidationStatus`, etc.) n'existent pas sur la base de T012. Les branches prérequises (T009, T002, T003, T004, T005, T007) ne sont pas mergées.

Blocage réel : la racine du worktree ne contient aucun répertoire `backend/`. L'endpoint demandé n'a pas été implémenté et aucun critère d'acceptation n'est vérifiable.

## Vérifications effectuées

- Diff `0031ccd..HEAD` : uniquement `runs/T012/**`, aucun code applicatif.
- Racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`, `tickets/` — pas de `backend/`.
- `git merge-base --is-ancestor ticket/T009-... HEAD` → **T009 non mergé**.
- `git merge-base --is-ancestor ticket/T007-... HEAD` → **T007 non mergé**.
- Plan relu : hypothèses de départ explicitement fausses ; le plan ordonne de stopper dans ce cas.

## Points validés

- Discipline de workflow respectée : blocage explicite, documenté, sans expansion silencieuse du scope. Conforme au plan et à `workflow-discipline` / `refactor-safety`.
- Aucun changement dangereux, aucun refactor transversal, aucune fuite de secret.
- `implementation-output.md` identifie clairement la cause racine et propose des remédiations.

## Problèmes détectés

Bloquants :

1. **Aucun critère d'acceptation du ticket n'est satisfait** — endpoint absent, tests absents, `mvn test` non exécutable.
2. **Cause racine en amont du Coder** : plan bâti sur des hypothèses non remplies dans la base de T012. Remédiation nécessaire avant qu'une implémentation puisse être approuvée : soit rebase/merge des prérequis (T009 → T002 → T003 → T004 → T005 → T007) dans la base de T012, soit re-plan avec bootstrap explicite (non recommandé).

Non bloquants :

- Divergence préexistante des packages `com.timizer.backend.cra` vs `com.timizerlike.backend.cra.dto` — hors scope, à ne pas « corriger » opportunément.

## Risques éventuels

- Si les prérequis sont mergés sans rebase de T012, les hypothèses du plan (packages, statuts) peuvent différer légèrement — à revérifier avant de coder.
- Un re-plan élargi ferait recouvrir T012 avec des tickets déjà existants — dérive de scope à éviter.

## Décision

**REQUEST_CHANGES.** Une implémentation qui ne satisfait aucun critère d'acceptation ne peut pas être approuvée, même quand le blocage a une cause légitime en amont.

## Actions demandées

Pour l'opérateur (hors périmètre Coder) :

1. Décider : rebase/merge des prérequis (recommandé) **ou** re-plan avec bootstrap explicite (non recommandé).
2. Option recommandée : merger/rebaser T009, puis T002 → T003 → T004 → T005 → T007 dans la base de T012 (dans l'ordre de dépendance), puis relancer le Coder sur le plan actuel.

Pour le Coder à la reprise :

- Reprendre les étapes 1–7 du plan telles quelles.
- Vérifier les hypothèses de départ (packages, `MonthlyCraReportRepository`, `ValidationStatus`) et signaler tout écart avant d'implémenter.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T012/reviews/implementation-review.md
- generated at: 2026-07-11T14:06:33Z

---

Review written to `runs/T012/reviews/review-attempt-1.md`.

# PR Review — T012 (Create CRA day update API), attempt 1

## Résumé

Le Coder n'a produit aucun changement de code. Le seul artefact modifié est `runs/T012/implementation-output.md`, dans lequel le Coder documente un blocage : les prérequis du plan (module `backend/` Spring Boot, entités, DTOs, repository, `ValidationStatus`, etc.) n'existent pas sur la base de T012. Les branches prérequises (T009, T002, T003, T004, T005, T007) ne sont pas mergées.

Blocage réel : la racine du worktree ne contient aucun répertoire `backend/`. L'endpoint demandé n'a pas été implémenté et aucun critère d'acceptation n'est vérifiable.

## Vérifications effectuées

- Diff `0031ccd..HEAD` : uniquement `runs/T012/**`, aucun code applicatif.
- Racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`, `tickets/` — pas de `backend/`.
- `git merge-base --is-ancestor ticket/T009-... HEAD` → **T009 non mergé**.
- `git merge-base --is-ancestor ticket/T007-... HEAD` → **T007 non mergé**.
- Plan relu : hypothèses de départ explicitement fausses ; le plan ordonne de stopper dans ce cas.

## Points validés

- Discipline de workflow respectée : blocage explicite, documenté, sans expansion silencieuse du scope. Conforme au plan et à `workflow-discipline` / `refactor-safety`.
- Aucun changement dangereux, aucun refactor transversal, aucune fuite de secret.
- `implementation-output.md` identifie clairement la cause racine et propose des remédiations.

## Problèmes détectés

Bloquants :

1. **Aucun critère d'acceptation du ticket n'est satisfait** — endpoint absent, tests absents, `mvn test` non exécutable.
2. **Cause racine en amont du Coder** : plan bâti sur des hypothèses non remplies dans la base de T012. Remédiation nécessaire avant qu'une implémentation puisse être approuvée : soit rebase/merge des prérequis (T009 → T002 → T003 → T004 → T005 → T007) dans la base de T012, soit re-plan avec bootstrap explicite (non recommandé).

Non bloquants :

- Divergence préexistante des packages `com.timizer.backend.cra` vs `com.timizerlike.backend.cra.dto` — hors scope, à ne pas « corriger » opportunément.

## Risques éventuels

- Si les prérequis sont mergés sans rebase de T012, les hypothèses du plan (packages, statuts) peuvent différer légèrement — à revérifier avant de coder.
- Un re-plan élargi ferait recouvrir T012 avec des tickets déjà existants — dérive de scope à éviter.

## Décision

**REQUEST_CHANGES.** Une implémentation qui ne satisfait aucun critère d'acceptation ne peut pas être approuvée, même quand le blocage a une cause légitime en amont.

## Actions demandées

Pour l'opérateur (hors périmètre Coder) :

1. Décider : rebase/merge des prérequis (recommandé) **ou** re-plan avec bootstrap explicite (non recommandé).
2. Option recommandée : merger/rebaser T009, puis T002 → T003 → T004 → T005 → T007 dans la base de T012 (dans l'ordre de dépendance), puis relancer le Coder sur le plan actuel.

Pour le Coder à la reprise :

- Reprendre les étapes 1–7 du plan telles quelles.
- Vérifier les hypothèses de départ (packages, `MonthlyCraReportRepository`, `ValidationStatus`) et signaler tout écart avant d'implémenter.

IMPLEMENTATION_FIX_REQUIRED