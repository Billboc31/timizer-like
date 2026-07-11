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

You've hit your limit · resets 9:40pm (Europe/Paris)

---

## Review

Review-9 is written. Here is the summary the user needs to see.

# PR Review — T027 (attempt 9)

## Résumé

Neuvième review consécutive sur T027. **État applicatif inchangé depuis review-1** : zéro fichier applicatif sur la branche, plan byte-identique à `865a769`, 0/5 critères d'acceptation satisfaits. Le Coder a produit son **6ᵉ halt à l'identique** (`0eca5f3`), en respect strict de la clause d'auto-arrêt du plan. La prédiction déterministe posée en attempt 5 (« halt #6 identique ») est vérifiée.

## Vérifications effectuées

- `git diff 865a769 HEAD -- runs/T027/plan.md` → vide (plan jamais rejoué en 6 tentatives + 9 reviews)
- `git ls-files | grep -Ev "^(ai|prompts|tickets|docs/ai|runs)/"` → vide (aucun fichier applicatif)
- 6 commits Coder sur `implementation-output.md`, tous halts à décision identique
- `state.json` figé à `IMPLEMENTATION_REVIEW_NEEDED` depuis 15:55:57Z
- Aucun step `planner` intercalé depuis le checkpoint initial

## Points validés

- Auto-arrêt du Coder honoré à la lettre (6ᵉ fois) — refus correct de basculer unilatéralement Node→Java ou docs-only
- `refactor-safety`, `workflow-discipline`, `security`, `code-quality` respectés par vacuité (rien ajouté)

## Problèmes détectés (bloquants, inchangés)

1. Hypothèse Node/TS incorrecte dans `plan.md` (stack réelle : Spring Boot Java + React, non mergée)
2. Dépendance à T009 non déclarée
3. Modèle de configuration inadapté à Spring
4. Layout Maven manquant
5. 0/5 critères d'acceptation satisfaits
6. Plan jamais rejoué
7. `state.json` figé, harness route `IMPLEMENTATION_FIX_REQUIRED` → coder au lieu de planner
8. Aucun garde-fou anti-boucle stérile côté harness

## Décision

**REQUEST_CHANGES** — Rien à corriger côté Coder. Blocage côté **Planner** (replan) + **harness** (routage). Escalade P0 pour la 7ᵉ review consécutive : suspendre le pipeline automatique T027, rejouer manuellement le step Planner, ouvrir deux bugs harness (mis-routing + garde-fou anti-boucle).

Le fichier de review a été écrit sur `runs/T027/reviews/review-attempt-9.md` et miroité dans `runs/T027/reviews/implementation-review.md`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T027/reviews/implementation-review.md
- generated at: 2026-07-10T15:59:35Z

---

Review-9 is written. Here is the summary the user needs to see.

# PR Review — T027 (attempt 9)

## Résumé

Neuvième review consécutive sur T027. **État applicatif inchangé depuis review-1** : zéro fichier applicatif sur la branche, plan byte-identique à `865a769`, 0/5 critères d'acceptation satisfaits. Le Coder a produit son **6ᵉ halt à l'identique** (`0eca5f3`), en respect strict de la clause d'auto-arrêt du plan. La prédiction déterministe posée en attempt 5 (« halt #6 identique ») est vérifiée.

## Vérifications effectuées

- `git diff 865a769 HEAD -- runs/T027/plan.md` → vide (plan jamais rejoué en 6 tentatives + 9 reviews)
- `git ls-files | grep -Ev "^(ai|prompts|tickets|docs/ai|runs)/"` → vide (aucun fichier applicatif)
- 6 commits Coder sur `implementation-output.md`, tous halts à décision identique
- `state.json` figé à `IMPLEMENTATION_REVIEW_NEEDED` depuis 15:55:57Z
- Aucun step `planner` intercalé depuis le checkpoint initial

## Points validés

- Auto-arrêt du Coder honoré à la lettre (6ᵉ fois) — refus correct de basculer unilatéralement Node→Java ou docs-only
- `refactor-safety`, `workflow-discipline`, `security`, `code-quality` respectés par vacuité (rien ajouté)

## Problèmes détectés (bloquants, inchangés)

1. Hypothèse Node/TS incorrecte dans `plan.md` (stack réelle : Spring Boot Java + React, non mergée)
2. Dépendance à T009 non déclarée
3. Modèle de configuration inadapté à Spring
4. Layout Maven manquant
5. 0/5 critères d'acceptation satisfaits
6. Plan jamais rejoué
7. `state.json` figé, harness route `IMPLEMENTATION_FIX_REQUIRED` → coder au lieu de planner
8. Aucun garde-fou anti-boucle stérile côté harness

## Décision

**REQUEST_CHANGES** — Rien à corriger côté Coder. Blocage côté **Planner** (replan) + **harness** (routage). Escalade P0 pour la 7ᵉ review consécutive : suspendre le pipeline automatique T027, rejouer manuellement le step Planner, ouvrir deux bugs harness (mis-routing + garde-fou anti-boucle).

Le fichier de review a été écrit sur `runs/T027/reviews/review-attempt-9.md` et miroité dans `runs/T027/reviews/implementation-review.md`.

IMPLEMENTATION_FIX_REQUIRED