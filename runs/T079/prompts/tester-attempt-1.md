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


# T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Source**: GitHub Issue #157

## Description

## Objective

Allow a provider to permanently delete a CRA from History and CRA views only while it has not been validated or signed by a client.

## Requirements

- Add a delete action in the History page for eligible CRAs.
- Add the same delete action in the CRA detail/calendar view when eligible.
- Restrict deletion to CRAs that have not reached a client-validated or client-signed final status.
- Enforce the restriction in the backend; hiding the button in the UI is not sufficient.
- Ask for explicit confirmation before permanent deletion and clearly state that the action cannot be undone.
- Permanently delete the CRA and associated dependent data that should not survive independently, such as day entries, generated temporary artifacts, pending signature tokens/requests, and related records according to the existing data model.
- Avoid deleting shared provider, client, or project data.
- Refresh History and calendar views immediately after deletion.
- Signed/final CRAs must not show a delete action.
- A direct API deletion attempt for a signed/final CRA must be rejected with a clear conflict or validation error.

## Acceptance criteria

- An unsigned and unvalidated CRA can be deleted from History.
- An unsigned and unvalidated CRA can be deleted from its CRA view.
- A confirmation dialog is shown before deletion.
- After confirmation, the CRA disappears from all views and cannot be retrieved again.
- Signed or client-validated CRAs cannot be deleted through either the UI or API.
- Deletion does not remove unrelated client, provider, or project records.

## Dependency

This ticket should use the terminal signed status introduced by the issue that makes client-signed CRAs final and immutable.