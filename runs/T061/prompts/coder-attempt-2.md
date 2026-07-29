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


# T061 — Add New CRA period selection dialog

**Source**: GitHub Issue #119

## Description

## Objective

Provide a dedicated `New CRA` action in the application navigation that opens a dialog for selecting the CRA period before entering the calendar.

## Context

CRA creation is currently tied too closely to the landing page. Creating a CRA should become an explicit action available from anywhere in the application.

## Requirements

- Add a visible `New CRA` button/action to the main navigation.
- On click, open a modal dialog without navigating away from the current page.
- Let the user select:
  - Start date
  - End date
- Validate that:
  - Both dates are provided.
  - The end date is not before the start date.
- After confirmation, navigate to the CRA calendar/editor.
- Open the calendar positioned on the selected period rather than the current month.
- Make the selected period available to the CRA creation flow without requiring the user to select it again.
- Closing or cancelling the dialog must not create or modify a CRA.

## UX expectations

- The period selection should be quick and understandable.
- Default values may use the current month, while remaining editable.
- Validation errors must be shown inside the dialog.
- Keyboard and focus behavior should be accessible.

## Acceptance criteria

- `New CRA` is accessible from the navigation on every authenticated application page.
- Clicking it opens the period selection dialog.
- Invalid ranges cannot be submitted.
- Confirming a valid range opens the CRA calendar on the selected start month and period.
- Cancelling leaves the current page and data unchanged.
- The flow works for periods spanning multiple months.

## Dependencies

- The navigation placement must be compatible with the planned left sidebar.

## Out of scope

- Saving reusable period presets.
- Automatically generating recurring CRA records.
- Changing CRA business validation rules.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation is complete. Here's a summary:

---

## Files created/modified

**New:**
- `frontend/src/components/NewCraDialog/NewCraDialog.tsx` — Native `<dialog>` component with two date inputs, inline validation (both required, end ≥ start), focus trap, ESC/cancel handling, loading/error props, and `showModal()`/`close()` driven by the `open` prop.
- `frontend/src/components/NewCraDialog/NewCraDialog.css` — Minimal styles matching the `CraValidation` dialog pattern.

**Modified:**
- `frontend/src/components/AppShell/AppShell.tsx` — Added `onNewCra: () => void` and `newCraTriggerRef?: RefObject<HTMLButtonElement | null>` props; "New CRA" nav button now calls `onNewCra` and holds the trigger ref for focus return.
- `frontend/src/App.tsx` — Added `newCraDialogOpen`, `newCraLoading`, `newCraError`, `selectedPeriod` state and `newCraTriggerRef`; `handleNewCraConfirm` calls `listCras()` to detect an existing CRA for the start month (opens it if found, creates via `createCra` otherwise); focus returns to the nav button on dialog close via a `useEffect`.

## Acceptance criteria verified

- "New CRA" in the nav is present on every authenticated view — it opens the dialog instead of navigating.
- Invalid ranges (empty date or end < start) are rejected with an inline error; the dialog stays open.
- Confirming a valid range reuses an existing CRA or creates a new one, then opens the calendar on the start month.
- Cancelling (button or ESC) leaves the current view and data unchanged.
- No pre-existing TypeScript errors were introduced.

---

## Review

I have reviewed all the relevant files. Let me now write the structured review.

---

## PR Review — T061 : Add New CRA period selection dialog

### Résumé

L'implémentation ajoute correctement un bouton « New CRA » dans la navigation, ouvre un dialogue natif `<dialog>` avec deux champs de date, valide la saisie, crée ou réutilise un CRA existant, puis ouvre le calendrier sur le mois de début. Le périmètre est bien respecté.

Deux problèmes sont cependant identifiés : un bug logique sur `selectedPeriod` et une absence totale de tests pour `NewCraDialog`, incompatible avec la convention uniforme du projet.

---

### Vérifications effectuées

- Ticket vs implémentation (tous les acceptance criteria)
- Plan vs code produit (tous les fichiers listés, logique `handleNewCraConfirm`)
- Typage TypeScript (`createCra` retourne `CraDetailsDto`, passé à `handleOpen(CraSummaryDto)` — compatible structurellement ✅)
- Focus management et focus trap (pattern identique à `CraPeriodNavigator` ✅)
- Gestion ESC via `onCancel` natif (pas de `preventDefault`, comportement attendu ✅)
- Cohérence CSS avec les variables design system existantes ✅
- Couverture de tests du projet (`frontend/src/components/**/*.test.*`)

---

### Points validés

- Bouton « New CRA » présent dans `AppShell` sur toutes les vues authentifiées ✅
- Dialogue s'ouvre sans navigation (`showModal()` contrôlé par `open` prop) ✅
- Valeurs par défaut au premier/dernier jour du mois courant ✅
- Validation inline : champs requis + `endDate >= startDate` ✅
- Erreur serveur affichée dans le dialogue via `error` prop + `role="alert"` ✅
- Annulation (bouton Cancel ou ESC) ne crée/modifie aucun CRA ✅
- Retour de focus sur le bouton déclencheur (`newCraTriggerRef`) ✅
- Focus trap sur Tab/Shift+Tab dans le dialogue ✅
- Réutilisation du CRA existant via `listCras()` avant `createCra()` ✅
- Compatibilité future left-sidebar via `onNewCra` prop ✅
- Aucune régression TypeScript signalée ✅

