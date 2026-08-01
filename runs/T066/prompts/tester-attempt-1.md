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