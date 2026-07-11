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


# T027 — Create provider signature asset support

**Source**: GitHub Issue #27

## Description

## Context

The generated CRA PDF must include the provider signature in the MVP.

## Goal

Support storing and using a provider signature asset.

## Description

Add support for a local provider signature image or equivalent signature asset used during PDF generation.

The signature asset location must be configurable and documented.

If no signature asset is available, PDF generation must fail clearly or render a documented placeholder.

## Out of Scope

- Drawing signatures in the browser
- Client signature
- Signature verification
- Multi-user signatures
- Email sending

## Acceptance Criteria

- Provider signature asset location can be configured
- PDF generation can access the provider signature asset
- Missing signature asset is handled clearly
- Documentation explains how to provide the signature asset
- Existing tests still pass

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

## Halt report — T027 (attempt 2)

**STOPPED — no code, config, docs, or state mutated.** The plan has not been revised since attempt 1, so its own auto-halt clause fires again for the same two reasons:

1. The plan still hypothesizes a **Node.js / TypeScript** stack under `src/`, but per `ticket/T009` the backend is **Spring Boot / Java** under `backend/`, and per `ticket/T016` the PDF generator (which will consume this signature asset) lives there — a `src/…/*.ts` loader would be dead code.
2. There is still **no project to plug into**: no `pom.xml`, no `package.json`, no `src/` on `main`; T009 and T010 are unmerged.

The attempt-1 review itself concluded *"Rien à corriger côté Coder : sa décision d'arrêt est conforme. La balle est chez le Planner."* — the fix owner is the Planner. `git log` confirms no planner step ran between attempt 1 and this retry, and `plan.md` is byte-identical.

Silently rewriting the plan into Java on the Coder side would violate the plan's self-arrest clause, `refactor-safety`, and `workflow-discipline`, and risk merge conflicts on `backend/pom.xml` when T009 lands.

### Files touched

- `runs/T027/implementation-output.md` — rewritten to record the attempt-2 halt and escalate.

### Escalation

Two consecutive halts on the same unrevised plan. This should route back to the **Planner** (not another Coder retry) to re-issue the plan against the real Spring Boot stack — or explicitly downscope T027 to docs-only deliverables so it can land ahead of T009 — per the attempt-1 review's "Actions demandées" list.

---

## Review

Review written. Summary:

**Decision: `IMPLEMENTATION_FIX_REQUIRED`**

Second consecutive Coder halt on a byte-identical plan (`plan.md` has never been rejoué — one commit only, `865a769`). The Coder acted correctly again (honors the plan's auto-stop clause; no silent Node→Java translation), but zero acceptance criteria are met.

Key finding: the workflow routed the retry back to **Coder** instead of **Planner**, contradicting attempt-1's explicit requirement. As long as `plan.md` stays identical, any further Coder retry is mechanically a halt.

Files written:
- `runs/T027/reviews/review-attempt-2.md` — full detailed review
- `runs/T027/reviews/implementation-review.md` — updated to attempt-2 content

Priorité 1: force a **Planner** step (human intervention likely required to break the routing loop). Priorité 2: the 8 replan actions from attempt-1 remain fully valid and unaddressed.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T027/reviews/implementation-review.md
- generated at: 2026-07-10T15:23:28Z

---

Review written. Summary:

**Decision: `IMPLEMENTATION_FIX_REQUIRED`**

Second consecutive Coder halt on a byte-identical plan (`plan.md` has never been rejoué — one commit only, `865a769`). The Coder acted correctly again (honors the plan's auto-stop clause; no silent Node→Java translation), but zero acceptance criteria are met.

Key finding: the workflow routed the retry back to **Coder** instead of **Planner**, contradicting attempt-1's explicit requirement. As long as `plan.md` stays identical, any further Coder retry is mechanically a halt.

Files written:
- `runs/T027/reviews/review-attempt-2.md` — full detailed review
- `runs/T027/reviews/implementation-review.md` — updated to attempt-2 content

Priorité 1: force a **Planner** step (human intervention likely required to break the routing loop). Priorité 2: the 8 replan actions from attempt-1 remain fully valid and unaddressed.

IMPLEMENTATION_FIX_REQUIRED