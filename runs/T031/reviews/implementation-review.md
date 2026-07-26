# PR Review — T031 Deploy the application

## Résumé

L'implémentation crée les 6 fichiers prévus par le plan (`backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.prod.yml`, `.env.production.example`, `docs/deployment.md`) et met à jour `.gitignore`. Aucun fichier source existant n'est modifié. La structure de déploiement Docker Compose est correcte et conforme au plan. Un problème bloquant a été identifié dans le client API frontend, ainsi que deux observations mineures.

---

## Vérifications effectuées

- Conformité entre `plan.md` et les fichiers livrés
- Cohérence des variables d'environnement entre `config.py`, `.env.production.example` et `docker-compose.prod.yml`
- Routage nginx vs clients HTTP du frontend (`httpClient.ts` et `cra.ts`)
- Persistence des volumes nommés
- Sécurité des secrets (`.gitignore`)
- Documentation (`docs/deployment.md`)
- Tests existants (non modifiés, aucun fichier source touché)

---

## Points validés

- **Dockerfiles corrects** : `backend/Dockerfile` utilise Python 3.11-slim, installe le paquet via `pip install -e .`, démarre uvicorn sans `--reload`. `frontend/Dockerfile` utilise le multi-stage Node 20 → nginx 1.27-alpine.
- **nginx.conf** : proxy `/health` et `/api/` vers `backend:8000`, fallback SPA `try_files $uri $uri/ /index.html` pour toutes les autres routes.
- **Volumes nommés** : `timizer-db` → `/app/var`, `timizer-assets` → `/app/assets`, déclarés dans `docker-compose.prod.yml`. La persistance SQLite et la signature prestataire survivent aux redémarrages.
- **Secrets gitignorés** : `.env.production` ajouté au `.gitignore` (ligne 7).
- **`env_file: .env.production`** : uniquement sur le service `backend`, aucun secret passé au frontend.
- **`backend` non exposé** : seul le service `frontend` mappe le port 80 sur l'hôte.
- **Health check** : `GET /health` → `{"status":"ok","database":"sqlite"}` confirmé par le code `main.py:22` et les tests `test_health.py`.
- **Documentation** : `docs/deployment.md` couvre le premier déploiement, la mise à jour, le health check, le stop.
- **Aucune modification de fichier source** : les tests existants restent valides.

---

## Problèmes détectés

### 🔴 BLOQUANT — `frontend/src/api/cra.ts:3` : fallback `http://localhost:8080` dans le frontend déployé

```ts
// cra.ts:3
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';
```

En production, `VITE_API_BASE_URL` n'est pas injecté au moment du build Docker (aucun `ARG` / `--build-arg` dans `frontend/Dockerfile`). La valeur sera `undefined`, et le fallback `http://localhost:8080` sera utilisé. Toutes les routes CRA (`/api/cras`, `/api/cra`, `/api/cras/:id/pdf`) seront envoyées à `localhost:8080` depuis le navigateur — hors du conteneur, port non bindé — et échoueront.

Le plan a exclu la correction de `httpClient.ts` en notant que son fallback vide (`''`) fonctionne via le proxy nginx same-origin. Mais `cra.ts` est un fichier différent avec un fallback explicitement cassé. Ce fichier n'est pas mentionné dans l'exclusion du plan.

L'acceptance criterion "The full CRA workflow can be completed in the deployed environment" exige que ce client soit fonctionnel dans le déploiement. Même si les routes backend CRA n'existent pas encore dans le Python backend, déployer un frontend qui route ses appels CRA vers `localhost:8080` constitue un défaut qui doit être corrigé sur cette branche de déploiement.

**Correction attendue** : remplacer le fallback dans `cra.ts:3` :
```ts
// Avant
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';

// Après
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
```

Avec `''`, tous les appels utilisent des URLs relatives (`/api/cras`, etc.) qui transitent par le proxy nginx — identique au comportement de `httpClient.ts`.

---

## Risques éventuels

### 🟡 Mineur — Absence de `.dockerignore`

Ni `backend/.dockerignore` ni `frontend/.dockerignore` ne sont créés. Le `COPY . .` dans `frontend/Dockerfile` envoie potentiellement `node_modules/`, `dist/` et d'autres artefacts inutiles au Docker daemon si ces dossiers existent sur la machine de build. Cela peut ralentir significativement les builds. Non bloquant pour un premier déploiement sur VPS vierge, mais à corriger avant l'utilisation en CI.

### 🟡 Mineur — `TIMIZER_PROVIDER_SIGNATURE_PATH` documenté mais non consommé par `config.py`

`backend/app/config.py` ne définit que `database_url`. La variable `TIMIZER_PROVIDER_SIGNATURE_PATH` documentée dans `.env.production.example` n'est jamais lue par l'application. Le volume `timizer-assets` est correctement monté et persistera le fichier, mais la variable d'env sera ignorée jusqu'à ce qu'elle soit ajoutée à `Settings`. Acceptable pour T031 puisque la génération de PDF est hors scope, mais une note dans le `.env.production.example` éviterait toute confusion lors du prochain ticket CRA.

---

## Décision

IMPLEMENTATION_FIX_REQUIRED

---

## Actions demandées

1. **[Bloquant]** Dans `frontend/src/api/cra.ts:3`, remplacer le fallback `'http://localhost:8080'` par `''` pour que les appels CRA transitent via le proxy nginx en production.

IMPLEMENTATION_FIX_REQUIRED
