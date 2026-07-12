---

# PR Review — T018 Frontend API Client

## Résumé

Implémentation complète d'un client API frontend pour les opérations CRA : 5 fichiers créés (`types.ts`, `apiError.ts`, `httpClient.ts`, `craClient.ts`, tests), 12/12 tests passent.

## Points validés

- Les 6 fonctions client sont toutes exportées depuis `craClient.ts` avec la bonne méthode HTTP et le bon chemin
- `ApiError` est systématiquement levée pour toute réponse non-2xx et tout échec réseau
- Le mapping des codes d'erreur backend est complet, avec fallback `unknown_error`
- `isApiError()` type guard utilisable par les composants UI
- Aucun code UI, auth ou state management introduit — scope strictement respecté
- Endpoints en attente backend correctement annotés avec des `NOTE:` comments
- TypeScript strict activé, types cohérents

## Problèmes détectés

### Observation 1 — Env var CRA vs Vite (non-bloquant, correction recommandée)

`httpClient.ts:3` utilise `process.env.REACT_APP_API_BASE_URL` — convention Create React App dans un projet Vite. Vite n'expose que les variables `VITE_*` via `import.meta.env`. En pratique `BASE_URL` sera toujours `''` (correct pour same-origin), mais la config sera silencieusement ignorée si une URL explicite est un jour nécessaire.

**Correction** : `import.meta.env.VITE_API_BASE_URL ?? ''`

### Observation 2 — Endpoint `/api/cra` singulier (vérification recommandée)

`createCra` appelle `POST /api/cra` (singulier) vs `/api/cras` (pluriel) pour tous les autres. À confirmer contre le contrat backend lors de son implémentation.

### Observation 3 — Couverture test `downloadCraPdf` (mineur)

Seul le cas succès est testé pour `downloadCraPdf`. Les scénarios d'erreur ne sont pas couverts. Non-bloquant.

## Décision

L'implémentation satisfait tous les critères d'acceptance. Les deux corrections sont recommandées mais non-bloquantes.

IMPLEMENTATION_APPROVED
