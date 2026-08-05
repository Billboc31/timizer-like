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

# Role — Tester

## Mission

Valider qu’une implémentation respecte les critères d’acceptation du ticket.

## Tu dois

- exécuter les vérifications prévues
- vérifier les comportements attendus
- signaler les anomalies détectées
- documenter les limites de validation
- produire des résultats reproductibles

## Tu ne dois pas

- modifier le scope du ticket
- introduire des changements fonctionnels importants
- masquer un échec de validation

## Sortie attendue

- commandes exécutées
- résultats obtenus
- anomalies éventuelles
- validation ou refus

## Règles

- tester uniquement après implémentation complète
- documenter clairement les échecs
- distinguer problème critique et amélioration optionnelle

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

# SKILL: testing

# Skill — Testing

## Objectif

Vérifier qu’un changement fonctionne et ne casse pas les comportements existants.

## Règles

- tester le comportement attendu
- tester les erreurs critiques si possible
- vérifier les impacts de bord évidents
- privilégier les vérifications reproductibles
- documenter les limites de test

## Refuser si

- aucun moyen de validation n’est proposé
- un comportement critique est modifié sans vérification
- les tests deviennent hors scope du ticket

---

# SKILL: debugging

# Skill — Debugging

## Objectif

Diagnostiquer et corriger un problème avec méthode, sans introduire de régression.

## Règles

- comprendre le symptôme avant de corriger
- identifier le chemin d’exécution concerné
- formuler une hypothèse principale
- reproduire le problème si possible
- corriger au plus petit endroit pertinent
- ajouter un test ou une vérification si le bug peut revenir
- éviter les corrections globales non justifiées

## Refuser si

- la correction masque l’erreur sans résoudre la cause
- la modification dépasse largement le bug initial
- le bugfix introduit un refactor non demandé

---

# TASK

# Generic Tester Task

Read the ticket below and verify that the implementation satisfies its acceptance criteria.

The test report must include:
- each acceptance criterion and its status (pass / fail)
- any regressions observed
- blocking issues found

The ticket follows.


# T077 — Make client-signed CRA status final and immutable

**Source**: GitHub Issue #155

## Description

## Objective

Automatically move a CRA to a final signed status after client signature and prevent any further modification.

## Problem

After the client signs a CRA, its status does not change. The CRA can therefore still appear editable even though the client validation should make it definitive.

## Requirements

- Define a final status for a client-signed CRA, for example `SIGNED` or `CLIENT_VALIDATED`, using the project's existing status conventions.
- Update the CRA status atomically when the client signature is successfully persisted.
- Store the signature timestamp and signer information already available from the signature flow.
- Treat the signed status as terminal and immutable.
- Reject all later mutation attempts, including calendar/day changes, period changes, metadata changes, regeneration actions that alter business data, and deletion.
- Enforce immutability in the backend, not only by disabling UI controls.
- Update all relevant views, including CRA detail, History, calendars, and PDF-related actions, to display the final signed status.
- Disable or hide edit/delete controls for signed CRAs and explain that the CRA has been definitively validated by the client.
- Ensure repeated signature callbacks or submissions are idempotent and do not create inconsistent states.

## Acceptance criteria

- A successful client signature changes the CRA to the final signed status.
- The new status is immediately visible in the UI after refresh and in History.
- A signed CRA cannot be modified or deleted through the UI or API.
- Backend mutation attempts return a clear conflict or validation error.
- Signing the same CRA twice does not corrupt or duplicate signature data.
- Unsigned CRAs continue to follow the existing editable workflow.