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


# T071 — Fix broken client CRA signature links end to end

**Source**: GitHub Issue #142

## Description

## Objective

Fix generated client-signature links so recipients can open the public CRA signature page and complete validation successfully.

## Current problem

The link supplied for client signature does not work. The defect must be reproduced from link generation through public route loading and signature submission rather than patched only in the UI.

## Investigation scope

Verify the complete flow:

1. consultant validates and signs the CRA;
2. Timizer generates or displays the client-signature link;
3. the link is copied or sent;
4. the recipient opens it outside the authenticated Timizer session;
5. the public route resolves the token;
6. the CRA summary loads;
7. the client submits a signature;
8. the CRA moves to the expected validated state.

## Requirements

- Generate an absolute, externally reachable URL using configured public frontend/base URL values.
- Never generate localhost, container-internal, backend-only, or relative URLs for external recipients unless explicitly configured for local development.
- Ensure the frontend public-signature route matches the generated URL format.
- Ensure reverse proxy and SPA fallback serve the signature route after direct navigation or page refresh.
- Ensure the token reaches the backend exactly as generated without unwanted encoding/truncation.
- Validate token existence, CRA association, expiry, use state, and signature eligibility.
- The client-signature page must work without an authenticated user session.
- Return a clear page for:
  - invalid token;
  - expired token;
  - already-used/already-signed token;
  - CRA not ready for client signature;
  - temporary server failure.
- Do not expose internal IDs, secrets, or sensitive diagnostic information.
- Preserve the corrected CRA workflow from #130.

## Acceptance criteria

- The current broken-link scenario is reproduced by an automated test and fixed.
- Copying the displayed signature link into a private/incognito browser opens the expected client-signature page.
- Direct navigation and page refresh on the public signature URL both work.
- The link uses the configured externally reachable base URL.
- A valid token loads the correct immutable CRA summary.
- The recipient can submit the client signature without authenticating.
- Invalid, expired, used, and premature tokens show distinct understandable errors.
- Successful submission updates the CRA state and invalidates/restricts reuse according to policy.
- Backend/API and browser-level tests cover the complete generated-link flow.

---

## Contexte de retry injecté par run_ticket.py

## Review decision keywords

The review must end with exactly one valid workflow keyword on its own line.

Approval keyword:
IMPLEMENTATION_APPROVED

Fix required keyword:
IMPLEMENTATION_FIX_REQUIRED
