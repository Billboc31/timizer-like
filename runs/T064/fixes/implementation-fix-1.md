# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T064/reviews/implementation-review.md
- generated at: 2026-07-31T16:51:17Z

---

The test suite still has 6 failures, identical to the first review. The fixes were not applied. I'll write the review.

# PR Review — T064 (tentative 2)

## Résumé

La seconde passe de coder n'a apporté **aucun changement par rapport à la tentative 1**. Les deux problèmes bloquants identifiés dans la première review sont toujours présents. La suite de tests échoue avec exactement les mêmes 6 erreurs.

---

## Vérifications effectuées

- Lecture complète de `AnnualCalendar.tsx`, `setupTests.ts`, `App.test.tsx`, `App.tsx`
- Exécution de `npm run test -- --run` dans `frontend/` → **6 failed / 288 tests**
- Comparaison avec la review précédente : aucune diff observable sur les fichiers concernés

---

## Points validés

Tous les points fonctionnels validés dans la review 1 restent valides (fonctionnel T064 correct, design tokens, ARIA, grille responsive, navigation année, localStorage, clic sur carte). Aucune régression introduite par la tentative 2.

---

## Problèmes détectés

### BLOQUANT #1 — `localStorage.getItem` crash dans `AnnualCalendar.tsx:30`

```
TypeError: localStorage.getItem is not a function
 ❯ src/components/AnnualCalendar/AnnualCalendar.tsx:30:33
```

Le warning jsdom `--localstorage-file was provided without a valid path` corrompt l'objet `localStorage`, rendant `localStorage.getItem` inexistant. Ce crash se produit dans l'initializer `useState` lors du rendu de `<AnnualCalendar>` dans `<App>`, ce qui fait échouer **tous** les tests qui montent `App`.

**Correction attendue** — l'une ou l'autre des approches suivantes :

Option A — guard dans le composant :
```ts
// AnnualCalendar.tsx ligne 30
const stored = typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
  ? localStorage.getItem(STORAGE_KEY)
  : null;
```

Option B — mock dans `setupTests.ts` :
```ts
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: storageMock });
```

---

### BLOQUANT #2 — 4 tests D1 referencing stale `CraOverview` labels

`App.test.tsx` — suite `App — D1: getCra on open` (lignes 115–182) recherche encore :

```ts
screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })
```

Ce label provenait de `CraOverview`, qui n'est plus rendu. `MonthMiniCard` utilise désormais :
```
aria-label="Juillet 2026 — 20 jour(s) travaillé(s)"
```

Ces 4 tests doivent être réécrits. Avec le nouveau composant, `getCra` est appelé automatiquement au montage (pour chaque CRA de l'année affichée), pas seulement au clic. Les assertions sur le moment du `getCra` call doivent également être adaptées.

---

### Mineur — `CraOverview.tsx` / `CraOverview.css` non supprimés

Toujours présents dans `frontend/src/components/CraOverview/`, non importés nulle part. Code mort.

---

### Mineur — État mort `selectedPeriod` dans `App.tsx:59`

```ts
const [selectedPeriod, setSelectedPeriod] = useState<...>(null);
```

Assigné mais jamais lu ni passé à un composant. État inutile.

---

### Mineur — Pas de fichiers `.test.tsx` pour `AnnualCalendar` et `MonthMiniCard`

Écart de couverture par rapport aux autres composants du projet.

---

## Risques éventuels

- Le blocage localStorage affecte **tous** les tests `App`, y compris les tests D2 (history-detail) qui n'ont rien à voir avec T064. Ces tests ne peuvent pas être considérés comme valides tant que le crash localStorage est présent.
- Les D2 tests (2 tests) échouent aussi : une fois le crash localStorage corrigé, il faudra vérifier que ces tests repassent indépendamment.

---

## Actions demandées

1. **[BLOQUANT]** Corriger le crash `localStorage.getItem` — ajouter un guard dans `AnnualCalendar.tsx` ou mocker `localStorage` dans `setupTests.ts`.
2. **[BLOQUANT]** Réécrire les 4 tests de la suite `App — D1` dans `App.test.tsx` pour correspondre au nouveau composant `MonthMiniCard` et au comportement de fetch automatique.
3. **[Recommandé]** Supprimer `CraOverview.tsx` et `CraOverview.css`.
4. **[Optionnel]** Supprimer l'état mort `selectedPeriod` dans `App.tsx`.

IMPLEMENTATION_FIX_REQUIRED
