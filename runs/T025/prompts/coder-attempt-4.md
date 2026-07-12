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

All 40 tests pass. Fix summary:

**Files modified:**
- `frontend/src/components/CraMonthSelector/CraMonthSelector.tsx:54` — added `validationDate: created.validationDate ?? null` to the `summary` object
- `frontend/src/components/CraMonthSelector/CraMonthSelector.test.tsx:17` — added `validationDate: null` to the `JULY_2026` fixture

Both TS2741 blocking errors are resolved. All 40 tests pass. The jsdom navigation warning is pre-existing noise from `a.click()` in the PDF download path.

---

## Review

Now I have everything. Writing the review.

# PR Review — T025: Create CRA history page

## Résumé

L'implémentation couvre les fonctionnalités demandées : page de listing, table avec période/statut/jours travaillés/date de validation, états vide/chargement/erreur, boutons Open et Download PDF conditionnel. La structure de composant, les types TypeScript et les 11 tests unitaires sont globalement solides. Un bug bloquant est identifié dans la gestion des erreurs de téléchargement PDF.

## Vérifications effectuées

- Lecture complète de `CraHistory.tsx`, `CraHistory.test.tsx`, `CraHistory.css`
- Lecture de `api/cra.ts`, `types/cra.ts` (modifications)
- Lecture de `App.tsx` (wiring navigation)
- Lecture de `CraMonthSelector.tsx` (impact du changement de type)
- Vérification du comportement d'App.tsx avant T025 (`git show 1a53524:frontend/src/App.tsx`)
- Examen des critères d'acceptance un par un

## Points validés

- **Listing des CRAs** : `listCras()` appelé au montage via `useEffect`, données affichées en table — AC 1 OK
- **Colonnes requises** : période (MONTH_NAMES + année), statut, worked days, validation date (tiret si null) — AC 2 OK
- **Bouton Download PDF conditionnel** : rendu uniquement quand `status === 'VALIDATED'` — AC 5 OK
- **État vide** : message "No CRA records found." — AC 4 OK
- **État chargement** : "Loading..." — AC 6 partiel (voir problèmes)
- **Extension `CraSummaryDto`** : `validationDate: string | null` ajouté proprement, propagé dans `CraMonthSelector.tsx:54` avec `?? null` — pas de régression TypeScript
- **Tests CraMonthSelector** : fixture `JULY_2026` mise à jour avec `validationDate: null` — cohérent
- **handleOpen dans App.tsx** : comportement console.log pré-existant avant T025 (vérifié sur commit 1a53524), non-régression
- **Scope** : aucune dérive — backend, PDF generation, calendrier hors périmètre respectés

## Problèmes détectés

### 🔴 Bloquant — L'erreur de téléchargement PDF efface la table

**Fichier** : `CraHistory.tsx:44-51`

Le composant utilise le même état `error` pour les erreurs de chargement initial et les erreurs de téléchargement PDF :

```tsx
// Ligne 44-46 : erreur PDF écrit dans `error`
.catch((err: unknown) => {
  setError(err instanceof Error ? err.message : 'Failed to download PDF');
})

// Ligne 51 : early return qui cache la table
if (error) return <p className="cra-history__status cra-history__status--error" role="alert">{error}</p>;
```

**Conséquence** : après un échec de téléchargement PDF, la table disparaît entièrement. L'utilisateur perd la vue historique et doit rafraîchir la page pour retrouver ses CRAs. Aucun moyen de réessayer sans rechargement.

**Le test** (`shows error when PDF download fails`, ligne 94) valide que l'alerte s'affiche mais ne vérifie pas que la table est toujours présente — il couvre le comportement bugué sans le détecter comme tel.

**Fix attendu** : utiliser un état séparé pour les erreurs de téléchargement, affiché en ligne sans early return :

```tsx
const [downloadError, setDownloadError] = useState<string | null>(null);

// Dans handleDownloadPdf :
.catch((err: unknown) => {
  setDownloadError(err instanceof Error ? err.message : 'Failed to download PDF');
})

// Dans le rendu de la table, ajouter sous le titre ou dans le footer :
{downloadError && <p role="alert" className="...">{downloadError}</p>}
```

