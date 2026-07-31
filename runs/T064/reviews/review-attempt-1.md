# PR Review — T064

## Résumé

L'implémentation fonctionnelle est correcte et couvre tous les critères d'acceptance du ticket : 12 mois affichés dans une grille responsive, layout Monday-first, distinction visuelle worked/half/weekend/today, total mensuel, navigation année, persistance localStorage, clic ouvrant le CRA correspondant, et aucune création silencieuse de CRA. Deux composants propres (`AnnualCalendar`, `MonthMiniCard`) remplacent correctement `CraOverview` dans `App.tsx`.

**Cependant, la suite de tests est cassée : 6 tests en échec dans `App.test.tsx`, dont 2 non liés à T064.** La CI ne passe pas en l'état.

---

## Vérifications effectuées

- Lecture complète de `AnnualCalendar.tsx`, `MonthMiniCard.tsx`, `App.tsx` (diff complet)
- Lecture de `NewCraDialog.tsx` (changement des props)
- Lecture de `App.test.tsx` (stale tests)
- Exécution de `npm run test -- --run` → **6 failed / 288 tests**
- Vérification des fichiers présents dans les dossiers des nouveaux composants
- Vérification de l'utilisation de `CraOverview` dans le codebase

---

## Points validés

### Fonctionnel
- Les 12 mois sont rendus inconditionnellement (`Array.from({ length: 12 })`), même sans CRA.
- Layout Monday-first correct : `(firstDate.getDay() + 6) % 7`.
- Classes CSS distinctes : `--worked`, `--half`, `--weekend`, `--empty`, `--today`.
- Total travaillé affiché en footer et dans `aria-label`.
- Navigation année (+1 / -1) + bouton "Aujourd'hui" masqué quand `displayedYear === currentYear`.
- Persistance localStorage avec clé `annual-calendar-year`, restaurée au rechargement.
- Clic sur mois existant → `handleOpen(summary)` + `setView('selector')` → éditeur CRA.
- Clic sur mois sans CRA → ouvre le `NewCraDialog` pré-rempli → l'utilisateur confirme, pas de création silencieuse.
- `onOpenCra` dans `App.tsx` : `(cra) => { handleOpen(cra); setView('selector'); }` — correct.

### Qualité technique
- Abort signal sur `listCras` (cleanup propre au démontage).
- `loadedIds` ref évite les double-fetches de détails.
- Skeleton grid pendant le chargement initial, barre de chargement pendant les changements d'année.
- Gestion d'erreur avec `role="alert"` et bouton "Réessayer".
- ARIA complet : `aria-live`, `aria-label`, `aria-busy`, `aria-hidden`.
- CSS utilise les design tokens (`--color-primary`, `--shadow-*`, `--radius-*`).
- Grille responsive : 4 colonnes desktop / 3 tablette / 2 mobile.

---

## Problèmes détectés

### BLOQUANT — 6 tests en échec dans `App.test.tsx`

**Cause principale :** `AnnualCalendar.tsx` appelle `localStorage.getItem` dans un lazy initializer `useState` :

```ts
// AnnualCalendar.tsx:30
const stored = localStorage.getItem(STORAGE_KEY);
```

Dans l'environnement jsdom du test runner, cette ligne lève `TypeError: localStorage.getItem is not a function` (le warning `--localstorage-file was provided without a valid path` indique que jsdom est lancé avec un flag invalide qui corrompt l'objet `localStorage`). Ce crash bloque le rendu de `<App />`, ce qui fait échouer **tous** les tests qui montent `App`, y compris les tests de navigation history-detail qui n'ont rien à voir avec T064.

**Correction attendue :** Mocker `localStorage` dans `setupTests.ts` avant le montage des composants, ou ajouter un guard dans le composant :

```ts
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
```

---

**Cause secondaire (tests D1) :** Même si localStorage était corrigé, les 4 tests de la suite `App — D1: getCra on open` rechercheraient :

```ts
screen.getByRole('button', { name: 'Ouvrir le CRA de Juillet 2026' })
```

Ce label provenait de `CraOverview` (qui n'est plus rendu). `MonthMiniCard` utilise désormais :

```
aria-label="Juillet 2026 — 20 jour(s) travaillé(s)"
```

Ces tests doivent être réécrits pour correspondre au nouveau composant et au nouveau modèle d'interaction (les détails sont maintenant chargés automatiquement au montage, pas uniquement au clic).

---

### Mineur — Code mort : `CraOverview.tsx` toujours présent

`CraOverview.tsx` et `CraOverview.css` sont toujours dans le repo mais n'sont plus importés nulle part. Le fichier `App.test.tsx` ligne 115 mentionne encore `"via CraOverview"` dans la description du test. Ces fichiers devraient être supprimés ou la décision de les conserver documentée.

---

### Mineur — Pas de tests unitaires pour les nouveaux composants

`AnnualCalendar` et `MonthMiniCard` n'ont aucun fichier `.test.tsx` ni `.axe.test.tsx`, contrairement à tous les autres composants du projet (`CalendarGrid`, `CraHistory`, `MonthMiniCard` devrait suivre le même pattern). Ce n'est pas bloquant mais crée un écart de couverture notable.

---

### Mineur — Pas d'AbortController dans le fetch des détails année

```ts
// AnnualCalendar.tsx:81
Promise.all(needed.map(s => getCra(s.id)))
  .then(dets => { ... setLoadingYear(false); })
```

Aucun cleanup si le composant est démonté ou si l'année change pendant la résolution. En navigation rapide d'années, plusieurs `Promise.all` peuvent être en vol simultanément et appeler `setLoadingYear(false)` prématurément. Pas critique mais peut provoquer des warnings React en mode strict.

---

### Mineur — État mort `selectedPeriod` dans `App.tsx`

```ts
const [selectedPeriod, setSelectedPeriod] = useState<{ startDate: string; endDate: string } | null>(null);
```

Cet état est assigné dans `handleNewCraConfirm` mais jamais lu ni passé à un composant. Dead state à nettoyer.

---

## Risques éventuels

- Les tests D2 (history-detail) échouent à cause du crash localStorage, pas à cause d'un vrai bug de régression dans cette fonctionnalité. Une fois localStorage corrigé, il faudra vérifier que ces tests repassent indépendamment du reste.
- La liste de CRAs est rechargée à chaque fois que le retry est déclenché (via `setLoadKey`), ce qui re-fetche aussi les détails déjà chargés des autres années. Acceptable à ce stade.

---

## Actions demandées

1. **[BLOQUANT]** Corriger le crash `localStorage.getItem` dans l'environnement de test. Solution recommandée : ajouter dans `setupTests.ts` un mock de `localStorage` ou lancer jsdom sans le flag `--localstorage-file` invalide.
2. **[BLOQUANT]** Réécrire les 4 tests de la suite `App — D1` dans `App.test.tsx` pour utiliser le label `MonthMiniCard` (`"Juillet 2026 — X jour(s) travaillé(s)"`) et adapter la logique d'assertion au nouveau comportement (fetch automatique des détails au montage).
3. **[Recommandé]** Supprimer `CraOverview.tsx` et `CraOverview.css` (dead code) et mettre à jour la description du test ligne 115.
4. **[Recommandé]** Ajouter au moins un fichier `MonthMiniCard.test.tsx` couvrant le calcul du premier weekday et la distinction worked/weekend/today.
5. **[Optionnel]** Supprimer `selectedPeriod` state dans `App.tsx`.
6. **[Optionnel]** Ajouter un AbortController dans l'effet de fetch des détails année.

IMPLEMENTATION_FIX_REQUIRED
