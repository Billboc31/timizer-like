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

All 40 tests pass (11 in `CraHistory`, up from 10). The jsdom navigation warning is a pre-existing environment noise from `a.click()` — not a test failure.

**Changes made:**

| File | Change |
|------|--------|
| `frontend/src/components/CraHistory/CraHistory.tsx` | Replaced empty `.catch(() => {})` with one that calls `setError(...)` on PDF download failure |
| `frontend/src/components/CraHistory/CraHistory.test.tsx` | Added test `'shows error when PDF download fails'` covering the new error path |

The blocking issue from the review is resolved: PDF download errors now surface to the user via the same `role="alert"` error element used for API load failures.

---

## Review

Now I have all the information needed to write the complete review.

---

# PR Review — T025: Create CRA History Page (Attempt 2)

## Résumé

Le problème bloquant de la review précédente (erreur PDF silencieuse) a été correctement corrigé avec `.catch((err: unknown) => { setError(...) })` et un test dédié. Cependant, l'extension de `CraSummaryDto` pour y ajouter `validationDate` a introduit deux régressions TypeScript bloquantes dans des fichiers préexistants non mis à jour.

---

## Vérifications effectuées

- Lecture de `CraHistory.tsx`, `CraHistory.test.tsx`, `CraHistory.css`, `App.tsx`
- Lecture de `types/cra.ts`, `api/cra.ts`, `api/types.ts`
- Lecture de `CraMonthSelector.tsx` et `CraMonthSelector.test.tsx`
- Exécution de `tsc -p tsconfig.app.json --noEmit`
- Diff entre `ai-dev-factory/bootstrap-agent-layout` et `HEAD`
- Lecture de la review précédente et des artefacts de fix

---

## Points validés

- **Fix bloquant appliqué** : `CraHistory.tsx:44` remplace `.catch(() => {})` par `.catch((err: unknown) => { setError(...) })` + `.finally(() => { setDownloading(null) })` → erreur PDF désormais visible
- **Test ajouté** : `'shows error when PDF download fails'` couvre le nouveau cas avec `role="alert"`
- **Tous les AC du ticket** couverts : listing, période/statut/jours, open, download conditionnel, état vide, loading, erreur
- **Scope respecté** : pas de routeur, pas de modification backend, navigation par état dans `App.tsx`
- **10 + 1 tests** pour `CraHistory`

---

## Problèmes détectés

### BLOQUANT 1 — `CraMonthSelector.tsx:48` — `validationDate` absent de l'objet `summary`

L'extension de `CraSummaryDto` dans ce ticket (ajout de `validationDate: string | null`) n'a pas été répercutée dans le code existant qui construit ce type manuellement.

**`frontend/src/components/CraMonthSelector/CraMonthSelector.tsx:48-54`**
```tsx
const summary: CraSummaryDto = {
  id: created.id,
  month: created.month,
  year: created.year,
  totalWorkedDays: created.totalWorkedDays,
  status: created.status,
  // validationDate manquant → TS2741
};
```

Confirmé par `tsc`: `error TS2741: Property 'validationDate' is missing`.

**Correction** :
```tsx
const summary: CraSummaryDto = {
  id: created.id,
  month: created.month,
  year: created.year,
  totalWorkedDays: created.totalWorkedDays,
  status: created.status,
  validationDate: created.validationDate ?? null,
};
```

---

### BLOQUANT 2 — `CraMonthSelector.test.tsx:11` — fixture `JULY_2026` incomplète

Le même champ manque dans le fixture de test.

**`frontend/src/components/CraMonthSelector/CraMonthSelector.test.tsx:11-17`**
```tsx
const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  // validationDate manquant → TS2741
};
```

**Correction** :
```tsx
const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
};
```

---

## Observations non bloquantes (portées depuis review précédente)

1. **`CraDetailsDto` re-déclare `validationDate`** (`types/cra.ts:27`) — hérité de `CraSummaryDto`, redondant.
2. **`api/types.ts`** définit son propre `CraSummaryDto` sans `validationDate` — dette préexistante, hors scope.
3. **`a.click()` sans append au DOM** (`CraHistory.tsx:38-43`) — pattern fonctionnel, non bloquant.

---

## Risques éventuels

- Les erreurs TypeScript n'empêchent pas Vite de builder (mode dev), mais elles cassent le type-check strict du projet et masquent une vraie régression comportementale : un CRA fraîchement créé dans `CraMonthSelector` aura `validationDate: undefined` au lieu de `null`, ce qui peut provoquer un affichage `undefined` dans la colonne Validation Date de `CraHistory` si cet objet y est passé.

---

## Actions demandées

