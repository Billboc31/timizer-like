# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T025/reviews/implementation-review.md
- generated at: 2026-07-12T17:19:13Z

---

Now I have all the information needed to write the complete review.

---

# PR Review — T025: Create CRA History Page (Attempt 2)

## Résumé

Le problème bloquant de la review précédente (erreur PDF silencieuse) a été correctement corrigé avec `.catch((err: unknown) => { setError(...) })` et un test dédié. Cependant, l'extension de `CraSummaryDto` pour y ajouter `validationDate` a introduit deux régressions TypeScript bloquantes dans des fichiers préexistants non mis à jour.

---

## Vérifications effectuées

- Lecture de `CraHistory.tsx`, `CraHistory.test.tsx`, `CraHistory.css`, `App.tsx`
- Lecture de `types/cra.ts`, `api/cra.ts`, `api/types.ts`
- Lecture de `CraMonthSelector.tsx` et `CraMonthSelector.test.tsx`
- Exécution de `tsc -p tsconfig.app.json --noEmit`
- Diff entre `ai-dev-factory/bootstrap-agent-layout` et `HEAD`
- Lecture de la review précédente et des artefacts de fix

---

## Points validés

- **Fix bloquant appliqué** : `CraHistory.tsx:44` remplace `.catch(() => {})` par `.catch((err: unknown) => { setError(...) })` + `.finally(() => { setDownloading(null) })` → erreur PDF désormais visible
- **Test ajouté** : `'shows error when PDF download fails'` couvre le nouveau cas avec `role="alert"`
- **Tous les AC du ticket** couverts : listing, période/statut/jours, open, download conditionnel, état vide, loading, erreur
- **Scope respecté** : pas de routeur, pas de modification backend, navigation par état dans `App.tsx`
- **10 + 1 tests** pour `CraHistory`

---

## Problèmes détectés

### BLOQUANT 1 — `CraMonthSelector.tsx:48` — `validationDate` absent de l'objet `summary`

L'extension de `CraSummaryDto` dans ce ticket (ajout de `validationDate: string | null`) n'a pas été répercutée dans le code existant qui construit ce type manuellement.

**`frontend/src/components/CraMonthSelector/CraMonthSelector.tsx:48-54`**
```tsx
const summary: CraSummaryDto = {
  id: created.id,
  month: created.month,
  year: created.year,
  totalWorkedDays: created.totalWorkedDays,
  status: created.status,
  // validationDate manquant → TS2741
};
```

Confirmé par `tsc`: `error TS2741: Property 'validationDate' is missing`.

**Correction** :
```tsx
const summary: CraSummaryDto = {
  id: created.id,
  month: created.month,
  year: created.year,
  totalWorkedDays: created.totalWorkedDays,
  status: created.status,
  validationDate: created.validationDate ?? null,
};
```

---

### BLOQUANT 2 — `CraMonthSelector.test.tsx:11` — fixture `JULY_2026` incomplète

Le même champ manque dans le fixture de test.

**`frontend/src/components/CraMonthSelector/CraMonthSelector.test.tsx:11-17`**
```tsx
const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  // validationDate manquant → TS2741
};
```

**Correction** :
```tsx
const JULY_2026: CraSummaryDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  validationDate: null,
};
```

---

## Observations non bloquantes (portées depuis review précédente)

1. **`CraDetailsDto` re-déclare `validationDate`** (`types/cra.ts:27`) — hérité de `CraSummaryDto`, redondant.
2. **`api/types.ts`** définit son propre `CraSummaryDto` sans `validationDate` — dette préexistante, hors scope.
3. **`a.click()` sans append au DOM** (`CraHistory.tsx:38-43`) — pattern fonctionnel, non bloquant.

---

## Risques éventuels

- Les erreurs TypeScript n'empêchent pas Vite de builder (mode dev), mais elles cassent le type-check strict du projet et masquent une vraie régression comportementale : un CRA fraîchement créé dans `CraMonthSelector` aura `validationDate: undefined` au lieu de `null`, ce qui peut provoquer un affichage `undefined` dans la colonne Validation Date de `CraHistory` si cet objet y est passé.

---

## Actions demandées

1. Ajouter `validationDate: created.validationDate ?? null` dans `CraMonthSelector.tsx:54`
2. Ajouter `validationDate: null` dans le fixture `JULY_2026` de `CraMonthSelector.test.tsx:17`
3. Vérifier `tsc -p tsconfig.app.json --noEmit` sans nouvelles erreurs après le fix

---

IMPLEMENTATION_FIX_REQUIRED