Le test correspondant doit aussi vérifier que la table est toujours rendue après une erreur PDF.

---

### 🟡 Observation (non-bloquant) — `CraDetailsDto` re-déclare `validationDate`

**Fichier** : `types/cra.ts:27`

```typescript
export interface CraDetailsDto extends CraSummaryDto {
  days: CraDayEntry[];
  validationDate: string | null;  // déjà hérité de CraSummaryDto
  providerSignatureDate: string | null;
}
```

La re-déclaration est redondante (TypeScript l'accepte si le type est identique). Correctif trivial : supprimer la ligne, mais peut être traité dans un ticket de nettoyage.

---

### 🟡 Observation (non-bloquant) — PDF download sans append DOM

**Fichier** : `CraHistory.tsx:38-42`

```tsx
const a = document.createElement('a');
a.href = url;
a.download = `cra-${cra.year}-${String(cra.month).padStart(2, '0')}.pdf`;
a.click();
```

L'élément `<a>` n'est pas ajouté au DOM avant le click. Ce pattern fonctionne dans les navigateurs modernes et dans jsdom, mais est non-standard. Pas bloquant mais fragile.

## Risques éventuels

- **AC "User can open a CRA from history"** : `onOpen(cra)` est correctement propagé par `CraHistory`, mais `handleOpen` dans App.tsx effectue uniquement un `console.log`. Ce comportement était identique avant T025 (vérifié sur commit 1a53524) — non-régression introduite par ce ticket. La navigation effective vers la vue CRA est hors scope T025 (pas de CalendarGrid wirée). L'AC est satisfait au niveau du contrat composant, mais pas au niveau utilisateur final. À documenter comme dette connue à combler dans un ticket ultérieur.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[Bloquant]** Séparer l'état d'erreur de téléchargement PDF de l'état d'erreur de chargement. Utiliser `downloadError` affiché en ligne dans la table sans early return. Mettre à jour le test `shows error when PDF download fails` pour vérifier que la table reste rendue après l'erreur.

2. **[Optionnel]** Supprimer la re-déclaration redondante de `validationDate` dans `CraDetailsDto`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T025/reviews/implementation-review.md
- generated at: 2026-07-12T17:25:50Z

---

Now I have everything. Writing the review.

# PR Review — T025: Create CRA history page

## Résumé

L'implémentation couvre les fonctionnalités demandées : page de listing, table avec période/statut/jours travaillés/date de validation, états vide/chargement/erreur, boutons Open et Download PDF conditionnel. La structure de composant, les types TypeScript et les 11 tests unitaires sont globalement solides. Un bug bloquant est identifié dans la gestion des erreurs de téléchargement PDF.

## Vérifications effectuées

- Lecture complète de `CraHistory.tsx`, `CraHistory.test.tsx`, `CraHistory.css`
- Lecture de `api/cra.ts`, `types/cra.ts` (modifications)
- Lecture de `App.tsx` (wiring navigation)
- Lecture de `CraMonthSelector.tsx` (impact du changement de type)
- Vérification du comportement d'App.tsx avant T025 (`git show 1a53524:frontend/src/App.tsx`)
- Examen des critères d'acceptance un par un

## Points validés

- **Listing des CRAs** : `listCras()` appelé au montage via `useEffect`, données affichées en table — AC 1 OK
- **Colonnes requises** : période (MONTH_NAMES + année), statut, worked days, validation date (tiret si null) — AC 2 OK
- **Bouton Download PDF conditionnel** : rendu uniquement quand `status === 'VALIDATED'` — AC 5 OK
- **État vide** : message "No CRA records found." — AC 4 OK
- **État chargement** : "Loading..." — AC 6 partiel (voir problèmes)
- **Extension `CraSummaryDto`** : `validationDate: string | null` ajouté proprement, propagé dans `CraMonthSelector.tsx:54` avec `?? null` — pas de régression TypeScript
- **Tests CraMonthSelector** : fixture `JULY_2026` mise à jour avec `validationDate: null` — cohérent
- **handleOpen dans App.tsx** : comportement console.log pré-existant avant T025 (vérifié sur commit 1a53524), non-régression
- **Scope** : aucune dérive — backend, PDF generation, calendrier hors périmètre respectés

## Problèmes détectés

### 🔴 Bloquant — L'erreur de téléchargement PDF efface la table

**Fichier** : `CraHistory.tsx:44-51`

Le composant utilise le même état `error` pour les erreurs de chargement initial et les erreurs de téléchargement PDF :

```tsx
// Ligne 44-46 : erreur PDF écrit dans `error`
.catch((err: unknown) => {
  setError(err instanceof Error ? err.message : 'Failed to download PDF');
})

// Ligne 51 : early return qui cache la table
if (error) return <p className="cra-history__status cra-history__status--error" role="alert">{error}</p>;
```

**Conséquence** : après un échec de téléchargement PDF, la table disparaît entièrement. L'utilisateur perd la vue historique et doit rafraîchir la page pour retrouver ses CRAs. Aucun moyen de réessayer sans rechargement.

**Le test** (`shows error when PDF download fails`, ligne 94) valide que l'alerte s'affiche mais ne vérifie pas que la table est toujours présente — il couvre le comportement bugué sans le détecter comme tel.

**Fix attendu** : utiliser un état séparé pour les erreurs de téléchargement, affiché en ligne sans early return :

```tsx
const [downloadError, setDownloadError] = useState<string | null>(null);

// Dans handleDownloadPdf :
.catch((err: unknown) => {
  setDownloadError(err instanceof Error ? err.message : 'Failed to download PDF');
})

// Dans le rendu de la table, ajouter sous le titre ou dans le footer :
{downloadError && <p role="alert" className="...">{downloadError}</p>}
```

Le test correspondant doit aussi vérifier que la table est toujours rendue après une erreur PDF.

---

### 🟡 Observation (non-bloquant) — `CraDetailsDto` re-déclare `validationDate`

**Fichier** : `types/cra.ts:27`

```typescript
export interface CraDetailsDto extends CraSummaryDto {
  days: CraDayEntry[];
  validationDate: string | null;  // déjà hérité de CraSummaryDto
  providerSignatureDate: string | null;
}
```

La re-déclaration est redondante (TypeScript l'accepte si le type est identique). Correctif trivial : supprimer la ligne, mais peut être traité dans un ticket de nettoyage.

---

### 🟡 Observation (non-bloquant) — PDF download sans append DOM

**Fichier** : `CraHistory.tsx:38-42`

```tsx
const a = document.createElement('a');
a.href = url;
a.download = `cra-${cra.year}-${String(cra.month).padStart(2, '0')}.pdf`;
a.click();
```

L'élément `<a>` n'est pas ajouté au DOM avant le click. Ce pattern fonctionne dans les navigateurs modernes et dans jsdom, mais est non-standard. Pas bloquant mais fragile.

## Risques éventuels

- **AC "User can open a CRA from history"** : `onOpen(cra)` est correctement propagé par `CraHistory`, mais `handleOpen` dans App.tsx effectue uniquement un `console.log`. Ce comportement était identique avant T025 (vérifié sur commit 1a53524) — non-régression introduite par ce ticket. La navigation effective vers la vue CRA est hors scope T025 (pas de CalendarGrid wirée). L'AC est satisfait au niveau du contrat composant, mais pas au niveau utilisateur final. À documenter comme dette connue à combler dans un ticket ultérieur.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[Bloquant]** Séparer l'état d'erreur de téléchargement PDF de l'état d'erreur de chargement. Utiliser `downloadError` affiché en ligne dans la table sans early return. Mettre à jour le test `shows error when PDF download fails` pour vérifier que la table reste rendue après l'erreur.

2. **[Optionnel]** Supprimer la re-déclaration redondante de `validationDate` dans `CraDetailsDto`.

IMPLEMENTATION_FIX_REQUIRED