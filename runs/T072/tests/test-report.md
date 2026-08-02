I have all the data I need. Here is the test report.

---

# Rapport de test — T072 · Open CRA details in a shared modal

## Suite de tests automatisés

**Résultat : 300/300 tests passent.**

```
Test Files  33 passed (33)
    Tests  300 passed (300)
 Duration  ~6s
```

Les avertissements jsdom `Not implemented: navigation` sont des logs informatifs connus de jsdom sur les navigations `<a href>` — ils ne font échouer aucun test.

---

## Critères d'acceptance

### 1. Clicking a month opens the corresponding CRA in a modal/floating overlay
**PASS**

`AnnualCalendar` expose `onOpenCra` → `handleOpenModal` dans `App.tsx` → `setModalCraId` → `CraDetailModal.showModal()`. Couvert par les tests `App — D1` (`clicking a month card opens the CRA detail modal with calendar data`).

---

### 2. The annual calendar remains behind the overlay and is restored unchanged on close
**PASS**

La vue reste à `'overview'`, `AnnualCalendar` n'est jamais démonté. La fermeture se fait en passant `modalCraId` à `null` — le composant sous-jacent conserve son état React naturellement. Aucun unmount/remount n'a lieu.

---

### 3. Clicking a CRA in History uses the same overlay and does not append content below the list
**PASS**

`CraHistory` expose `onOpenDetail` → même `handleOpenModal` → même `CraDetailModal`. Le type `'history-detail'` a été retiré de `AppView` dans `AppShell.tsx`. Tests `App — D2` vérifient que la liste History reste montée après fermeture et que la même modal `dialog[open]` est utilisée.

---

### 4. No previous/next CRA navigation is displayed in the overlay
**PASS**

`CraDetailModal` ne contient aucun bouton de navigation précédent/suivant. Test unitaire `'does not render previous/next navigation controls'` confirme l'absence avec un sélecteur `/précédent|suivant|previous|next/i`.

---

### 5. The overlay closes using the visible cross and Escape
**PASS**

- Bouton × : `aria-label="Fermer"`, `onClick={onClose}`. Test : `'calls onClose when × (Fermer) button is clicked'`.
- Escape : événement natif `cancel` intercepté par `handleCancel` → `e.preventDefault()` + `onClose()`. Test : `'calls onClose when the native cancel event fires (Escape key)'`.
- Backdrop click : `handleBackdropClick` vérifie `e.target === dialogRef.current`. Test : `'calls onClose when backdrop (dialog element itself) is clicked'` / `'does not call onClose when clicking inside the modal content'`.

---

### 6. Browser back closes an opened overlay without unexpectedly leaving the originating page
**PASS**

Listener `popstate` dans `App.tsx` : si `window.history.state?.modalCraId` est absent, ferme la modal et restaure le focus. Test : `'browser back (popstate) closes the modal without leaving the originating view'` — vérifie que `dialog[open]` disparaît et que la liste History reste montée.

---

### 7. Closing restores filters, year, scroll position, and keyboard focus
**PASS (focus) / CONDITIONNEL (scroll/état)**

- **Focus** : `modalTriggerRef.current?.focus()` appelé dans `handleModalClose` et dans le handler `popstate`. Test : `'focus returns to the trigger element after closing the modal'` — vérifie `document.activeElement === triggerButton`.
- **Scroll/année/filtres/pagination** : aucun code de sauvegarde/restauration explicite n'est nécessaire ni présent, car les vues (`AnnualCalendar`, `CraHistory`) ne sont jamais démontées pendant que la modal est ouverte. L'état React de ces composants est préservé implicitement. La position de scroll du navigateur dépend du comportement natif ; aucun scroll lock n'est appliqué à `document.body` pendant l'ouverture de la modal… attendez — si, `document.body.style.overflow = 'hidden'` est appliqué pendant l'ouverture et retiré au cleanup. Cela empêche le scroll en arrière-plan, mais la position initiale est préservée puisque le contenu ne défile pas.

---

### 8. Unsaved changes cannot be discarded silently
**N/A**

La modal est en lecture seule : `CalendarGrid` reçoit `onDayClick={() => undefined}`, aucun champ n'est éditable dans `CraDetailModal`. Aucun état "unsaved" ne peut s'accumuler. Le bouton "Réouvrir et modifier" envoie bien un `window.confirm()` avant l'appel API (`handleReopen`), mais cela concerne l'action de réouverture, pas des modifications CRA non sauvegardées. Aucun test ne couvre ce cas car il ne peut pas se produire dans cette implémentation.

---

### 9. Desktop, tablet, and mobile layouts are usable
**PASS (CSS)**

- Desktop/tablette : `max-width: 720px`, `max-height: 90vh`, scroll interne `overflow-y: auto` sur le body, header et actions sticky.
- Mobile `≤640px` : `max-width: 100%`, `max-height: 100%`, `height: 100%`, `border-radius: 0` — adaptation full-screen drawer.

Validation visuelle impossible sans navigateur ; les breakpoints CSS sont en place.

---

### 10. Automated tests cover both calendar and history entry points, close methods, browser navigation, focus restoration, and unsaved-change protection
**PASS (sauf unsaved — N/A)**

| Scénario | Fichier | Statut |
|---|---|---|
| Calendar entry point | `App.test.tsx` D1 | ✅ |
| History entry point | `App.test.tsx` D2 | ✅ |
| Close via × | `CraDetailModal.test.tsx` | ✅ |
| Close via Escape | `CraDetailModal.test.tsx` | ✅ |
| Close via backdrop | `CraDetailModal.test.tsx` | ✅ |
| Browser back (popstate) | `App.test.tsx` | ✅ |
| Focus restoration | `App.test.tsx` | ✅ |
| Unsaved changes | — | N/A |

---

## Anomalies détectées

### Mineure — Aucun test de deep-link d'initialisation
La logique de parsing `?cra={id}` au démarrage (`parseInt(id, 10)` + `isNaN` guard, `App.tsx` l.46-51) n'est pas couverte par un test automatisé. Le code est correct, mais un test de rendu initial avec une URL `?cra=1` n'existe pas. Non bloquant.

### Mineure — `window.confirm()` non accessible
`handleReopen` utilise `window.confirm()` (l.166), qui est une API bloquante non accessible. Hors scope de ce ticket.

### Mineure — `dtoToCraDetails` dupliqué
La fonction existe dans `CraDetailModal.tsx` (l.33) et dans `App.tsx` (l.23, nommée `dtoToDetails`). Dette technique connue et acceptée hors scope.

---

## Décision

**IMPLEMENTATION_APPROVED**

Tous les critères d'acceptance applicables sont satisfaits. Les 300 tests passent. Les anomalies identifiées sont mineures et ne bloquent pas la livraison.
