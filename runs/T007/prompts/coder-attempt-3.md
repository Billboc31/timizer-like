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


# T007 — Create CRA creation API

**Source**: GitHub Issue #10

## Description

## Context

The frontend must be able to create a monthly CRA for a selected month.

## Goal

Expose a backend API for creating a monthly CRA.

## Description

Add an API endpoint that creates a CRA for a given month and year.

The created CRA must initialize one day entry for every calendar day in the selected month.

Default values must be 0 for weekend days and 1 for weekdays unless another default rule is explicitly documented.

## Out of Scope

- Updating day values
- CRA validation
- PDF generation
- Frontend UI
- Authentication
- Client signature

## Acceptance Criteria

- API can create a CRA for a month and year
- Created CRA contains one entry per calendar day
- Default day values are applied consistently
- Duplicate CRA creation for the same month and year is rejected or returns the existing CRA clearly
- API returns the created CRA details
- Existing tests still pass

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Blocked, no code written. Reported the precondition failure in `runs/T007/implementation-output.md` and logged the block in `runs/T007/workflow-status.md`.

**Summary of changes**
- `runs/T007/implementation-output.md` — block/escalation report
- `runs/T007/workflow-status.md` — appended coder-step entry noting the block

**Why blocked**
The approved plan's Step 1 (`runs/T007/plan.md:55`) requires T002/T003/T004/T005 to already be present on the base branch and states: *"If any are missing, block and escalate — do not re-implement them."* The current branch was cut from `0031ccd` (the bare AI Dev Factory bootstrap) and contains no `backend/` tree. `origin/main` has T002/T003/T005 merged but T004's `MonthlyCraReportRepository` is still not merged there either — so even a rebase onto `origin/main` would not fully satisfy the precondition.

**What needs to unblock**
Orchestrator/human action: land T004 into `origin/main` (or into this branch as a dependency), then rebase/merge this branch onto that state. After that, the plan can be executed unchanged.

---

## Review

I have enough context. The "implementation" is a block report — no backend code exists in the branch because the required upstream tickets (T002–T005) are not merged into the base. Time to write the review.

# PR Review

## Résumé

L'implémentation T007 est **bloquée**. Aucun code n'a été écrit : la branche `ticket/T007-create-cra-creation-api` est issue de `0031ccd` (bootstrap AI Dev Factory nu) et ne contient aucun répertoire `backend/`. Le plan (`runs/T007/plan.md:55`) exige la présence de T002/T003/T004/T005 en base et interdit explicitement leur ré-implémentation. Le coder a donc escaladé plutôt que de produire du code. Aucun des critères d'acceptation du ticket n'est atteint.

## Vérifications effectuées

- Lecture du ticket T007 (`runs/T007/ticket.md`) et de ses critères d'acceptation.
- Lecture du plan approuvé (`runs/T007/plan.md`) — précondition en Step 1.
- Inspection de l'arbre Git (`git ls-tree -r HEAD --name-only`) : aucun fichier `backend/**`.
- Vérification filesystem : `backend/` inexistant dans le worktree.
- Lecture du rapport d'implémentation (`runs/T007/implementation-output.md`) — statut « Blocked, no code written ».
- Lecture du `workflow-status.md` : deux entrées coder à 14:00:43Z (BLOCKED) puis 14:04:17Z (transition vers IMPLEMENTATION_REVIEW_NEEDED sans nouveau contenu).
- Diff `git diff dcba30b HEAD --stat` : seuls des artefacts `runs/T007/**` ont changé.

## Points validés

- Le plan avait correctement identifié la précondition (Step 1 exige T002–T005 présents en base).
- Le coder a respecté l'interdit du plan (ne pas ré-implémenter T002–T005) et a documenté le blocage plutôt que d'écrire du code non conforme.
- Le rapport de blocage (`implementation-output.md`) est explicite : origine du blocage, action attendue, référence au plan.
- Aucune fuite de scope, aucune violation d'architecture, aucun secret exposé — puisque rien n'a été implémenté.

## Problèmes détectés

