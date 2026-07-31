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


# T066 — Redesign the client CRA signature page

**Source**: GitHub Issue #129

## Description

## Objective

Redesign the client CRA signature page so it is visually polished, trustworthy, responsive, and straightforward to use.

## Context

The current client signature page is difficult to use and visually poor. This is a client-facing validation screen and must look professional on desktop and mobile.

This ticket concerns the complete client-facing experience, not only the drawing canvas.

## Requirements

### Page structure

- Present a clean branded page with:
  - company/application identity;
  - CRA title and reference;
  - consultant/provider name;
  - client name when available;
  - covered period;
  - total worked days and duration;
  - current validation status.
- Provide a readable summary before requesting the signature.
- Clearly explain what signing means.
- Remove technical, internal, or developer-oriented information from the client view.

### Signature experience

- Provide a large, clearly bordered signature pad with an explicit label.
- Support mouse, touch, and stylus through Pointer Events.
- Prevent page scrolling while the user is actively signing on touch devices.
- Preserve smooth strokes and correct coordinates after responsive resizing.
- Provide visible actions:
  - `Effacer`;
  - `Signer et valider le CRA`.
- Disable submission until a non-empty valid signature is present.
- Show validation progress and prevent double submission.
- Display useful inline error messages without losing the drawn signature when retry is possible.
- Show a clear success screen after signature with the validation date and a PDF download action.

### UX and accessibility

- Use a centered card/layout with balanced spacing, typography, and visual hierarchy.
- Make the primary validation action visually obvious.
- Ensure adequate contrast and visible focus states.
- Associate every input and action with accessible labels.
- Support keyboard navigation for all non-drawing controls.
- Provide a clear message for expired, invalid, already-used, or already-signed links.
- Keep the page usable on small mobile screens without horizontal scrolling.

## Acceptance criteria

- The signature page has a professional client-facing design on desktop and mobile.
- CRA identity, period, consultant, and totals are visible before signing.
- Signing works with mouse, touch, and stylus.
- The signature pad remains correctly aligned after viewport changes.
- The validation button cannot be used with an empty signature.
- Double submission is prevented.
- Errors are understandable and do not unnecessarily erase the signature.
- A successful signature displays confirmation and access to the finalized PDF.
- Expired and already-signed links have dedicated, understandable states.
- Existing signature-link security remains intact.

## Relationship to existing work

This ticket improves the client UI delivered around #117 and must remain compatible with the two-party signing workflow and the finalized PDF signature rendering tickets.

---

## Contexte de retry injecté par run_ticket.py

## Review decision keywords

The review must end with exactly one valid workflow keyword on its own line.

Approval keyword:
IMPLEMENTATION_APPROVED

Fix required keyword:
IMPLEMENTATION_FIX_REQUIRED
