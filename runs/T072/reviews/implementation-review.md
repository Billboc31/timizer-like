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