1. **Aucun critère d'acceptation du ticket n'est satisfait.** Le ticket exige :
   - un endpoint créant un CRA → absent
   - un CRA avec une entrée par jour calendaire → absent
   - défauts weekend/semaine appliqués → absent
   - gestion des doublons → absente
   - tests existants toujours verts → non exécutables (pas de `backend/`)
   L'implémentation ne peut pas être approuvée telle quelle.

2. **Transition de statut incohérente** (`workflow-status.md:32-43`). Une première entrée coder à 14:00:43Z indique `next: IMPLEMENTATION_FIX_REQUIRED` avec la note du blocage, puis une seconde entrée coder à 14:04:17Z reprend `prev: PLAN_APPROVED` et passe à `IMPLEMENTATION_REVIEW_NEEDED` sans nouvelle production. Ceci contourne la logique normale « blocage → fix » et pousse un blocage vers le reviewer sans nouveau contenu à examiner. À corriger par l'orchestrateur.

3. **Précondition à résoudre en amont.** Le blocage réel n'est pas un défaut d'implémentation mais un défaut d'ordonnancement des tickets : T004 (`MonthlyCraReportRepository`) n'est ni sur la branche, ni sur `origin/main` selon le rapport. Le reviewer ne peut pas débloquer cela seul.

## Risques éventuels

- Approuver ce blocage comme « implémentation » ouvrirait un précédent dangereux : PR fermée sans code, mémoire projet mise à jour comme si le ticket avait livré, futurs tickets qui en dépendent (T008+) partiraient sur une hypothèse fausse.
- Rebase mécanique sur `origin/main` insuffisant tant que T004 n'y est pas mergé — l'orchestrateur doit vérifier explicitement les 4 dépendances avant de relancer le coder.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **Orchestrateur / humain** : faire atterrir T002, T003, T004 et T005 sur la base de la branche (merge dans `origin/main` puis rebase, ou merge direct des branches concernées dans la branche T007). Confirmer la présence de :
   - `backend/src/main/java/.../cra/MonthlyCraReport.java` (T002)
   - `backend/src/main/java/.../cra/CraDayEntry.java` (T003)
   - `backend/src/main/java/.../cra/MonthlyCraReportRepository.java` (T004)
   - `backend/src/main/java/.../cra/dto/CraDetailsDto.java` (T005)
2. **Après rebase** : relancer le coder avec le plan `runs/T007/plan.md` **inchangé**. Le plan reste valide.
3. **Coder** : au démarrage, vérifier explicitement les 4 fichiers ci-dessus et arbitrer le point « risque package inconsistency » (`com.timizer.backend.cra` vs `com.timizerlike.backend.cra`) documenté en `plan.md:65` avant d'écrire toute ligne — n'introduire aucun split cross-package.
4. **Orchestrateur** : corriger la double entrée coder dans `workflow-status.md` (14:00:43Z puis 14:04:17Z) pour refléter fidèlement le blocage, ou consolider en une seule transition `PLAN_APPROVED → IMPLEMENTATION_FIX_REQUIRED`. En l'état, le workflow contourne la boucle fix.
5. Ne pas mettre à jour la mémoire projet tant que l'implémentation n'a pas produit de code approuvé.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T007/reviews/implementation-review.md
- generated at: 2026-07-11T14:07:05Z

---

I have enough context. The "implementation" is a block report — no backend code exists in the branch because the required upstream tickets (T002–T005) are not merged into the base. Time to write the review.

# PR Review

## Résumé

L'implémentation T007 est **bloquée**. Aucun code n'a été écrit : la branche `ticket/T007-create-cra-creation-api` est issue de `0031ccd` (bootstrap AI Dev Factory nu) et ne contient aucun répertoire `backend/`. Le plan (`runs/T007/plan.md:55`) exige la présence de T002/T003/T004/T005 en base et interdit explicitement leur ré-implémentation. Le coder a donc escaladé plutôt que de produire du code. Aucun des critères d'acceptation du ticket n'est atteint.

## Vérifications effectuées

