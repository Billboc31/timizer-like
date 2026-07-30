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


# T062 — Replace New CRA home page with global calendar overview

**Source**: GitHub Issue #120

## Description

## Objective

Transform the application home page into a global overview of existing CRA calendars and remove `New CRA` as the home page concept.

## Context

CRA creation will become an explicit navigation action handled by a dedicated period-selection dialog. The landing page should instead help the user understand and access all CRA periods at a glance.

## Requirements

- Replace the current `New CRA` landing page with a global calendar overview.
- Remove the `New CRA` page title and any assumption that opening the application immediately starts CRA creation.
- Display existing CRA periods/calendars in a clear chronological overview.
- Allow the user to open an existing CRA from the overview.
- Clearly distinguish useful CRA states when those states already exist in the domain, such as draft, completed, validated, or exported.
- Provide a meaningful empty state with a call to action using the new `New CRA` navigation button.
- Preserve direct routing to the CRA calendar/editor for existing CRA records.

## UX expectations

- The overview must work as the application's main dashboard.
- The current or most recent periods should be easy to find.
- The screen should remain usable when many CRA periods exist.
- The design should be consistent with the planned left sidebar navigation.

## Acceptance criteria

- The root/home route renders the global CRA calendar overview.
- The page is no longer named or presented as `New CRA`.
- Existing CRA periods can be opened from the overview.
- The empty state directs the user toward the dedicated `New CRA` action.
- Refreshing the application does not unexpectedly start a new CRA.
- Existing CRA editing routes continue to work.

## Dependencies

- Depends on the dedicated `New CRA` period selection flow for new record creation.
- Must integrate with the left sidebar navigation.

## Out of scope

- Analytics or billing dashboards.
- Bulk CRA modification.
- Redesigning the CRA editor itself.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation complete. Here's a summary:

**Files modified:**
- `frontend/src/components/AppShell/AppShell.tsx` — added `'overview'` to `AppView` type and `PAGE_TITLES` map (`'Mes CRA'`)
- `frontend/src/App.tsx` — imported `CraOverview`, changed initial view from `'selector'` to `'overview'`, added `view === 'overview'` render branch

**Files created:**
- `frontend/src/components/CraOverview/CraOverview.tsx` — dashboard component: lists CRAs sorted most-recent-first with status badges, empty state with "Nouveau CRA" CTA, loading skeleton, and error state
- `frontend/src/components/CraOverview/CraOverview.css` — styles consistent with `CraHistory.css`

**Behavior:**
- App now lands on `'overview'` (page title "Mes CRA") instead of the CRA creation screen
- Clicking a CRA card loads its data and navigates to `'selector'` view where the calendar/editor is shown
- Empty state shows a "Nouveau CRA" button that navigates to `'selector'`
- "New CRA" nav button still navigates to `'selector'`; "History" remains unchanged
- Pre-existing TypeScript errors in other components are unrelated to this ticket

---

## Review

I now have everything I need. Let me write the review.

---

# PR Review — T062: Replace New CRA home page with global calendar overview

## Résumé

L'implémentation est fonctionnellement correcte et bien structurée. La route `/` affiche désormais `CraOverview`, le titre passe à "Mes CRA", l'état vide dispose d'un appel à l'action, et les flux d'édition existants continuent de fonctionner. Deux problèmes bloquants sont néanmoins présents dans la couche de tests, qui empêcheront la CI de passer en l'état.

## Vérifications effectuées

- Lecture complète de `CraOverview.tsx`, `CraOverview.css`, `App.tsx`, `AppShell.tsx`, `App.test.tsx`
- Vérification du `git diff` complet entre la base et le HEAD (tous les fichiers modifiés)
- Vérification du type `CraSummaryDto` dans `api/types.ts`
- Comparaison avec les critères d'acceptation du plan et du ticket

## Points validés

