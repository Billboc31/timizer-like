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


# T072 — Open CRA details in a shared modal from calendar and history

**Source**: GitHub Issue #143

## Description

## Objective

Open CRA details consistently in a dismissible modal or floating window from both the annual calendar and the history view.

## Current problems

- Clicking a month in the annual calendar navigates into that month's CRA and exposes previous/next CRA navigation at the top, which is unnecessary for this interaction.
- Opening a CRA from History renders the detail underneath the history content instead of as a focused overlay.
- The two entry points use inconsistent presentation and make it difficult to return to the overview.

## Desired behavior

- Clicking a month opens that month's CRA above the annual calendar in a modal or floating detail window.
- Clicking a CRA in History opens the selected CRA through the same reusable modal/floating component.
- The underlying annual calendar or history view remains mounted and visually in place.
- The selected CRA can be closed with:
  - a visible close `×` button;
  - the `Escape` key;
  - browser back when the modal state is represented in the URL;
  - backdrop click only if it cannot discard unsaved changes unexpectedly.
- Remove previous/next CRA navigation from this overlay workflow. The user returns to the overview and selects another CRA.

## Requirements

### Shared CRA overlay

- Create one reusable CRA detail overlay used by calendar and history entry points.
- Display the complete CRA detail and authorized actions without rendering it below the page.
- Preserve the originating view, filters, scroll position, selected year, and history pagination when the overlay closes.
- Prevent background interaction and scrolling while a modal overlay is active.
- Keep header and close controls visible when CRA content scrolls.
- Define a sensible maximum width/height and internal scrolling.
- Use a full-screen dialog or drawer adaptation on small screens.

### Routing and state

- Support direct/deep links to a CRA where existing routes require them.
- Opening and closing the overlay must behave predictably with browser back/forward.
- Refreshing a deep-linked CRA must either restore the overlay over its parent view or show an equivalent standalone detail page with an obvious close/home route.
- Avoid duplicate CRA fetches and stale content when selecting multiple records successively.

### Unsaved changes and accessibility

- If the CRA is editable and contains unsaved changes, closing must request confirmation.
- Focus must move into the dialog when opened and return to the triggering month/history row when closed.
- Use accessible dialog semantics, labelled title, focus trap, and keyboard-operable controls.
- The close button must have an explicit accessible label.

## Acceptance criteria

- Clicking a month opens the corresponding CRA in a modal/floating overlay.
- The annual calendar remains behind the overlay and is restored unchanged on close.
- Clicking a CRA in History uses the same overlay and does not append content below the list.
- No previous/next CRA navigation is displayed in the overlay.
- The overlay closes using the visible cross and Escape.
- Browser back closes an opened overlay without unexpectedly leaving the originating page.
- Closing restores filters, year, scroll position, and keyboard focus.
- Unsaved changes cannot be discarded silently.
- Desktop, tablet, and mobile layouts are usable.
- Automated tests cover both calendar and history entry points, close methods, browser navigation, focus restoration, and unsaved-change protection.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 298 tests pass. Here's a summary of what was implemented:

---

## Files changed

### Created
- **`frontend/src/components/CraDetailModal/CraDetailModal.tsx`** — Reusable modal using native `<dialog>`. Accepts `craId: number | null` and `onClose: () => void`. Fetches the CRA internally, renders the detail content (period, metadata grid, calendar), and exposes Download PDF + Reopen actions. Close triggers: × button, Escape key (`onCancel`), backdrop click. Focus moves to the close button on open. Focus trap via `onKeyDown`. Prevents body scroll while open.

- **`frontend/src/components/CraDetailModal/CraDetailModal.css`** — Max-width 720px, max-height 90vh, sticky header, scrollable body, actions bar. Full-screen drawer on `≤640px`.

- **`frontend/src/components/CraDetailModal/CraDetailModal.test.tsx`** — 20 tests covering: visibility (null/non-null), content rendering, actions (download, reopen), all close triggers (× button, Escape, backdrop, no close on content click), accessibility attributes, and both entry point simulations.

