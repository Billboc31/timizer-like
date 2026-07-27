I now have a complete picture. Writing the review.

---

# PR Review — T040: Fix frontend runtime errors, React warnings, and failed API interactions

## Résumé

L'implémentation couvre correctement les 7 défauts identifiés dans le plan (D1–D7) et les 70 tests passent. Cependant, `tsc --noEmit` échoue avec 2 erreurs TypeScript, ce qui contredit directement le critère d'acceptation 6 du plan. Ces erreurs sont bloquantes.

---

## Vérifications effectuées

- Lecture du plan, des fichiers modifiés, créés et supprimés
- Exécution de `vitest run` → 70/70 ✅
- Exécution de `tsc --noEmit` → **2 erreurs** ❌
- Lecture du backend Python → aucun router CRA existant (D3 non vérifiable)
- Inspection croisée des types entre `api/types.ts` et `types/cra.ts`

---

## Points validés

- **D1** : `handleOpen` appelle bien `getCra(id)` ; `craLoading`/`craError` remplacent les props hardcodées `false`/`null` dans `App.tsx:30-42`.
- **D2** : `httpClient.ts:3` utilise `import.meta.env.VITE_API_BASE_URL`. Plus aucune référence `process.env.REACT_APP_*`.
- **D4** : `CraMonthSelector` et `CraHistory` importent depuis `craClient.ts`. `api/cra.ts` est supprimé.
- **D6** : `ErrorBoundary` correctement implémenté (`getDerivedStateFromError` + `componentDidCatch`) et appliqué dans `main.tsx:9`.
- **D7** : Les deux `useEffect` retournent un cleanup `AbortController`. L'`AbortError` est re-throwé sans être wrappé dans un `ApiError`.
- **Tests** : `App.test.tsx`, `httpClient.test.ts`, cas PDF dans `CraHistory.test.tsx` ajoutés. 70 tests ✅.

---

## Problèmes détectés

### Bloquant — TypeScript ne compile pas (`tsc --noEmit` échoue)

Le critère d'acceptation 6 du plan stipule : *"`tsc --noEmit` reports zero errors"*. Ce n'est pas le cas :

**Erreur 1** — `src/api/__tests__/craClient.test.ts:18`

```
error TS2741: Property 'validationDate' is missing in type
'{ id: ..., status: "DRAFT"; }' but required in type 'CraSummaryDto'.
```

Le fixture `mockSummaries` n'a pas été mis à jour après l'ajout de `validationDate: string | null` dans `CraSummaryDto` (D5). Correction simple :

```typescript
// avant
const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT' },
];
// après
const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT', validationDate: null },
];
```

---

**Erreur 2** — `src/types/cra.ts:24`

```
error TS2304: Cannot find name 'CraSummaryDto'.
```

`types/cra.ts` fait un `export type { CraSummaryDto } from '../api/types'`. Ce `export type` ne met pas `CraSummaryDto` dans la portée locale. L'interface `CraDetailsDto` à la ligne 24 essaie de faire `extends CraSummaryDto`, qui n'est pas résolu.

Ce problème révèle aussi un résidu de D5 : le plan demandait de consolider les types dupliqués, mais `types/cra.ts` déclare toujours un `CraDetailsDto` local (avec `days: CraDayEntry[]` où `worked: number`) structurellement différent de `api/types.CraDetailsDto` (avec `days: CraDayEntryDto[]` où `worked: 0 | 0.5 | 1`).

Correction recommandée — ajouter l'import en plus du re-export :

```typescript
// types/cra.ts
import type { CraSummaryDto } from '../api/types';
export type { CraSummaryDto } from '../api/types';
// ... reste du fichier inchangé
```

---

### Observation (non bloquante) — D3 non vérifiable, URL inconsistente conservée

Le backend Python (`backend/app/main.py`) n'a aucun router CRA. Il est donc impossible de vérifier si l'endpoint de création est `/api/cra` ou `/api/cras`. `craClient.ts:10` appelle `POST /api/cra` tandis que toutes les autres fonctions (listCras, getCra…) utilisent `/api/cras`. Ce risque de 404 à la création reste latent et devra être résolu dès que le backend implémentera les routes.

---

### Observation (non bloquante) — Bruit jsdom dans la sortie de tests

```
Error: Not implemented: navigation (except hash changes)
```

Ce message vient du `a.click()` dans `handleDownloadPdf` (jsdom ne supporte pas la navigation). Les tests passent, mais le bruit stderr peut masquer de vraies erreurs en CI. Envisager d'asserter uniquement `craApi.downloadCraPdf` a été appelé, sans déclencher le clic sur l'ancre synthétique.

---

## Risques éventuels

- Le `CraDetailsDto` local dans `types/cra.ts` (non utilisé par `App.tsx`) peut induire des confusions de typage si un futur développeur importe depuis `types/cra` plutôt que `api/types`.
- L'URL `/api/cra` pour la création est un bug potentiel en production dès que le backend sera disponible.

---

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES**

## Actions demandées

1. **(Bloquant)** Ajouter `validationDate: null` au fixture `mockSummaries` dans `src/api/__tests__/craClient.test.ts:18`.
2. **(Bloquant)** Ajouter `import type { CraSummaryDto } from '../api/types'` dans `src/types/cra.ts` (en plus du re-export existant) pour résoudre l'erreur de compilation à la ligne 24.
3. **(Recommandé)** Vérifier et aligner l'URL de `createCra` (`/api/cra` vs `/api/cras`) dès que le backend implémentera les routes CRA.

IMPLEMENTATION_FIX_REQUIRED