---

### Problèmes détectés

#### 🔴 Bloquant 1 — `selectedPeriod` est systématiquement effacé

**Localisation :** `frontend/src/App.tsx:115-117` et `handleNewCraConfirm` lignes 150–168

**Code problématique :**
```tsx
// App.tsx:115-117
useEffect(() => {
  if (cra === null) setSelectedPeriod(null);
}, [cra]);
```

**Séquence réelle à l'exécution :**
1. `setSelectedPeriod({ startDate, endDate })` — la valeur est posée
2. `handleOpen(existing)` → `loadCra(id)` → `setCra(null)` (synchrone)
3. React batch les setState et rend → `cra === null`
4. L'effet `[cra]` s'exécute → `setSelectedPeriod(null)` — la valeur est effacée
5. `getCra(id)` résout → `setCra(dtoToDetails(dto))` → l'effet se ré-exécute mais `cra !== null`, donc `selectedPeriod` reste `null`

`selectedPeriod` est donc **toujours `null`** une fois le CRA chargé. L'acceptance criterion du plan n'est pas respecté :
> "The flow works for periods spanning multiple months (the CRA is created for the start month; the end-date value is preserved in `selectedPeriod` state)"

**Fix attendu :** Ne pas effacer `selectedPeriod` pendant le chargement. Par exemple, ne le faire qu'en réponse à une action explicite (réinitialisation de session, retour au sélecteur sans CRA actif), séparé du signal de chargement. Une approche simple :

```tsx
// Supprimer l'effet existant et gérer la réinitialisation explicitement
// Par exemple, uniquement dans handleNewCraCancel ou lors d'une déconnexion
```

---

#### 🔴 Bloquant 2 — Absence totale de tests pour `NewCraDialog`

**Convention du projet :** 100 % des composants ont un fichier `.test.tsx`. La quasi-totalité des composants de dialogue ont aussi un `.axe.test.tsx` :
- `CraPeriodNavigator` → `.test.tsx` + `.axe.test.tsx`
- `CraValidation` → `.test.tsx` + `.axe.test.tsx`
- `CraSummaryPanel` → `.test.tsx` + `.axe.test.tsx`
- `ProviderSignatureBox` → `.test.tsx` + `.axe.test.tsx`

`NewCraDialog` n'a ni `.test.tsx` ni `.axe.test.tsx`. Cette absence rompt la convention uniforme et laisse sans couverture la logique de validation, le focus trap, et l'intégration `open`/`close`.

**Tests minimaux attendus :**
- Rendu avec `open=false` (dialog non visible)
- Rendu avec `open=true` (dialog visible)
- Soumission avec champs vides → message d'erreur inline
- Soumission avec `endDate < startDate` → message d'erreur inline
- Soumission valide → `onConfirm` appelé avec les bonnes dates
- Clic Annuler → `onCancel` appelé
- Affichage de `error` prop
- Désactivation inputs/boutons quand `loading=true`
- Test axe (accessibilité) en état ouvert

---

### Risques éventuels