### Modified
- **`frontend/src/App.tsx`** — Removed `type View = AppView | 'history-detail'` extension and the `historyDetailId` state. Added `modalCraId`, `modalTriggerRef`, `modalPushedState`. Added `handleOpenModal` (used for both calendar and history entry points), `handleModalClose` (sets `null`, calls `history.back()` if we pushed, restores focus), and a `popstate` listener for browser-back close. `onOpenCra` (calendar) and `onOpenDetail` (history) both now route to `handleOpenModal`. Renders `<CraDetailModal>` unconditionally at the bottom of the shell. Deep-link restore: reads `?cra=` from `window.location.search` on initial render.

- **`frontend/src/App.test.tsx`** — Updated D2 tests to expect a modal (Fermer button) instead of a full-page detail view (Retour button). Updated D1 tests to expect the modal's loading skeleton and error alert instead of `CraSummaryPanel`'s `data-testid` elements. Added `window.history.replaceState(null, '', '/')` in `afterEach` to prevent URL state leaking across tests.

---

## Review

I now have all the information needed to write the review.

---

# PR Review — T072 · Open CRA details in a shared modal

## Résumé

L'implémentation produit un composant `CraDetailModal` basé sur l'élément natif `<dialog>`, correctement intégré depuis les deux points d'entrée (calendrier annuel et historique). La logique principale (routing URL, browser back, focus trap, scroll lock, responsive) est fonctionnelle et respecte l'architecture définie dans le plan.

Un seul ensemble de problèmes bloquants est identifié : des tests automatisés explicitement requis par les critères d'acceptance sont absents.

---

## Vérifications effectuées