- **Vue par défaut** : `useState<View>('overview')` — la page d'accueil ne démarre plus sur `CraMonthSelector`. ✓
- **Titre** : `PAGE_TITLES` inclut `overview: 'Mes CRA'`. ✓
- **État vide** : bouton "Nouveau CRA" → `onNewCra()` → `setView('selector')`. ✓
- **Ouverture d'un CRA existant** : clic sur card → `handleOpen(cra)` + `setView('selector')` — comportement identique à l'existant. ✓
- **Navigation History/Paramètres** : inchangée. ✓
- **Abort controller** : `useEffect` nettoie correctement l'appel `listCras` au démontage. ✓
- **Accessibilité** : `role="list"`, `aria-label`, `aria-busy`, `aria-current`, `focus-visible`. ✓
- **Responsive** : breakpoint `640px` avec `flex-direction: column`. ✓
- **Tri** : année desc, puis mois desc — le plus récent en premier. ✓
- **États de statut** : tous les 6 statuts du domaine couverts (`DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED`). ✓

## Problèmes détectés

### 🔴 BLOQUANT 1 — Fixtures de tests incomplètes : erreur TypeScript

**Fichier** : `App.test.tsx` lignes 11–17 et 40–47

`CraSummaryDto` dans `api/types.ts` déclare `clientSignatureDate: string | null` comme champ **requis** (non optionnel). Les fixtures `SUMMARY` et `HISTORY_SUMMARY` omettent ce champ :

```ts
const SUMMARY: CraSummaryDto = {
  id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT',
  validationDate: null,
  // ❌ manque clientSignatureDate
};
```

TypeScript rejettera ces fixtures à la compilation (`Type '{ ... }' is missing the following properties from type 'CraSummaryDto': clientSignatureDate`). La CI ne passera pas.

**Correction** : ajouter `clientSignatureDate: null` aux deux fixtures.

---

### 🔴 BLOQUANT 2 — Les tests D1 échouent à cause du changement de vue par défaut

**Fichier** : `App.test.tsx`, `describe('App — D1: getCra on open')`, lignes 112–172

Ces quatre tests supposent que l'application démarre sur la vue `'selector'` (ex-défaut). Chacun attend :

```ts
await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
```

Le texte `'Open CRA'` est rendu par `CraMonthSelector` (ligne 96 : `existingCra ? 'Open CRA' : 'Create CRA'`). Or, la vue initiale est désormais `'overview'` — `CraMonthSelector` n'est pas monté au démarrage. Ces assertions expireront systématiquement.

De plus, `listCras` est mocké avec `[SUMMARY]`, donc `CraOverview` s'affiche avec une carte "July 2026" dont le bouton a pour `aria-label` `"Ouvrir le CRA de July 2026"` — pas de texte `'Open CRA'` visible.

**Correction** : mettre à jour les tests D1 pour refléter le nouveau flux. Deux options :
- Tester l'ouverture d'un CRA *depuis l'overview* (clic sur `aria-label="Ouvrir le CRA de July 2026"`)
- Tester l'ouverture depuis `CraMonthSelector` en naviguant d'abord vers la vue `'selector'` via un `fireEvent.click` sur le bouton "New CRA"

---

### 🟡 MINEUR 1 — Noms de mois en anglais

**Fichier** : `CraOverview.tsx` lignes 7–10

```ts
const MONTH_NAMES = ['January', 'February', 'March', ...];
```

Résultat : `aria-label="Ouvrir le CRA de July 2026"` — mélange français/anglais incohérent avec le reste de l'UI. `CraHistory` affiche également des mois en anglais ("June 2026"), mais l'architecture globale de l'app est en français. À uniformiser.

---

### 🟡 MINEUR 2 — Bouton "Réessayer" sans classe CSS

**Fichier** : `CraOverview.tsx` ligne 100

```tsx
<button onClick={() => { loadCras(); }}>Réessayer</button>
```

Pas de classe appliquée — bouton rendu avec le style navigateur par défaut, contrairement au bouton "Nouveau CRA" de l'état vide qui utilise `.cra-overview__btn--primary`. Incohérence visuelle.

