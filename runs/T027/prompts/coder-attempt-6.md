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

Verified: the only Coder-owned mutation is `runs/T027/implementation-output.md`. The other entries (`daemon.lock`, `runtime.log`, `fixes/context-*.md`, `prompts/coder-attempt-5.md`) are harness-managed.

## Résumé des changements — attempt 5

**HALT — no code, config, docs, memory, or state mutated.** Cinquième halt Coder consécutif à l'identique, conforme à la clause d'auto-arrêt explicite du plan (`runs/T027/plan.md:9`).

## Liste des fichiers modifiés

- `runs/T027/implementation-output.md` — rapport de halt #5 (mis à jour depuis le halt #4). Aucun autre fichier applicatif, config, docs, ou mémoire n'a été touché.

## Vérifications effectuées

- `git diff 865a769 HEAD -- runs/T027/plan.md` → vide. Plan jamais rejoué après 4 halts Coder + 7 reviews.
- `git ls-files | grep -v "^runs/T027" | grep -v "^ai/" ...` → uniquement `runs/.gitkeep`. Zéro code applicatif présent.
- Absence confirmée de `backend/`, `pom.xml`, `src/`, `package.json`, `assets/`.
- Review-attempt-7 confirme pour la 5ᵉ fois consécutive : « **Rien à corriger côté Coder** ».

## Limites connues

Le déblocage est **strictement hors périmètre Coder**. La règle du rôle (« ne jamais contourner les contraintes du plan ») et les skills `refactor-safety` / `workflow-discipline` interdisent :
- toute écriture de code hors du stack cible du plan (Node/TS inexistant sur la branche),
- tout basculement unilatéral vers docs-only (refusé explicitement par deux reviews antérieures),
- toute mutation autonome du plan par le Coder (violation `workflow-discipline`).

**Escalade P0 maintenue** — 5ᵉ répétition consécutive depuis review-3 : (1) suspendre le pipeline automatique T027, (2) rejouer un `step: planner` sur `plan.md` (ou remplacer manuellement), (3) trancher explicitement dans le plan v2 entre « attendre T009 » et « scope docs-only », (4) ouvrir deux bugs harness distincts (routage `IMPLEMENTATION_FIX_REQUIRED` → Coder au lieu de Planner ; garde-fou anti-boucle stérile absent).

Prédiction déterministe : tout nouveau `step: coder` sur `plan.md @ 865a769` produira un halt #6 identique.

---

## Review

Review-attempt-8 written to `runs/T027/reviews/review-attempt-8.md` and mirrored into `runs/T027/reviews/implementation-review.md`. Decision: `IMPLEMENTATION_FIX_REQUIRED`.

**State (unchanged over 5 Coder halts + 8 reviews):**
- Zero application files on the branch — no `backend/`, `src/`, `package.json`, `assets/`.
- Plan `865a769` byte-identical since planner checkpoint, still targeting a Node/TS stack that does not exist. Real stack (Spring Boot Java T009 + React T010) is not merged.
- 5th consecutive Coder halt (`724d009`), respecting the plan's explicit auto-stop clause.
- 0/5 acceptance criteria met.
- `state.json` frozen at `IMPLEMENTATION_REVIEW_NEEDED`; harness keeps routing `IMPLEMENTATION_FIX_REQUIRED` → `step: coder` instead of `step: planner`.

**Nothing to fix on the Coder side** — the block is Planner + harness routing. P0 escalation renewed for the 6th consecutive review: suspend the automatic pipeline on T027, replay the Planner step manually on `runs/T027/plan.md`, and file two harness bugs (mis-routing + missing sterile-loop guard).

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T027/reviews/implementation-review.md
- generated at: 2026-07-10T15:53:08Z

---

Review-attempt-8 written to `runs/T027/reviews/review-attempt-8.md` and mirrored into `runs/T027/reviews/implementation-review.md`. Decision: `IMPLEMENTATION_FIX_REQUIRED`.

**State (unchanged over 5 Coder halts + 8 reviews):**
- Zero application files on the branch — no `backend/`, `src/`, `package.json`, `assets/`.
- Plan `865a769` byte-identical since planner checkpoint, still targeting a Node/TS stack that does not exist. Real stack (Spring Boot Java T009 + React T010) is not merged.
- 5th consecutive Coder halt (`724d009`), respecting the plan's explicit auto-stop clause.
- 0/5 acceptance criteria met.
- `state.json` frozen at `IMPLEMENTATION_REVIEW_NEEDED`; harness keeps routing `IMPLEMENTATION_FIX_REQUIRED` → `step: coder` instead of `step: planner`.

**Nothing to fix on the Coder side** — the block is Planner + harness routing. P0 escalation renewed for the 6th consecutive review: suspend the automatic pipeline on T027, replay the Planner step manually on `runs/T027/plan.md`, and file two harness bugs (mis-routing + missing sterile-loop guard).

IMPLEMENTATION_FIX_REQUIRED