1. Ajouter `validationDate: created.validationDate ?? null` dans `CraMonthSelector.tsx:54`
2. Ajouter `validationDate: null` dans le fixture `JULY_2026` de `CraMonthSelector.test.tsx:17`
3. Vérifier `tsc -p tsconfig.app.json --noEmit` sans nouvelles erreurs après le fix

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T025/reviews/implementation-review.md
- generated at: 2026-07-12T17:19:13Z

---

Now I have all the information needed to write the complete review.

---

# PR Review — T025: Create CRA History Page (Attempt 2)

## Résumé

Le problème bloquant de la review précédente (erreur PDF silencieuse) a été correctement corrigé avec `.catch((err: unknown) => { setError(...) })` et un test dédié. Cependant, l'extension de `CraSummaryDto` pour y ajouter `validationDate` a introduit deux régressions TypeScript bloquantes dans des fichiers préexistants non mis à jour.

---

## Vérifications effectuées

- Lecture de `CraHistory.tsx`, `CraHistory.test.tsx`, `CraHistory.css`, `App.tsx`
- Lecture de `types/cra.ts`, `api/cra.ts`, `api/types.ts`
- Lecture de `CraMonthSelector.tsx` et `CraMonthSelector.test.tsx`
- Exécution de `tsc -p tsconfig.app.json --noEmit`
- Diff entre `ai-dev-factory/bootstrap-agent-layout` et `HEAD`
- Lecture de la review précédente et des artefacts de fix

---

## Points validés

- **Fix bloquant appliqué** : `CraHistory.tsx:44` remplace `.catch(() => {})` par `.catch((err: unknown) => { setError(...) })` + `.finally(() => { setDownloading(null) })` → erreur PDF désormais visible
- **Test ajouté** : `'shows error when PDF download fails'` couvre le nouveau cas avec `role="alert"`
- **Tous les AC du ticket** couverts : listing, période/statut/jours, open, download conditionnel, état vide, loading, erreur
- **Scope respecté** : pas de routeur, pas de modification backend, navigation par état dans `App.tsx`
- **10 + 1 tests** pour `CraHistory`

---

## Problèmes détectés

### BLOQUANT 1 — `CraMonthSelector.tsx:48` — `validationDate` absent de l'objet `summary`

L'extension de `CraSummaryDto` dans ce ticket (ajout de `validationDate: string | null`) n'a pas été répercutée dans le code existant qui construit ce type manuellement.

**`frontend/src/components/CraMonthSelector/CraMonthSelector.tsx:48-54`**
```tsx
const summary: CraSummaryDto = {
  id: created.id,
  month: created.month,
  year: created.year,
  totalWorkedDays: created.totalWorkedDays,
  status: created.status,
  // validationDate manquant → TS2741
};
```

Confirmé par `tsc`: `error TS2741: Property 'validationDate' is missing`.

**Correction** :
```tsx
const summary: CraSummaryDto = {
  id: created.id,
  month: created.month,
  year: created.year,
  totalWorkedDays: created.totalWorkedDays,
  status: created.status,
  validationDate: created.validationDate ?? null,
};
```

---

### BLOQUANT 2 — `CraMonthSelector.test.tsx:11` — fixture `JULY_2026` incomplète

Le même champ manque dans le fixture de test.

**`frontend/src/components/CraMonthSelector/CraMonthSelector.test.tsx:11-17`**
```tsx
const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  // validationDate manquant → TS2741
};
```

**Correction** :
```tsx
const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
};
```

---

## Observations non bloquantes (portées depuis review précédente)

1. **`CraDetailsDto` re-déclare `validationDate`** (`types/cra.ts:27`) — hérité de `CraSummaryDto`, redondant.
2. **`api/types.ts`** définit son propre `CraSummaryDto` sans `validationDate` — dette préexistante, hors scope.
3. **`a.click()` sans append au DOM** (`CraHistory.tsx:38-43`) — pattern fonctionnel, non bloquant.

---

## Risques éventuels

- Les erreurs TypeScript n'empêchent pas Vite de builder (mode dev), mais elles cassent le type-check strict du projet et masquent une vraie régression comportementale : un CRA fraîchement créé dans `CraMonthSelector` aura `validationDate: undefined` au lieu de `null`, ce qui peut provoquer un affichage `undefined` dans la colonne Validation Date de `CraHistory` si cet objet y est passé.

---

## Actions demandées

1. Ajouter `validationDate: created.validationDate ?? null` dans `CraMonthSelector.tsx:54`
2. Ajouter `validationDate: null` dans le fixture `JULY_2026` de `CraMonthSelector.test.tsx:17`
3. Vérifier `tsc -p tsconfig.app.json --noEmit` sans nouvelles erreurs après le fix

---

IMPLEMENTATION_FIX_REQUIRED