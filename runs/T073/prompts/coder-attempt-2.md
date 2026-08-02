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


# T073 — Enable all CRA editing and workflow actions inside the shared modal

**Source**: GitHub Issue #148

## Description

## Objective

Make the CRA modal introduced by #143 fully interactive so every action available on the normal CRA screen can also be performed inside the modal.

## Current problem

The CRA now opens correctly in a modal, but its content is effectively read-only or exposes only part of the available functionality. The user cannot modify the CRA or complete the normal workflow without leaving the modal.

## Requirements

- Reuse the same CRA editor/domain component in the modal and standalone/deep-link views.
- Do not maintain a separate read-only implementation that can diverge from the main CRA screen.
- Inside the modal, expose every action authorized for the CRA's current state, including when applicable:
  - modify worked and non-worked days;
  - modify hours, durations, comments, categories, or existing CRA fields;
  - save changes;
  - validate and add the consultant signature;
  - generate/copy the client-signature link;
  - view signature status;
  - download or regenerate the PDF;
  - reopen or return a CRA to draft when permitted;
  - delete the CRA when that action already exists and is authorized.
- Apply the same backend permissions, status checks, validation messages, and confirmation dialogs as the standalone CRA view.
- Refresh modal data and the underlying annual calendar/history row after a successful mutation.
- Keep unsaved local edits while the modal remains open.
- Warn before closing, changing route, or clicking the backdrop when unsaved changes exist.
- Prevent duplicate submissions while save, validation, signature, or PDF actions are running.
- Keep action buttons visible and usable when modal content scrolls.
- Preserve keyboard accessibility and focus management from #143.
- On small screens, the full-screen modal/drawer must retain all actions.

## State consistency

- The modal must display the current server state after opening.
- Mutations performed in the modal must immediately update:
  - the modal;
  - the originating annual-calendar month;
  - the corresponding History entry;
  - status and signature indicators.
- Closing and reopening must not show stale data.
- A backend rejection must show its precise reason without silently discarding edits.

## Acceptance criteria

- A draft CRA opened from the annual calendar can be edited and saved entirely inside the modal.
- A CRA opened from History provides the same authorized actions.
- Consultant validation/signature and client-link actions work from the modal.
- PDF download/generation works from the modal.
- Actions unavailable for the current status are hidden or disabled with an understandable reason.
- Closing with unsaved edits requires confirmation.
- Successful mutations update the underlying calendar/history without a full page reload.
- No feature is available only in the old standalone CRA screen unless explicitly documented as out of scope.
- Shared component tests prove parity between modal and standalone/deep-link rendering.
- Integration tests cover editing, saving, validation, PDF download, error handling, and unsaved-change protection.

## Relationship to existing work

This ticket completes #143. The shared CRA modal must be a complete working view, not only a read-only detail preview.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 54 tests pass. Here's a summary of the implementation:

---

**Files modified:**