- Lecture du ticket T007 (`runs/T007/ticket.md`) et de ses critères d'acceptation.
- Lecture du plan approuvé (`runs/T007/plan.md`) — précondition en Step 1.
- Inspection de l'arbre Git (`git ls-tree -r HEAD --name-only`) : aucun fichier `backend/**`.
- Vérification filesystem : `backend/` inexistant dans le worktree.
- Lecture du rapport d'implémentation (`runs/T007/implementation-output.md`) — statut « Blocked, no code written ».
- Lecture du `workflow-status.md` : deux entrées coder à 14:00:43Z (BLOCKED) puis 14:04:17Z (transition vers IMPLEMENTATION_REVIEW_NEEDED sans nouveau contenu).
- Diff `git diff dcba30b HEAD --stat` : seuls des artefacts `runs/T007/**` ont changé.

## Points validés

- Le plan avait correctement identifié la précondition (Step 1 exige T002–T005 présents en base).
- Le coder a respecté l'interdit du plan (ne pas ré-implémenter T002–T005) et a documenté le blocage plutôt que d'écrire du code non conforme.
- Le rapport de blocage (`implementation-output.md`) est explicite : origine du blocage, action attendue, référence au plan.
- Aucune fuite de scope, aucune violation d'architecture, aucun secret exposé — puisque rien n'a été implémenté.

## Problèmes détectés

1. **Aucun critère d'acceptation du ticket n'est satisfait.** Le ticket exige :
   - un endpoint créant un CRA → absent
   - un CRA avec une entrée par jour calendaire → absent
   - défauts weekend/semaine appliqués → absent
   - gestion des doublons → absente
   - tests existants toujours verts → non exécutables (pas de `backend/`)
   L'implémentation ne peut pas être approuvée telle quelle.

2. **Transition de statut incohérente** (`workflow-status.md:32-43`). Une première entrée coder à 14:00:43Z indique `next: IMPLEMENTATION_FIX_REQUIRED` avec la note du blocage, puis une seconde entrée coder à 14:04:17Z reprend `prev: PLAN_APPROVED` et passe à `IMPLEMENTATION_REVIEW_NEEDED` sans nouvelle production. Ceci contourne la logique normale « blocage → fix » et pousse un blocage vers le reviewer sans nouveau contenu à examiner. À corriger par l'orchestrateur.

3. **Précondition à résoudre en amont.** Le blocage réel n'est pas un défaut d'implémentation mais un défaut d'ordonnancement des tickets : T004 (`MonthlyCraReportRepository`) n'est ni sur la branche, ni sur `origin/main` selon le rapport. Le reviewer ne peut pas débloquer cela seul.

## Risques éventuels

- Approuver ce blocage comme « implémentation » ouvrirait un précédent dangereux : PR fermée sans code, mémoire projet mise à jour comme si le ticket avait livré, futurs tickets qui en dépendent (T008+) partiraient sur une hypothèse fausse.
- Rebase mécanique sur `origin/main` insuffisant tant que T004 n'y est pas mergé — l'orchestrateur doit vérifier explicitement les 4 dépendances avant de relancer le coder.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **Orchestrateur / humain** : faire atterrir T002, T003, T004 et T005 sur la base de la branche (merge dans `origin/main` puis rebase, ou merge direct des branches concernées dans la branche T007). Confirmer la présence de :
   - `backend/src/main/java/.../cra/MonthlyCraReport.java` (T002)
   - `backend/src/main/java/.../cra/CraDayEntry.java` (T003)
   - `backend/src/main/java/.../cra/MonthlyCraReportRepository.java` (T004)
   - `backend/src/main/java/.../cra/dto/CraDetailsDto.java` (T005)
2. **Après rebase** : relancer le coder avec le plan `runs/T007/plan.md` **inchangé**. Le plan reste valide.
3. **Coder** : au démarrage, vérifier explicitement les 4 fichiers ci-dessus et arbitrer le point « risque package inconsistency » (`com.timizer.backend.cra` vs `com.timizerlike.backend.cra`) documenté en `plan.md:65` avant d'écrire toute ligne — n'introduire aucun split cross-package.
4. **Orchestrateur** : corriger la double entrée coder dans `workflow-status.md` (14:00:43Z puis 14:04:17Z) pour refléter fidèlement le blocage, ou consolider en une seule transition `PLAN_APPROVED → IMPLEMENTATION_FIX_REQUIRED`. En l'état, le workflow contourne la boucle fix.
5. Ne pas mettre à jour la mémoire projet tant que l'implémentation n'a pas produit de code approuvé.

IMPLEMENTATION_FIX_REQUIRED