- **Mineur :** `PAGE_TITLES['selector'] = 'New CRA'` dans `AppShell.tsx:16` — le titre de page affiché après confirmation sera "New CRA" même si l'utilisateur a simplement ouvert un CRA existant depuis `CraMonthSelector`. Ce n'était pas le cas avant le changement (`CraMonthSelector` était la page selector ; le titre peut être trompeur).
- **Mineur :** Les valeurs de date ne sont pas réinitialisées à la réouverture du dialogue (si l'utilisateur modifie les dates, annule, puis rouvre). Le ticket ne l'exige pas explicitement, mais peut surprendre.

---

### Décision

Deux corrections requises avant approbation :
1. Corriger le bug `selectedPeriod` (logique de clearing incorrecte)
2. Ajouter les fichiers `NewCraDialog.test.tsx` et `NewCraDialog.axe.test.tsx`

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T061/reviews/implementation-review.md
- generated at: 2026-07-29T17:43:03Z

---

I have reviewed all the relevant files. Let me now write the structured review.

---

## PR Review — T061 : Add New CRA period selection dialog

### Résumé

L'implémentation ajoute correctement un bouton « New CRA » dans la navigation, ouvre un dialogue natif `<dialog>` avec deux champs de date, valide la saisie, crée ou réutilise un CRA existant, puis ouvre le calendrier sur le mois de début. Le périmètre est bien respecté.

Deux problèmes sont cependant identifiés : un bug logique sur `selectedPeriod` et une absence totale de tests pour `NewCraDialog`, incompatible avec la convention uniforme du projet.

---

### Vérifications effectuées

- Ticket vs implémentation (tous les acceptance criteria)
- Plan vs code produit (tous les fichiers listés, logique `handleNewCraConfirm`)
- Typage TypeScript (`createCra` retourne `CraDetailsDto`, passé à `handleOpen(CraSummaryDto)` — compatible structurellement ✅)
- Focus management et focus trap (pattern identique à `CraPeriodNavigator` ✅)
- Gestion ESC via `onCancel` natif (pas de `preventDefault`, comportement attendu ✅)
- Cohérence CSS avec les variables design system existantes ✅
- Couverture de tests du projet (`frontend/src/components/**/*.test.*`)

---

### Points validés

- Bouton « New CRA » présent dans `AppShell` sur toutes les vues authentifiées ✅
- Dialogue s'ouvre sans navigation (`showModal()` contrôlé par `open` prop) ✅
- Valeurs par défaut au premier/dernier jour du mois courant ✅
- Validation inline : champs requis + `endDate >= startDate` ✅
- Erreur serveur affichée dans le dialogue via `error` prop + `role="alert"` ✅
- Annulation (bouton Cancel ou ESC) ne crée/modifie aucun CRA ✅
- Retour de focus sur le bouton déclencheur (`newCraTriggerRef`) ✅
- Focus trap sur Tab/Shift+Tab dans le dialogue ✅
- Réutilisation du CRA existant via `listCras()` avant `createCra()` ✅
- Compatibilité future left-sidebar via `onNewCra` prop ✅
- Aucune régression TypeScript signalée ✅

---

### Problèmes détectés

#### 🔴 Bloquant 1 — `selectedPeriod` est systématiquement effacé

**Localisation :** `frontend/src/App.tsx:115-117` et `handleNewCraConfirm` lignes 150–168

**Code problématique :**
```tsx
// App.tsx:115-117
useEffect(() => {
  if (cra === null) setSelectedPeriod(null);
}, [cra]);
```

**Séquence réelle à l'exécution :**
1. `setSelectedPeriod({ startDate, endDate })` — la valeur est posée
2. `handleOpen(existing)` → `loadCra(id)` → `setCra(null)` (synchrone)
3. React batch les setState et rend → `cra === null`
4. L'effet `[cra]` s'exécute → `setSelectedPeriod(null)` — la valeur est effacée
5. `getCra(id)` résout → `setCra(dtoToDetails(dto))` → l'effet se ré-exécute mais `cra !== null`, donc `selectedPeriod` reste `null`

`selectedPeriod` est donc **toujours `null`** une fois le CRA chargé. L'acceptance criterion du plan n'est pas respecté :
> "The flow works for periods spanning multiple months (the CRA is created for the start month; the end-date value is preserved in `selectedPeriod` state)"

**Fix attendu :** Ne pas effacer `selectedPeriod` pendant le chargement. Par exemple, ne le faire qu'en réponse à une action explicite (réinitialisation de session, retour au sélecteur sans CRA actif), séparé du signal de chargement. Une approche simple :

```tsx
// Supprimer l'effet existant et gérer la réinitialisation explicitement
// Par exemple, uniquement dans handleNewCraCancel ou lors d'une déconnexion
```

---

#### 🔴 Bloquant 2 — Absence totale de tests pour `NewCraDialog`

**Convention du projet :** 100 % des composants ont un fichier `.test.tsx`. La quasi-totalité des composants de dialogue ont aussi un `.axe.test.tsx` :
- `CraPeriodNavigator` → `.test.tsx` + `.axe.test.tsx`
- `CraValidation` → `.test.tsx` + `.axe.test.tsx`
- `CraSummaryPanel` → `.test.tsx` + `.axe.test.tsx`
- `ProviderSignatureBox` → `.test.tsx` + `.axe.test.tsx`

`NewCraDialog` n'a ni `.test.tsx` ni `.axe.test.tsx`. Cette absence rompt la convention uniforme et laisse sans couverture la logique de validation, le focus trap, et l'intégration `open`/`close`.

**Tests minimaux attendus :**
- Rendu avec `open=false` (dialog non visible)
- Rendu avec `open=true` (dialog visible)
- Soumission avec champs vides → message d'erreur inline
- Soumission avec `endDate < startDate` → message d'erreur inline
- Soumission valide → `onConfirm` appelé avec les bonnes dates
- Clic Annuler → `onCancel` appelé
- Affichage de `error` prop
- Désactivation inputs/boutons quand `loading=true`
- Test axe (accessibilité) en état ouvert

---

### Risques éventuels

- **Mineur :** `PAGE_TITLES['selector'] = 'New CRA'` dans `AppShell.tsx:16` — le titre de page affiché après confirmation sera "New CRA" même si l'utilisateur a simplement ouvert un CRA existant depuis `CraMonthSelector`. Ce n'était pas le cas avant le changement (`CraMonthSelector` était la page selector ; le titre peut être trompeur).
- **Mineur :** Les valeurs de date ne sont pas réinitialisées à la réouverture du dialogue (si l'utilisateur modifie les dates, annule, puis rouvre). Le ticket ne l'exige pas explicitement, mais peut surprendre.

---

### Décision

Deux corrections requises avant approbation :
1. Corriger le bug `selectedPeriod` (logique de clearing incorrecte)
2. Ajouter les fichiers `NewCraDialog.test.tsx` et `NewCraDialog.axe.test.tsx`

IMPLEMENTATION_FIX_REQUIRED