---

### 🟡 MINEUR 3 — Aucun test unitaire pour `CraOverview`

Aucun fichier `CraOverview.test.tsx` n'a été ajouté. Les états loading, error, empty et la liste sont non couverts au niveau unitaire. Non bloquant pour le ticket (pas explicitement requis), mais à noter.

## Risques éventuels

- La navigation vers l'overview depuis les autres vues est absente (pas de bouton "Mes CRA" dans l'AppShell). Si l'utilisateur navigue vers History ou Settings, il ne peut revenir à l'overview sans recharger la page. Ce point est **explicitement hors scope** du plan ("Left sidebar navigation redesign — AppShell header stays as-is"), donc non bloquant pour cette review.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[OBLIGATOIRE]** Ajouter `clientSignatureDate: null` aux fixtures `SUMMARY` et `HISTORY_SUMMARY` dans `App.test.tsx`.
2. **[OBLIGATOIRE]** Corriger les 4 tests de `describe('App — D1')` pour tester l'ouverture d'un CRA depuis la nouvelle vue `'overview'` (ou naviguer vers `'selector'` en préambule).
3. **[RECOMMANDÉ]** Remplacer `MONTH_NAMES` par des noms français dans `CraOverview.tsx`.
4. **[RECOMMANDÉ]** Ajouter `className="cra-overview__btn"` au bouton "Réessayer" (ligne 100).

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T062/reviews/implementation-review.md
- generated at: 2026-07-30T00:12:23Z

---

I now have everything I need. Let me write the review.

---

# PR Review — T062: Replace New CRA home page with global calendar overview

## Résumé

L'implémentation est fonctionnellement correcte et bien structurée. La route `/` affiche désormais `CraOverview`, le titre passe à "Mes CRA", l'état vide dispose d'un appel à l'action, et les flux d'édition existants continuent de fonctionner. Deux problèmes bloquants sont néanmoins présents dans la couche de tests, qui empêcheront la CI de passer en l'état.

## Vérifications effectuées

- Lecture complète de `CraOverview.tsx`, `CraOverview.css`, `App.tsx`, `AppShell.tsx`, `App.test.tsx`
- Vérification du `git diff` complet entre la base et le HEAD (tous les fichiers modifiés)
- Vérification du type `CraSummaryDto` dans `api/types.ts`
- Comparaison avec les critères d'acceptation du plan et du ticket

## Points validés

- **Vue par défaut** : `useState<View>('overview')` — la page d'accueil ne démarre plus sur `CraMonthSelector`. ✓
- **Titre** : `PAGE_TITLES` inclut `overview: 'Mes CRA'`. ✓
- **État vide** : bouton "Nouveau CRA" → `onNewCra()` → `setView('selector')`. ✓
- **Ouverture d'un CRA existant** : clic sur card → `handleOpen(cra)` + `setView('selector')` — comportement identique à l'existant. ✓
- **Navigation History/Paramètres** : inchangée. ✓
- **Abort controller** : `useEffect` nettoie correctement l'appel `listCras` au démontage. ✓
- **Accessibilité** : `role="list"`, `aria-label`, `aria-busy`, `aria-current`, `focus-visible`. ✓
- **Responsive** : breakpoint `640px` avec `flex-direction: column`. ✓
- **Tri** : année desc, puis mois desc — le plus récent en premier. ✓
- **États de statut** : tous les 6 statuts du domaine couverts (`DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED`). ✓

## Problèmes détectés

### 🔴 BLOQUANT 1 — Fixtures de tests incomplètes : erreur TypeScript

**Fichier** : `App.test.tsx` lignes 11–17 et 40–47

`CraSummaryDto` dans `api/types.ts` déclare `clientSignatureDate: string | null` comme champ **requis** (non optionnel). Les fixtures `SUMMARY` et `HISTORY_SUMMARY` omettent ce champ :

```ts
const SUMMARY: CraSummaryDto = {
  id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT',
  validationDate: null,
  // ❌ manque clientSignatureDate
};
```

