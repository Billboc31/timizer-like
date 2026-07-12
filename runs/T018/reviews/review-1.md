# PR Review — T018 Frontend API Client

## Résumé

Implémentation d'un client API frontend pour les opérations CRA. Cinq fichiers créés :
`types.ts`, `apiError.ts`, `httpClient.ts`, `craClient.ts`, et les tests unitaires.
Tous les critères d'acceptance sont couverts. 12 tests passent.

## Vérifications effectuées

- Lecture complète des 5 fichiers d'implémentation
- Comparaison avec les critères d'acceptance du ticket et du plan
- Exécution de la suite de tests (`npm test -- --run`)
- Vérification de la cohérence des erreurs et des endpoints
- Audit de scope (pas d'UI, pas d'auth, pas de state management introduit)

## Points validés

- Les 6 fonctions client sont exportées depuis `craClient.ts` avec méthode et chemin corrects
- `ApiError` est levée pour toute réponse non-2xx et pour les échecs réseau
- Le `code` de `ApiError` mappe correctement les codes backend connus et fallback vers `unknown_error`
- `isApiError()` type guard fonctionnel et utilisable par les composants UI
- Aucun code UI, auth, ou state management introduit — scope strictement respecté
- Les endpoints en attente côté backend sont annotés par des commentaires `NOTE:`
- TypeScript strict activé, types des DTOs cohérents avec le domaine

## Problèmes détectés

### Observation 1 — Env var CRA vs Vite (non-bloquant, correction recommandée)

**Fichier** : `httpClient.ts:3`

```typescript
const BASE_URL = (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) || '';
```

`REACT_APP_*` est la convention Create React App. Ce projet utilise Vite. Vite
n'injecte pas `process.env` et n'expose que les variables préfixées `VITE_` via
`import.meta.env`. En pratique `BASE_URL` vaudra toujours `''`, ce qui est correct
pour un déploiement same-origin, mais si une configuration d'URL explicite est un
jour nécessaire, ce code la silencierait.

**Correction recommandée** :
```typescript
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
```
(avec ajout de `VITE_API_BASE_URL` dans `.env.example` si besoin)

### Observation 2 — Endpoint `createCra` singulier vs pluriel (vérification recommandée)

`createCra` appelle `POST /api/cra` (singulier) alors que tous les autres endpoints
utilisent `/api/cras` (pluriel). Si le backend définit effectivement `/api/cra` pour
la création, c'est intentionnel. Sinon, le chemin devrait être `POST /api/cras`.
À vérifier au moment où le backend sera implémenté.

### Observation 3 — Couverture de test partielle pour `downloadCraPdf` (mineur)

Le test de `downloadCraPdf` ne couvre que le cas succès. Il n'existe pas de test
d'erreur pour le blob (erreur HTTP ou réseau). L'implémentation dans `apiGetBlob`
gère bien ces cas ; seule la couverture de test est incomplète. Acceptable dans le
cadre de ce ticket.

## Risques éventuels

- L'env var `REACT_APP_API_BASE_URL` ne fonctionnera pas en production Vite si un
  déploiement cross-origin est requis (voir observation 1).
- L'incohérence `cra` vs `cras` dans le chemin de création devra être arbitrée lors
  de l'implémentation backend.

## Décision

- APPROVED (avec corrections recommandées non-bloquantes)

Toutes les fonctions requises sont implémentées. L'error handling est cohérent.
Les tests passent. Le scope est respecté.

## Actions demandées

1. (Recommandé, non-bloquant) Corriger `process.env.REACT_APP_API_BASE_URL` →
   `import.meta.env.VITE_API_BASE_URL` dans `httpClient.ts`
2. (À vérifier) Confirmer que `POST /api/cra` est bien le chemin backend attendu
   lors de l'implémentation backend