- Lecture complète de `CraDetailModal.tsx`, `CraDetailModal.css`, `CraDetailModal.test.tsx`
- Lecture de `App.tsx` (modifications du routing modal)
- Lecture de `App.test.tsx` (tests d'intégration)
- Lecture de `AppShell.tsx` (suppression de `'history-detail'`)
- Lecture de `api/types.ts` (vérification de `CraDetailsDto`)
- Vérification croisée avec le plan et les critères d'acceptance du ticket

---

## Points validés

**Composant modal**
- Native `<dialog>` avec `showModal()` / `close()` — cohérent avec le pattern `NewCraDialog` existant.
- `aria-modal="true"`, `aria-labelledby` sur le titre, label `"Fermer"` sur le bouton ×.
- Focus trap Tab/Shift+Tab via `onKeyDown`.
- Focus déplacé sur le bouton de fermeture à l'ouverture (`closeButtonRef.current?.focus()`).
- Scroll lock sur `document.body` avec cleanup correct dans `useEffect`.
- Fermeture : bouton ×, Escape (`onCancel`), backdrop click (`e.target === dialogRef.current`).
- Header sticky, body scrollable, barre d'actions sticky en bas.
- Breakpoint `≤640px` → full-screen drawer.

**Routing et état**
- `pushState({ modalCraId }, '', '?cra=<id>')` à l'ouverture, `history.back()` / `replaceState` à la fermeture.
- Listener `popstate` : ferme la modal et restaure le focus si le browser back est utilisé sans passer par le bouton ×.
- Deep-link initial : lecture de `?cra=` dans le lazy initializer du `useState` — la vue parente reste montée.
- `modalPushedState.current` correctement géré pour distinguer deep-link initial vs navigation pushée.
- `'history-detail'` supprimé de `AppView` dans `AppShell.tsx` ✅

**Fetch**
- Cancellation token (`cancelled = true` dans le cleanup) pour la requête principale.
- Bouton "Réessayer" fonctionnel.
- Aucune navigation nav précédent/suivant dans la modal ✅

**Tests unitaires (20 tests)**
- Visibilité (null/non-null craId), contenu, actions download/reopen, tous les déclencheurs de fermeture (×, Escape, backdrop, non-fermeture sur le contenu), attributs d'accessibilité, simulation des deux points d'entrée.

---

## Problèmes détectés

### 🔴 Bloquant 1 — Test de navigation browser manquant

Le critère d'acceptance du ticket dit explicitement :

> Automated tests cover both calendar and history entry points, **close methods, browser navigation**, focus restoration, and unsaved-change protection.

Ni `CraDetailModal.test.tsx` ni `App.test.tsx` ne contiennent de test qui :
- Simule un événement `popstate` (ou `window.history.back()`) et vérifie que la modal se ferme sans quitter la vue parente.

Le code est correct (listener `popstate` dans `App.tsx`), mais ce comportement n'est pas couvert par les tests automatisés requis.

**Fix attendu** : ajouter un test dans `App.test.tsx` qui :
1. Ouvre la modal depuis le calendrier ou l'historique.
2. Simule `window.dispatchEvent(new PopStateEvent('popstate', { state: null }))`.
3. Vérifie que `dialog[open]` n'est plus présent et que la vue parente est toujours affichée.

---

### 🔴 Bloquant 2 — Test de restauration du focus manquant

Le même critère d'acceptance cite **focus restoration** comme cas de test obligatoire.

Aucun test ne vérifie que le focus revient à l'élément déclencheur après fermeture. `handleModalClose` et le handler `popstate` appellent bien `modalTriggerRef.current?.focus()`, mais ce comportement n'est pas testé.

**Fix attendu** : ajouter un test dans `App.test.tsx` qui :
1. Détermine ou mock l'élément trigger (carte mois ou bouton "Open CRA").
2. Ouvre puis ferme la modal.
3. Vérifie que `document.activeElement` correspond au trigger (ou à l'élément qui avait le focus avant l'ouverture).

---

### 🟡 Mineur 1 — `handleRetry` sans annulation

```tsx
// CraDetailModal.tsx:123-129
const handleRetry = () => {
  if (craId === null) return;
  setLoading(true);
  getCra(craId)
    .then(dto => { setCra(dto); setLoading(false); })
    ...
};
```

Contrairement au `useEffect` principal (qui utilise `cancelled = true`), `handleRetry` ne dispose pas de token d'annulation. Si l'utilisateur ferme la modal pendant un retry en cours, le callback `then` tente quand même un `setState`. En React 18 ce n'est pas une erreur, mais c'est incohérent avec le pattern utilisé ailleurs dans le même fichier.

Pas bloquant, mais à corriger si possible.

---

### 🟡 Mineur 2 — Deep-link avec valeur non numérique

```tsx
// App.tsx:45-49
const [modalCraId, setModalCraId] = useState<number | null>(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('cra');
  return id ? Number(id) : null;  // Number('abc') === NaN
});
```

`Number('abc')` retourne `NaN`. Si l'URL est malformée (`?cra=abc`), `getCra(NaN)` sera appelé. Robustesse à améliorer : `const n = parseInt(id, 10); return isNaN(n) ? null : n`.

---

### 🟡 Mineur 3 — `dtoToCraDetails` dupliqué

La fonction de conversion DTO → `CraDetails` existe dans `CraDetailModal.tsx` (l. 33) et dans `App.tsx` (l. 23 sous le nom `dtoToDetails`). Les deux ne mappent pas exactement les mêmes champs (`providerSignatureImage`, `providerSignerName` absents dans la version modale). Pas un bug — le modal n'en a pas besoin pour `CalendarGrid`. Mais c'est une dette à résoudre hors scope de ce ticket.

---

## Risques éventuels

- **Double appel `setModalCraId(null)`** quand `handleModalClose` est déclenché par le bouton × puis `popstate` se déclenche ensuite : sans impact (le second appel est idempotent). ✅
- **Focus capturé via `document.activeElement`** dans `handleOpenModal` : fonctionne pour les interactions clavier (l'élément cliqué est bien focused) mais peut être `null` ou `body` pour certaines interactions souris sur des éléments non focusables. Mineur.
- **`TITLE_ID` constant partagé** : si deux instances étaient montées, il y aurait des IDs dupliqués. Pas de risque dans l'usage actuel (une seule instance rendue dans `App.tsx`).

---

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[Bloquant]** Ajouter dans `App.test.tsx` un test couvrant la fermeture par browser back via un événement `popstate` simulé.
2. **[Bloquant]** Ajouter dans `App.test.tsx` un test vérifiant que le focus revient au trigger d'ouverture après fermeture de la modal.
3. **[Mineur, optionnel dans ce ticket]** Corriger le parsing deep-link avec `parseInt` pour éviter `NaN`.
4. **[Mineur, optionnel dans ce ticket]** Ajouter un token d'annulation dans `handleRetry`.

---

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T072/reviews/implementation-review.md
- generated at: 2026-08-02T00:00:16Z

---

I now have all the information needed to write the review.

---

# PR Review — T072 · Open CRA details in a shared modal

## Résumé

L'implémentation produit un composant `CraDetailModal` basé sur l'élément natif `<dialog>`, correctement intégré depuis les deux points d'entrée (calendrier annuel et historique). La logique principale (routing URL, browser back, focus trap, scroll lock, responsive) est fonctionnelle et respecte l'architecture définie dans le plan.

Un seul ensemble de problèmes bloquants est identifié : des tests automatisés explicitement requis par les critères d'acceptance sont absents.

---

## Vérifications effectuées

- Lecture complète de `CraDetailModal.tsx`, `CraDetailModal.css`, `CraDetailModal.test.tsx`
- Lecture de `App.tsx` (modifications du routing modal)
- Lecture de `App.test.tsx` (tests d'intégration)
- Lecture de `AppShell.tsx` (suppression de `'history-detail'`)
- Lecture de `api/types.ts` (vérification de `CraDetailsDto`)
- Vérification croisée avec le plan et les critères d'acceptance du ticket

---

## Points validés

**Composant modal**
- Native `<dialog>` avec `showModal()` / `close()` — cohérent avec le pattern `NewCraDialog` existant.
- `aria-modal="true"`, `aria-labelledby` sur le titre, label `"Fermer"` sur le bouton ×.
- Focus trap Tab/Shift+Tab via `onKeyDown`.
- Focus déplacé sur le bouton de fermeture à l'ouverture (`closeButtonRef.current?.focus()`).
- Scroll lock sur `document.body` avec cleanup correct dans `useEffect`.
- Fermeture : bouton ×, Escape (`onCancel`), backdrop click (`e.target === dialogRef.current`).
- Header sticky, body scrollable, barre d'actions sticky en bas.
- Breakpoint `≤640px` → full-screen drawer.

**Routing et état**
- `pushState({ modalCraId }, '', '?cra=<id>')` à l'ouverture, `history.back()` / `replaceState` à la fermeture.
- Listener `popstate` : ferme la modal et restaure le focus si le browser back est utilisé sans passer par le bouton ×.
- Deep-link initial : lecture de `?cra=` dans le lazy initializer du `useState` — la vue parente reste montée.
- `modalPushedState.current` correctement géré pour distinguer deep-link initial vs navigation pushée.
- `'history-detail'` supprimé de `AppView` dans `AppShell.tsx` ✅

**Fetch**
- Cancellation token (`cancelled = true` dans le cleanup) pour la requête principale.
- Bouton "Réessayer" fonctionnel.
- Aucune navigation nav précédent/suivant dans la modal ✅

**Tests unitaires (20 tests)**
- Visibilité (null/non-null craId), contenu, actions download/reopen, tous les déclencheurs de fermeture (×, Escape, backdrop, non-fermeture sur le contenu), attributs d'accessibilité, simulation des deux points d'entrée.

---

## Problèmes détectés

### 🔴 Bloquant 1 — Test de navigation browser manquant

Le critère d'acceptance du ticket dit explicitement :

> Automated tests cover both calendar and history entry points, **close methods, browser navigation**, focus restoration, and unsaved-change protection.

Ni `CraDetailModal.test.tsx` ni `App.test.tsx` ne contiennent de test qui :
- Simule un événement `popstate` (ou `window.history.back()`) et vérifie que la modal se ferme sans quitter la vue parente.

Le code est correct (listener `popstate` dans `App.tsx`), mais ce comportement n'est pas couvert par les tests automatisés requis.

**Fix attendu** : ajouter un test dans `App.test.tsx` qui :
1. Ouvre la modal depuis le calendrier ou l'historique.
2. Simule `window.dispatchEvent(new PopStateEvent('popstate', { state: null }))`.
3. Vérifie que `dialog[open]` n'est plus présent et que la vue parente est toujours affichée.

---

### 🔴 Bloquant 2 — Test de restauration du focus manquant

Le même critère d'acceptance cite **focus restoration** comme cas de test obligatoire.

Aucun test ne vérifie que le focus revient à l'élément déclencheur après fermeture. `handleModalClose` et le handler `popstate` appellent bien `modalTriggerRef.current?.focus()`, mais ce comportement n'est pas testé.

**Fix attendu** : ajouter un test dans `App.test.tsx` qui :
1. Détermine ou mock l'élément trigger (carte mois ou bouton "Open CRA").
2. Ouvre puis ferme la modal.
3. Vérifie que `document.activeElement` correspond au trigger (ou à l'élément qui avait le focus avant l'ouverture).

---

### 🟡 Mineur 1 — `handleRetry` sans annulation

```tsx
// CraDetailModal.tsx:123-129
const handleRetry = () => {
  if (craId === null) return;
  setLoading(true);
  getCra(craId)
    .then(dto => { setCra(dto); setLoading(false); })
    ...
};
```

Contrairement au `useEffect` principal (qui utilise `cancelled = true`), `handleRetry` ne dispose pas de token d'annulation. Si l'utilisateur ferme la modal pendant un retry en cours, le callback `then` tente quand même un `setState`. En React 18 ce n'est pas une erreur, mais c'est incohérent avec le pattern utilisé ailleurs dans le même fichier.

Pas bloquant, mais à corriger si possible.

---

### 🟡 Mineur 2 — Deep-link avec valeur non numérique

```tsx
// App.tsx:45-49
const [modalCraId, setModalCraId] = useState<number | null>(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('cra');
  return id ? Number(id) : null;  // Number('abc') === NaN
});
```

`Number('abc')` retourne `NaN`. Si l'URL est malformée (`?cra=abc`), `getCra(NaN)` sera appelé. Robustesse à améliorer : `const n = parseInt(id, 10); return isNaN(n) ? null : n`.

---

### 🟡 Mineur 3 — `dtoToCraDetails` dupliqué

La fonction de conversion DTO → `CraDetails` existe dans `CraDetailModal.tsx` (l. 33) et dans `App.tsx` (l. 23 sous le nom `dtoToDetails`). Les deux ne mappent pas exactement les mêmes champs (`providerSignatureImage`, `providerSignerName` absents dans la version modale). Pas un bug — le modal n'en a pas besoin pour `CalendarGrid`. Mais c'est une dette à résoudre hors scope de ce ticket.

---

## Risques éventuels

- **Double appel `setModalCraId(null)`** quand `handleModalClose` est déclenché par le bouton × puis `popstate` se déclenche ensuite : sans impact (le second appel est idempotent). ✅
- **Focus capturé via `document.activeElement`** dans `handleOpenModal` : fonctionne pour les interactions clavier (l'élément cliqué est bien focused) mais peut être `null` ou `body` pour certaines interactions souris sur des éléments non focusables. Mineur.
- **`TITLE_ID` constant partagé** : si deux instances étaient montées, il y aurait des IDs dupliqués. Pas de risque dans l'usage actuel (une seule instance rendue dans `App.tsx`).

---

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[Bloquant]** Ajouter dans `App.test.tsx` un test couvrant la fermeture par browser back via un événement `popstate` simulé.
2. **[Bloquant]** Ajouter dans `App.test.tsx` un test vérifiant que le focus revient au trigger d'ouverture après fermeture de la modal.
3. **[Mineur, optionnel dans ce ticket]** Corriger le parsing deep-link avec `parseInt` pour éviter `NaN`.
4. **[Mineur, optionnel dans ce ticket]** Ajouter un token d'annulation dans `handleRetry`.

---

IMPLEMENTATION_FIX_REQUIRED