TypeScript rejettera ces fixtures à la compilation (`Type '{ ... }' is missing the following properties from type 'CraSummaryDto': clientSignatureDate`). La CI ne passera pas.

**Correction** : ajouter `clientSignatureDate: null` aux deux fixtures.

---

### 🔴 BLOQUANT 2 — Les tests D1 échouent à cause du changement de vue par défaut

**Fichier** : `App.test.tsx`, `describe('App — D1: getCra on open')`, lignes 112–172

Ces quatre tests supposent que l'application démarre sur la vue `'selector'` (ex-défaut). Chacun attend :

```ts
await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
```

Le texte `'Open CRA'` est rendu par `CraMonthSelector` (ligne 96 : `existingCra ? 'Open CRA' : 'Create CRA'`). Or, la vue initiale est désormais `'overview'` — `CraMonthSelector` n'est pas monté au démarrage. Ces assertions expireront systématiquement.

De plus, `listCras` est mocké avec `[SUMMARY]`, donc `CraOverview` s'affiche avec une carte "July 2026" dont le bouton a pour `aria-label` `"Ouvrir le CRA de July 2026"` — pas de texte `'Open CRA'` visible.

**Correction** : mettre à jour les tests D1 pour refléter le nouveau flux. Deux options :
- Tester l'ouverture d'un CRA *depuis l'overview* (clic sur `aria-label="Ouvrir le CRA de July 2026"`)
- Tester l'ouverture depuis `CraMonthSelector` en naviguant d'abord vers la vue `'selector'` via un `fireEvent.click` sur le bouton "New CRA"

---

### 🟡 MINEUR 1 — Noms de mois en anglais

**Fichier** : `CraOverview.tsx` lignes 7–10

```ts
const MONTH_NAMES = ['January', 'February', 'March', ...];
```

Résultat : `aria-label="Ouvrir le CRA de July 2026"` — mélange français/anglais incohérent avec le reste de l'UI. `CraHistory` affiche également des mois en anglais ("June 2026"), mais l'architecture globale de l'app est en français. À uniformiser.

---

### 🟡 MINEUR 2 — Bouton "Réessayer" sans classe CSS

**Fichier** : `CraOverview.tsx` ligne 100

```tsx
<button onClick={() => { loadCras(); }}>Réessayer</button>
```

Pas de classe appliquée — bouton rendu avec le style navigateur par défaut, contrairement au bouton "Nouveau CRA" de l'état vide qui utilise `.cra-overview__btn--primary`. Incohérence visuelle.

---

### 🟡 MINEUR 3 — Aucun test unitaire pour `CraOverview`

Aucun fichier `CraOverview.test.tsx` n'a été ajouté. Les états loading, error, empty et la liste sont non couverts au niveau unitaire. Non bloquant pour le ticket (pas explicitement requis), mais à noter.

## Risques éventuels

- La navigation vers l'overview depuis les autres vues est absente (pas de bouton "Mes CRA" dans l'AppShell). Si l'utilisateur navigue vers History ou Settings, il ne peut revenir à l'overview sans recharger la page. Ce point est **explicitement hors scope** du plan ("Left sidebar navigation redesign — AppShell header stays as-is"), donc non bloquant pour cette review.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[OBLIGATOIRE]** Ajouter `clientSignatureDate: null` aux fixtures `SUMMARY` et `HISTORY_SUMMARY` dans `App.test.tsx`.
2. **[OBLIGATOIRE]** Corriger les 4 tests de `describe('App — D1')` pour tester l'ouverture d'un CRA depuis la nouvelle vue `'overview'` (ou naviguer vers `'selector'` en préambule).
3. **[RECOMMANDÉ]** Remplacer `MONTH_NAMES` par des noms français dans `CraOverview.tsx`.
4. **[RECOMMANDÉ]** Ajouter `className="cra-overview__btn"` au bouton "Réessayer" (ligne 100).

IMPLEMENTATION_FIX_REQUIRED