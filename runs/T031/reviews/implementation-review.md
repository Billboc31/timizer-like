I've now verified all the key files. Let me write the review.

---

# PR Review — T031 Deploy the application (re-review après fix)

## Résumé

Le fix demandé lors de la première review a été appliqué correctement : `frontend/src/api/cra.ts:3` utilise désormais `''` comme fallback au lieu de `'http://localhost:8080'`. Tous les livrables du plan sont présents. Les deux observations mineures de la première review subsistent mais restent non-bloquantes.

---

## Vérifications effectuées

- Vérification du fix appliqué : `cra.ts:3` — valeur réelle dans le fichier
- Relecture de chaque livrable : `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.prod.yml`, `.env.production.example`, `docs/deployment.md`
- Cohérence du routage nginx avec les routes appelées dans `cra.ts`
- Persistance des volumes nommés dans `docker-compose.prod.yml`
- `.gitignore` : présence de `.env.production` (ligne 7)
- Absence de `.dockerignore` (observation mineure confirmée)
- `config.py` : `TIMIZER_PROVIDER_SIGNATURE_PATH` toujours non consommé (observation mineure confirmée)

---

## Points validés

- **Fix bloquant résolu** : `cra.ts:3` = `?? ''`. Toutes les routes CRA (`/api/cras`, `/api/cra`, `/api/cras/:id/pdf`) utilisent des URLs relatives qui transitent par le proxy nginx, identique au comportement de `httpClient.ts`.
- **Routage nginx correct** : `location /api/` matche par préfixe `/api/cra` et `/api/cras/…` → toutes les routes CRA proxiées vers `backend:8000`.
- **`backend/Dockerfile`** : Python 3.11-slim, `pip install -e .`, uvicorn sans `--reload`, port 8000.
- **`frontend/Dockerfile`** : Node 20 → `npm ci && npm run build` → nginx 1.27-alpine, `dist/` servi statiquement.
- **`nginx.conf`** : proxy `/health` et `/api/` vers `backend:8000`, fallback SPA `try_files $uri $uri/ /index.html`.
- **`docker-compose.prod.yml`** : `frontend` sur port 80, `backend` interne ; volumes `timizer-db` → `/app/var`, `timizer-assets` → `/app/assets` ; `env_file: .env.production` uniquement sur `backend`.
- **`.env.production.example`** : documente `TIMIZER_DATABASE_URL` et `TIMIZER_PROVIDER_SIGNATURE_PATH` avec commentaires et commande de copie du fichier signature.
- **`docs/deployment.md`** : checklist premier déploiement, health check, mise à jour, arrêt, note sur les volumes.
- **`.gitignore`** : `.env.production` à la ligne 7. Aucun secret committé.
- **`/health`** : `main.py:22` retourne `{"status": "ok", "database": "sqlite"}`.
- **Aucune modification de fichier source existant** hors le fix `cra.ts` (fallback non fonctionnel → fallback correct).

---

## Problèmes détectés

Aucun problème bloquant.

---

## Risques éventuels

### 🟡 Mineur — Absence de `.dockerignore`

Ni `backend/.dockerignore` ni `frontend/.dockerignore` ne sont créés. Le `COPY . .` dans `frontend/Dockerfile` peut inclure `node_modules/` ou `dist/` si présents sur la machine de build, ce qui ralentit les builds. Non bloquant pour un premier déploiement sur VPS vierge.

### 🟡 Mineur — `TIMIZER_PROVIDER_SIGNATURE_PATH` non consommé par `config.py`

`backend/app/config.py` expose uniquement `database_url`. La variable `TIMIZER_PROVIDER_SIGNATURE_PATH` est correctement documentée dans `.env.production.example` et le volume `timizer-assets` persiste le fichier, mais la variable est ignorée par l'application jusqu'à ce qu'elle soit ajoutée à `Settings`. Acceptable pour T031 (génération de PDF hors scope).

---

## Décision

Tous les critères d'acceptance du ticket sont couverts :
- Infrastructure Docker Compose complète et fonctionnelle
- Persistence SQLite et assets via volumes nommés
- Aucun secret committé
- Health check opérationnel
- Documentation de déploiement complète
- Fix `cra.ts` appliqué : le workflow CRA peut s'exécuter via le proxy nginx

IMPLEMENTATION_APPROVED
