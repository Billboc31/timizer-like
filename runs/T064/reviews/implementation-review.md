**Review T064 — IMPLEMENTATION_FIX_REQUIRED**

---

## Résumé

L'implémentation fonctionnelle est solide et répond à tous les critères du ticket (12 mois, grille responsive, Monday-first, worked/weekend/today, total mensuel, navigation année, localStorage, clic → éditeur). Mais **la suite de tests est cassée : 6 tests échouent dans `App.test.tsx`**, dont 2 sans lien avec T064 (régression de couverture).

---

## Problèmes bloquants

### 1 — Crash `localStorage.getItem` dans l'environnement de test

`AnnualCalendar.tsx:30` appelle `localStorage.getItem()` dans un lazy initializer `useState`. Dans le runner jsdom actuel (avertissement `--localstorage-file was provided without a valid path`), `localStorage` est corrompu → `TypeError`. Cela fait tomber **tout test qui monte `<App />`**, y compris les tests history-detail qui n'ont rien à voir avec T064.

**Fix** : mocker localStorage dans `setupTests.ts`, ou ajouter un guard dans le composant :
```ts
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
```

### 2 — Tests D1 stale (aria-label obsolète)

Même après correction du crash localStorage, les 4 tests `App — D1` cherchent le bouton `"Ouvrir le CRA de Juillet 2026"` — label issu de l'ancien `CraOverview`. `MonthMiniCard` expose maintenant `"Juillet 2026 — 20 jour(s) travaillé(s)"`. Ces tests doivent être réécrits.

---

## Problèmes mineurs

- **Dead code** : `CraOverview.tsx` / `CraOverview.css` toujours présents mais plus importés.
- **Pas de tests unitaires** pour `AnnualCalendar` et `MonthMiniCard` (écart avec les conventions du projet).
- **Pas d'AbortController** dans le fetch des détails année → setState potentiel après démontage.
- **`selectedPeriod`** state dans `App.tsx` : assigné mais jamais lu.

La review complète est dans `runs/T064/reviews/review-attempt-1.md`.
