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


# T068 — Render stored consultant and client signatures in CRA PDFs

**Source**: GitHub Issue #131

## Description

## Objective

Render the actual stored consultant and client signatures in the generated CRA PDF, with signer identity and signature timestamps.

## Current problem

Signatures collected in Timizer still do not appear in the generated PDF. Previous issues focused on adding blank signature areas, but the finalized PDF must embed the signatures that were actually captured during the validation workflow.

## Requirements

- Load the stored consultant and client signature data when generating the PDF.
- For each detailed monthly CRA section, render two clearly separated blocks:
  - consultant/provider signature;
  - client signature.
- When a signature exists, render:
  - the signature image/strokes;
  - signer name;
  - signing date and time;
  - role label;
  - validation wording for the client.
- Preserve the signature aspect ratio and prevent stretching, clipping, or excessive scaling.
- Use a white or transparent background compatible with print.
- Keep both blocks associated with the correct monthly details.
- Do not split a signature block across pages.
- For a fully validated multi-month CRA, repeat the relevant two signatures on each detailed monthly section as required by #128.
- If the PDF is generated before the workflow is complete:
  - clearly display the missing signature as `En attente de signature`;
  - never fabricate an image or signing date.
- Regenerate/download the final PDF using the latest valid signed CRA revision.
- Ensure an edit that invalidates signatures also removes them from subsequently generated PDFs.
- Do not expose raw signature storage paths, tokens, or internal identifiers in the PDF.

## Data integrity and security

- Verify that both signatures belong to the CRA revision being rendered.
- Do not render stale signatures captured before a subsequent CRA modification.
- Validate supported image/data formats before embedding.
- Fail safely with a useful diagnostic when stored signature data is corrupted.
- Keep signature access server-side and authorized.

## Acceptance criteria

- After consultant signature, the generated PDF displays the consultant signature and marks the client signature as pending.
- After client signature, the PDF displays both actual signatures.
- Signer names, roles, and timestamps are correct.
- The final PDF corresponds to the same CRA revision signed by both parties.
- Signatures remain sharp, proportional, and readable on A4.
- Multi-month PDFs show the two signature blocks for every detailed month.
- Missing signatures are represented as pending, never as fake or blank validated signatures.
- Editing and returning the CRA to `DRAFT` removes invalidated signatures from newly generated PDFs.
- Corrupted signature data produces a controlled error rather than a broken or partially misleading PDF.
- Existing CRA entries, totals, and annual/monthly overview pages remain unchanged.

## Relationship to existing work

This ticket completes #117 and #128 by embedding captured signatures rather than only rendering empty handwritten-signature boxes.

---

## Contexte de retry injecté par run_ticket.py

## Review decision keywords

The review must end with exactly one valid workflow keyword on its own line.

Approval keyword:
IMPLEMENTATION_APPROVED

Fix required keyword:
IMPLEMENTATION_FIX_REQUIRED