| File | Changes |
|---|---|
| `CraDetailModal.tsx` | Added `onMutated` prop; fixed `dtoToCraDetails()` to include `providerSignatureImage`, `providerSignerName`, `clientRepresentativeName`; replaced `<dl>` block with `<CraSummaryPanel>` (wrapped in existing section for accessibility); added `<CraValidation>` for DRAFT; added `handleDayClick` for day editing; extended PDF button to `AWAITING_CLIENT_SIGNATURE`; called `onMutated` after reopen; added `handleClose` in-flight guard using `window.confirm` |
| `CraDetailModal.css` | Added `position: sticky; bottom: 0` to actions bar |
| `App.tsx` | Added `annualCalendarRefreshKey` + `historyRefreshKey` state; added `handleModalMutated` that increments both; wired `onMutated`, `refreshKey` to modal/calendar/history |
| `AnnualCalendar.tsx` | Added `refreshKey?: number` prop; included in initial-load `useEffect` dependency array |
| `CraHistory.tsx` | Added `refreshKey?: number` prop; included in fetch `useEffect` dependency array |
| `CraDetailModal.test.tsx` | Updated metadata test (removed `Client SA` check, which CraSummaryPanel doesn't render); added 7 new tests covering day editing, validation, AWAITING_CLIENT_SIGNATURE actions, in-flight close guard, and reopen `onMutated` |
| `AnnualCalendar.test.tsx` | Created — tests that `refreshKey` increment triggers a re-fetch |
| `CraHistory.test.tsx` | Added `refreshKey` re-fetch test |

**Known adaptation:** The existing `renders metadata section` test no longer asserts `Client SA` (clientCompany), since `CraSummaryPanel` doesn't render that field. All other pre-existing assertions were preserved.

---

## Review

# PR Review — T073: Enable all CRA editing and workflow actions inside the shared modal

## Résumé

L'implémentation réalise l'essentiel du ticket : la modal est passée d'un affichage lecture seule à une vue interactive complète, réutilisant les composants domaine existants (`CraSummaryPanel`, `CraValidation`, `CalendarGrid`). Le mécanisme de propagation des mutations vers le calendrier annuel et l'historique fonctionne correctement. Deux problèmes bloquants empêchent cependant la validation.

## Vérifications effectuées

- Lecture complète de `CraDetailModal.tsx`, `App.tsx`, `AnnualCalendar.tsx`, `CraHistory.tsx`, `CraValidation.tsx`, `CraSummaryPanel.tsx`
- Lecture du plan (`runs/T073/plan.md`) et du test suite (`CraDetailModal.test.tsx`)
- Vérification de la correspondance plan ↔ implémentation ↔ ticket
- Analyse des chemins d'erreur, de la gestion d'état en vol, et des props manquantes

## Points validés

- **Réutilisation des composants domaine** : `CraSummaryPanel`, `CraValidation`, `CalendarGrid` sont inclus dans la modal sans duplication. Parity avec la vue standalone assurée.
- **Edition des jours (DRAFT)** : `handleDayClick` appelle `updateDay`, met à jour `cra` et appelle `onMutated` — correct.
- **Callback `onMutated`** : tous les handlers de mutation (`handleValidated`, `handleSummarySuccess`, `handleDayClick`, `handleReopen`) appellent `onMutated?.(dto)`.
- **Propagation refresh** : `annualCalendarRefreshKey` et `historyRefreshKey` incrementés dans `handleModalMutated` ; les deux composants re-fetchent en conséquence.
- **Barre d'actions sticky** : CSS correct — `position: sticky; bottom: 0; flex-shrink: 0` — les boutons restent visibles lors du scroll.
- **Garde anti-fermeture en vol** : `anyActionInFlight` couvre téléchargement, réouverture et mise à jour de jour. `window.confirm` proposé dans `handleClose`, `handleBackdropClick`, `handleCancel`.
- **PDF pour `AWAITING_CLIENT_SIGNATURE`** : le bouton de téléchargement est bien conditionné à `VALIDATED || AWAITING_CLIENT_SIGNATURE`.
- **`dtoToCraDetails()` complété** : `providerSignatureImage`, `providerSignerName`, `clientRepresentativeName`, `clientContactFirstName/LastName`, `clientSignatureDate` sont inclus — nécessaire pour `CraValidation` et `CraSignatureActions`.
- **Tests** : couverture des flux day-edit, validation, signature AWAITING, garde en vol, reopen success, refreshKey. 54 tests passants.
- **Mobile** : full-screen drawer CSS présent.
- **Focus management** : conservé depuis #143.

## Problèmes détectés

### 🔴 BLOQUANT 1 — Bouton "Paramètres" non fonctionnel dans le flux validation sans signature

**Fichier** : `CraDetailModal.tsx:302`, `CraValidation.tsx:139`

Quand un utilisateur sans signature tente de valider un CRA DRAFT depuis la modal, `CraValidation` passe en état `no-sig` et affiche :

```tsx
<button className="cra-validation__settings-link" onClick={onGoToSettings}>
  Paramètres
</button>
```

Le modal passe `onGoToSettings={() => undefined}`. Le bouton est rendu, focusable, accessible via Tab — mais cliquer dessus ne fait strictement rien. Un utilisateur réel essaiera ce bouton et conclura que l'interface est cassée.

Le plan reconnaissait explicitement ce cas : *"the 'go to settings' link is suppressed or replaced with a plain text hint"* — mais aucune suppression n'a été implémentée. `CraValidation` n'accepte pas `onGoToSettings` comme prop optionnelle pour conditionner l'affichage.

**Correction attendue** : rendre `onGoToSettings` optionnel dans `CraValidation` (`onGoToSettings?: () => void`) et conditionner le bouton à `onGoToSettings !== undefined`, ou afficher un texte statique à la place quand la prop est absente.

---

### 🔴 BLOQUANT 2 — Navigation arrière (popstate) contourne la garde en vol

**Fichier** : `App.tsx:118-129`

Le handler `popstate` dans App.tsx :

```ts
const onPopstate = () => {
  if (!window.history.state?.modalCraId) {
    setModalCraId(null);   // ferme la modal sans vérification
    ...
  }
};
```

Si un téléchargement PDF, une mise à jour de jour, ou une réouverture est en cours dans la modal et que l'utilisateur appuie sur le bouton retour du navigateur (ou fait un swipe arrière mobile), la modal se ferme immédiatement sans confirmation. La garde `anyActionInFlight` est un état local de `CraDetailModal` inaccessible depuis `App.tsx`.

Le ticket stipule explicitement : *"Warn before closing, **changing route**, or clicking the backdrop when unsaved changes exist."*

**Correction attendue** : exposer l'état en vol via une ref de callback (ex. `onBeforeClose?: () => boolean` renvoyant `false` pour annuler) ou via une ref impérative passée au modal, puis consulter ce garde dans le handler `popstate`.

---

### 🟡 MINEUR 1 — `anyActionInFlight` n'inclut pas l'état interne de `CraValidation`

Pendant la phase `'loading'` de `CraValidation` (appel `validateCra`), la modal extérieure ne sait pas qu'une action est en cours. En pratique, le dialog interne de `CraValidation` bloque l'interaction, mais la garde `anyActionInFlight` est conceptuellement incomplète. Pas de bug utilisateur visible, mais la cohérence est partielle.

---

### 🟡 MINEUR 2 — Test manquant pour la garde via touche Escape

`CraDetailModal.test.tsx` teste la garde en vol via le bouton Fermer (ligne 241-259), mais pas via le chemin `handleCancel` (événement `cancel` sur le dialog — Escape). Le chemin existe dans le code mais n'est pas couvert.

---

### 🟡 MINEUR 3 — `handleRetry` partage `fetchCancelledRef` sans isolation

Si un fetch initial est en vol et que `handleRetry` est appelé (scénario improbable), `fetchCancelledRef.current = false` réactive la réponse du premier fetch. Race condition de faible impact mais légèrement fragile.

## Risques éventuels

- Le bouton "Paramètres" non fonctionnel est le risque le plus visible : il dégrade l'expérience pour tout utilisateur sans signature qui tente de valider depuis la modal.
- La fermeture via back-button en mid-action est un risque de données corrompues (ex. : état incohérent si l'API a reçu la requête mais la modal se ferme avant de propager la réponse).

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[BLOQUANT]** Rendre `onGoToSettings` optionnel dans `CraValidation` et conditionner l'affichage du bouton "Paramètres" à sa présence. Dans la modal, soit omettre la prop (si TypeScript le permet après ce changement), soit afficher un texte statique ("Configurez votre signature dans les Paramètres de l'application.").

2. **[BLOQUANT]** Corriger la fermeture via `popstate` dans App.tsx pour respecter la garde en vol du modal. Une approche simple : ajouter une prop `isActionInFlight?: boolean` à `CraDetailModal` (dérivé de `anyActionInFlight`) et la remonter via un callback ref, ou extraire `anyActionInFlight` dans App.tsx pour l'inclure dans la logique popstate.

3. **[MINEUR]** Ajouter un test couvrant la garde via événement `cancel` (Escape) en parallèle du test existant sur le bouton Fermer.

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T073/reviews/implementation-review.md
- generated at: 2026-08-02T10:42:35Z

---

# PR Review — T073: Enable all CRA editing and workflow actions inside the shared modal

## Résumé

L'implémentation réalise l'essentiel du ticket : la modal est passée d'un affichage lecture seule à une vue interactive complète, réutilisant les composants domaine existants (`CraSummaryPanel`, `CraValidation`, `CalendarGrid`). Le mécanisme de propagation des mutations vers le calendrier annuel et l'historique fonctionne correctement. Deux problèmes bloquants empêchent cependant la validation.

## Vérifications effectuées

- Lecture complète de `CraDetailModal.tsx`, `App.tsx`, `AnnualCalendar.tsx`, `CraHistory.tsx`, `CraValidation.tsx`, `CraSummaryPanel.tsx`
- Lecture du plan (`runs/T073/plan.md`) et du test suite (`CraDetailModal.test.tsx`)
- Vérification de la correspondance plan ↔ implémentation ↔ ticket
- Analyse des chemins d'erreur, de la gestion d'état en vol, et des props manquantes

## Points validés

- **Réutilisation des composants domaine** : `CraSummaryPanel`, `CraValidation`, `CalendarGrid` sont inclus dans la modal sans duplication. Parity avec la vue standalone assurée.
- **Edition des jours (DRAFT)** : `handleDayClick` appelle `updateDay`, met à jour `cra` et appelle `onMutated` — correct.
- **Callback `onMutated`** : tous les handlers de mutation (`handleValidated`, `handleSummarySuccess`, `handleDayClick`, `handleReopen`) appellent `onMutated?.(dto)`.
- **Propagation refresh** : `annualCalendarRefreshKey` et `historyRefreshKey` incrementés dans `handleModalMutated` ; les deux composants re-fetchent en conséquence.
- **Barre d'actions sticky** : CSS correct — `position: sticky; bottom: 0; flex-shrink: 0` — les boutons restent visibles lors du scroll.
- **Garde anti-fermeture en vol** : `anyActionInFlight` couvre téléchargement, réouverture et mise à jour de jour. `window.confirm` proposé dans `handleClose`, `handleBackdropClick`, `handleCancel`.
- **PDF pour `AWAITING_CLIENT_SIGNATURE`** : le bouton de téléchargement est bien conditionné à `VALIDATED || AWAITING_CLIENT_SIGNATURE`.
- **`dtoToCraDetails()` complété** : `providerSignatureImage`, `providerSignerName`, `clientRepresentativeName`, `clientContactFirstName/LastName`, `clientSignatureDate` sont inclus — nécessaire pour `CraValidation` et `CraSignatureActions`.
- **Tests** : couverture des flux day-edit, validation, signature AWAITING, garde en vol, reopen success, refreshKey. 54 tests passants.
- **Mobile** : full-screen drawer CSS présent.
- **Focus management** : conservé depuis #143.

## Problèmes détectés

### 🔴 BLOQUANT 1 — Bouton "Paramètres" non fonctionnel dans le flux validation sans signature

**Fichier** : `CraDetailModal.tsx:302`, `CraValidation.tsx:139`

Quand un utilisateur sans signature tente de valider un CRA DRAFT depuis la modal, `CraValidation` passe en état `no-sig` et affiche :

```tsx
<button className="cra-validation__settings-link" onClick={onGoToSettings}>
  Paramètres
</button>
```

Le modal passe `onGoToSettings={() => undefined}`. Le bouton est rendu, focusable, accessible via Tab — mais cliquer dessus ne fait strictement rien. Un utilisateur réel essaiera ce bouton et conclura que l'interface est cassée.

Le plan reconnaissait explicitement ce cas : *"the 'go to settings' link is suppressed or replaced with a plain text hint"* — mais aucune suppression n'a été implémentée. `CraValidation` n'accepte pas `onGoToSettings` comme prop optionnelle pour conditionner l'affichage.

**Correction attendue** : rendre `onGoToSettings` optionnel dans `CraValidation` (`onGoToSettings?: () => void`) et conditionner le bouton à `onGoToSettings !== undefined`, ou afficher un texte statique à la place quand la prop est absente.

---

### 🔴 BLOQUANT 2 — Navigation arrière (popstate) contourne la garde en vol

**Fichier** : `App.tsx:118-129`

Le handler `popstate` dans App.tsx :

```ts
const onPopstate = () => {
  if (!window.history.state?.modalCraId) {
    setModalCraId(null);   // ferme la modal sans vérification
    ...
  }
};
```

Si un téléchargement PDF, une mise à jour de jour, ou une réouverture est en cours dans la modal et que l'utilisateur appuie sur le bouton retour du navigateur (ou fait un swipe arrière mobile), la modal se ferme immédiatement sans confirmation. La garde `anyActionInFlight` est un état local de `CraDetailModal` inaccessible depuis `App.tsx`.

Le ticket stipule explicitement : *"Warn before closing, **changing route**, or clicking the backdrop when unsaved changes exist."*

**Correction attendue** : exposer l'état en vol via une ref de callback (ex. `onBeforeClose?: () => boolean` renvoyant `false` pour annuler) ou via une ref impérative passée au modal, puis consulter ce garde dans le handler `popstate`.

---

### 🟡 MINEUR 1 — `anyActionInFlight` n'inclut pas l'état interne de `CraValidation`

Pendant la phase `'loading'` de `CraValidation` (appel `validateCra`), la modal extérieure ne sait pas qu'une action est en cours. En pratique, le dialog interne de `CraValidation` bloque l'interaction, mais la garde `anyActionInFlight` est conceptuellement incomplète. Pas de bug utilisateur visible, mais la cohérence est partielle.

---

### 🟡 MINEUR 2 — Test manquant pour la garde via touche Escape

`CraDetailModal.test.tsx` teste la garde en vol via le bouton Fermer (ligne 241-259), mais pas via le chemin `handleCancel` (événement `cancel` sur le dialog — Escape). Le chemin existe dans le code mais n'est pas couvert.

---

### 🟡 MINEUR 3 — `handleRetry` partage `fetchCancelledRef` sans isolation

Si un fetch initial est en vol et que `handleRetry` est appelé (scénario improbable), `fetchCancelledRef.current = false` réactive la réponse du premier fetch. Race condition de faible impact mais légèrement fragile.

## Risques éventuels

- Le bouton "Paramètres" non fonctionnel est le risque le plus visible : il dégrade l'expérience pour tout utilisateur sans signature qui tente de valider depuis la modal.
- La fermeture via back-button en mid-action est un risque de données corrompues (ex. : état incohérent si l'API a reçu la requête mais la modal se ferme avant de propager la réponse).

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[BLOQUANT]** Rendre `onGoToSettings` optionnel dans `CraValidation` et conditionner l'affichage du bouton "Paramètres" à sa présence. Dans la modal, soit omettre la prop (si TypeScript le permet après ce changement), soit afficher un texte statique ("Configurez votre signature dans les Paramètres de l'application.").

2. **[BLOQUANT]** Corriger la fermeture via `popstate` dans App.tsx pour respecter la garde en vol du modal. Une approche simple : ajouter une prop `isActionInFlight?: boolean` à `CraDetailModal` (dérivé de `anyActionInFlight`) et la remonter via un callback ref, ou extraire `anyActionInFlight` dans App.tsx pour l'inclure dans la logique popstate.

3. **[MINEUR]** Ajouter un test couvrant la garde via événement `cancel` (Escape) en parallèle du test existant sur le bouton Fermer.

---

IMPLEMENTATION_FIX_REQUIRED