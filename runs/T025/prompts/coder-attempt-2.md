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


# T025 — Create CRA history page

**Source**: GitHub Issue #25

## Description

## Context

The user must be able to find previously created monthly CRA records.

## Goal

Create a frontend page for CRA history.

## Description

Add a history page listing all stored CRA records.

Each row must show the period, status, total worked days, validation date when available, and actions to open the CRA and download the PDF when allowed.

## Out of Scope

- Backend history API implementation
- Calendar editing
- PDF generation
- Client signature
- Search and filters

## Acceptance Criteria

- History page lists CRA records from the backend
- Each CRA row displays period, status, and total worked days
- User can open a CRA from history
- User can download a PDF from history when the CRA is validated
- Empty history state is displayed clearly
- Loading and error states are handled

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 39 tests pass. Here's a summary of everything implemented:

---

## Files modified / created

| File | Change |
|------|--------|
| `frontend/src/types/cra.ts` | Added `validationDate: string \| null` to `CraSummaryDto` |
| `frontend/src/api/cra.ts` | Added `downloadCraPdf(id)` function |
| `frontend/src/components/CraHistory/CraHistory.tsx` | New component — table list of CRAs with all required columns and actions |
| `frontend/src/components/CraHistory/CraHistory.css` | Scoped styles for the history table |
| `frontend/src/components/CraHistory/CraHistory.test.tsx` | 10 tests covering all states and interactions |
| `frontend/src/App.tsx` | Added `history` view toggle via state-lifted navigation |
| `frontend/package.json` | Added `lru-cache` (missing transitive dep of jsdom, blocked all tests) |

## Acceptance criteria coverage

- **History page lists CRAs** — `useEffect` fetches `listCras()` on mount
- **Period, status, worked days** — shown in table columns
- **Open CRA from history** — "Open" button calls `onOpen(cra)` for every row
- **Download PDF when validated** — "Download PDF" button only renders for `VALIDATED` status, calls `downloadCraPdf()` and triggers browser download
- **Empty state** — "No CRA records found." paragraph
- **Loading and error states** — handled with matching messages, error uses `role="alert"`

## Assumptions flagged

- `validationDate` on `CraSummaryDto` assumes the backend's `GET /api/cras` endpoint returns it; if missing, the column will show `—` without breaking anything (consistent with what the plan noted).

---

## Review

# PR Review — T025: Create CRA History Page

## Résumé

Implémentation globalement solide et dans le scope. Le composant `CraHistory`, ses styles, ses tests et le câblage `App.tsx` sont en place. Cinq des six critères d'acceptance sont respectés. Un problème bloquant est identifié.

---

## Points validés

- Listing CRA via `listCras()` au montage, tableau avec colonnes Period / Status / Worked Days / Validation Date / Actions
- États vide (`"No CRA records found."`), chargement (`"Loading..."`), et erreur API (`role="alert"`) correctement gérés
- Bouton "Open" sur chaque ligne, gating du bouton "Download PDF" sur `status === 'VALIDATED'`
- État `downloading` par ID pour désactiver le bouton en cours sans bloquer les autres lignes
- 10 tests couvrant tous les états et les interactions principales
- Scope respecté : pas de routeur, pas de backend modifié, navigation par état dans `App.tsx`

---

## Problème bloquant

### Erreurs de téléchargement PDF silencieusement ignorées

**`CraHistory.tsx:44`**

```tsx
.catch(() => {})
```

Si `downloadCraPdf` échoue, l'erreur est avalée sans aucun retour utilisateur. L'AC « error states are handled » n'est pas respecté pour ce cas.

**Correction minimale** — remplacer le `.catch(() => {})` par :

```tsx
.catch((err: unknown) => {
  setError(err instanceof Error ? err.message : 'Failed to download PDF');
})
```

---

## Observations non bloquantes

1. **`a.click()` sans append au DOM** (`CraHistory.tsx:41–43`) — pattern fonctionnel sur les navigateurs modernes, mais `appendChild` + `remove` est plus robuste.
2. **`CraDetailsDto` re-déclare `validationDate`** redondamment (`types/cra.ts:27`) — hérité de `CraSummaryDto`, re-déclaration inutile.
3. **`api/types.ts` non mis à jour** — ce fichier parallèle définit son propre `CraSummaryDto` sans `validationDate`. Pas de régression fonctionnelle (non utilisé par `CraHistory`), mais dette technique préexistante.
4. **Pas d'indicateur visuel de vue active** dans la nav — hors AC.
5. **Test PDF** ne vérifie pas le clic sur l'ancre ni `revokeObjectURL`, seulement l'appel API.

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T025/reviews/implementation-review.md
- generated at: 2026-07-12T17:14:12Z

---

# PR Review — T025: Create CRA History Page

## Résumé

Implémentation globalement solide et dans le scope. Le composant `CraHistory`, ses styles, ses tests et le câblage `App.tsx` sont en place. Cinq des six critères d'acceptance sont respectés. Un problème bloquant est identifié.

---

## Points validés

- Listing CRA via `listCras()` au montage, tableau avec colonnes Period / Status / Worked Days / Validation Date / Actions
- États vide (`"No CRA records found."`), chargement (`"Loading..."`), et erreur API (`role="alert"`) correctement gérés
- Bouton "Open" sur chaque ligne, gating du bouton "Download PDF" sur `status === 'VALIDATED'`
- État `downloading` par ID pour désactiver le bouton en cours sans bloquer les autres lignes
- 10 tests couvrant tous les états et les interactions principales
- Scope respecté : pas de routeur, pas de backend modifié, navigation par état dans `App.tsx`

---

## Problème bloquant

### Erreurs de téléchargement PDF silencieusement ignorées

**`CraHistory.tsx:44`**

```tsx
.catch(() => {})
```

Si `downloadCraPdf` échoue, l'erreur est avalée sans aucun retour utilisateur. L'AC « error states are handled » n'est pas respecté pour ce cas.

**Correction minimale** — remplacer le `.catch(() => {})` par :

```tsx
.catch((err: unknown) => {
  setError(err instanceof Error ? err.message : 'Failed to download PDF');
})
```

---

## Observations non bloquantes

1. **`a.click()` sans append au DOM** (`CraHistory.tsx:41–43`) — pattern fonctionnel sur les navigateurs modernes, mais `appendChild` + `remove` est plus robuste.
2. **`CraDetailsDto` re-déclare `validationDate`** redondamment (`types/cra.ts:27`) — hérité de `CraSummaryDto`, re-déclaration inutile.
3. **`api/types.ts` non mis à jour** — ce fichier parallèle définit son propre `CraSummaryDto` sans `validationDate`. Pas de régression fonctionnelle (non utilisé par `CraHistory`), mais dette technique préexistante.
4. **Pas d'indicateur visuel de vue active** dans la nav — hors AC.
5. **Test PDF** ne vérifie pas le clic sur l'ancre ni `revokeObjectURL`, seulement l'appel API.

---

IMPLEMENTATION_FIX_REQUIRED