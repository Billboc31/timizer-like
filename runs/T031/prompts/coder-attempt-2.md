# GLOBAL CONTEXT

# Global Context — Timizer Like

## Project

- project_id: timizer-like
- repo: git@github.com:Billboc31/timizer-like.git

## AI Dev Factory

This project uses AI Dev Factory for AI-assisted development.

Agent context folders:
- `ai/` — roles and skills
- `docs/` — project documentation
- `prompts/` — ticket-specific and generic prompts
- `runs/` — per-ticket runtime artifacts
- `tickets/` — ticket definitions

---

# ROLE

# Role — Coder

## Mission

Implémenter strictement un ticket en suivant le plan validé et les skills applicables.

## Tu dois

- lire le ticket
- lire le plan validé
- respecter le scope
- lister les fichiers créés ou modifiés
- produire un changement minimal, lisible et testable
- ajouter ou adapter les tests si nécessaire
- signaler les hypothèses et limites

## Tu ne dois pas

- élargir le ticket
- réécrire l’architecture sans demande explicite
- faire un refactor massif non demandé
- modifier la mémoire projet sauf si le ticket le demande explicitement
- masquer les erreurs ou incertitudes

## Sortie attendue

- résumé des changements
- liste des fichiers modifiés
- vérifications effectuées
- limites connues

## Règles

- coder uniquement après `PLAN_APPROVED`
- ne jamais contourner les contraintes du plan
- garder les changements petits et reviewables

---

# SKILL: workflow-discipline

# Skill — Workflow Discipline

## Objectif

Faire respecter le lifecycle officiel des tickets et PR IA.

## Règles

- respecter l’ordre des étapes du workflow
- ne pas bypass les reviews obligatoires
- maintenir les statuts cohérents
- conserver les artefacts versionnés
- séparer plan, implémentation et mémoire

## Refuser si

- une review obligatoire est sautée
- la mémoire est mise à jour avant validation implémentation
- le workflow officiel est contourné

---

# SKILL: git-discipline

# Skill — Git Discipline

## Objectif

Maintenir un historique Git propre, compréhensible et traçable.

## Règles

- un ticket = une unité de travail cohérente
- éviter les commits mélangeant plusieurs sujets
- utiliser des messages de commit explicites
- conserver les PR lisibles
- éviter les modifications hors scope
- maintenir les fichiers mémoire cohérents avec les changements réels

## Refuser si

- la PR mélange plusieurs fonctionnalités
- des changements non liés sont ajoutés
- les commits deviennent impossibles à reviewer

---

# SKILL: code-quality

# Skill — Code Quality

## Objectif

Produire des changements simples, lisibles, robustes et faciles à reviewer.

## Règles

- privilégier le code simple avant le code sophistiqué
- utiliser des noms explicites
- garder des fonctions courtes et lisibles
- éviter la magie cachée
- gérer les erreurs explicitement
- ajouter des logs utiles sans bruit excessif
- éviter les dépendances inutiles
- conserver un changement borné au ticket

## Refuser si

- le code devient inutilement complexe
- le ticket introduit une dépendance non justifiée
- les erreurs sont masquées
- les changements dépassent le scope demandé

---

# SKILL: refactor-safety

# Skill — Refactor Safety

## Objectif

Limiter les régressions et les dérives de scope lors des modifications.

## Règles

- modifier uniquement le périmètre demandé
- éviter les refactors transversaux implicites
- préserver les comportements existants
- maintenir la compatibilité sauf demande explicite
- privilégier des changements incrémentaux

## Refuser si

- le ticket dérive vers une réécriture globale
- plusieurs couches sont modifiées sans justification
- le comportement change silencieusement

---

# SKILL: security

# Skill — Security

## Objectif

Réduire les risques de sécurité et éviter les comportements dangereux.

## Règles

- ne pas exposer de secrets dans logs ou documentation
- limiter les permissions au strict nécessaire
- éviter les exécutions implicites dangereuses
- valider les entrées externes
- documenter les impacts sécurité importants
- éviter les comportements destructifs implicites

## Refuser si

- des secrets sont hardcodés
- des données sensibles sont logguées
- une opération destructive n’est pas explicitement contrôlée

---

# TASK

# Generic Coder Task

Read the ticket and the approved plan below, then implement the required changes.

The implementation must:
- follow the approved plan strictly
- remain within scope
- list all created or modified files
- be minimal, readable, and testable

The ticket follows.


# T031 — Deploy the application

**Source**: GitHub Issue #61

## Description

## Context

The MVP must be accessible outside the local development environment so the monthly CRA workflow can be used from a web browser.

## Goal

Make the complete application available in a production environment.

## Description

Provide a production deployment for the React frontend, Spring Boot backend, SQLite database, generated PDF files, and provider signature asset.

Runtime configuration and sensitive values must be externalized from the source code.

Application data and generated CRA documents must survive application restarts and redeployments.

The deployed application must expose a documented public URL and provide a simple way to verify that the frontend and backend are operational.

## Out of Scope

- Client signature workflow
- Multi-environment deployment
- Automatic scaling
- High-availability architecture
- Monitoring platform integration
- Provider-specific infrastructure beyond what is required for the first deployment

## Acceptance Criteria

- The frontend is accessible from a documented production URL
- The frontend can communicate with the deployed backend
- The backend starts with production configuration
- SQLite data survives application restarts and redeployments
- Generated PDF files and the provider signature asset remain available after restart
- Sensitive configuration is not committed to the repository
- A health or status check confirms that the backend is operational
- Deployment and update instructions are documented
- The full CRA workflow can be completed in the deployed environment
- Existing tests still pass

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All 6 new files are present and `.gitignore` is updated. Implementation complete.

---

## Summary

**Files created:**

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Python 3.11-slim image; installs package with `pip install -e .`; starts uvicorn on port 8000 |
| `frontend/Dockerfile` | Node 20 build stage → nginx 1.27-alpine serve stage |
| `frontend/nginx.conf` | Proxies `/health` and `/api/` to `backend:8000`; SPA fallback for all other paths |
| `docker-compose.prod.yml` | Two services (`frontend` on port 80, `backend` internal); two named volumes (`timizer-db` → `/app/var`, `timizer-assets` → `/app/assets`) |
| `.env.production.example` | Documents `TIMIZER_DATABASE_URL` and `TIMIZER_PROVIDER_SIGNATURE_PATH` with comments |
| `docs/deployment.md` | First-deploy checklist, health check command, update procedure, production URL placeholder |

**File modified:**

- `.gitignore` — added `.env.production` entry to keep secrets out of the repo

**No existing source files were touched.**

**Known limits (from plan):**
- CRA business routes don't exist in the Python backend yet; the full workflow cannot be exercised until they are implemented (out of scope for T031)
- Production URL placeholder in `docs/deployment.md` must be filled in once a VPS is provisioned

---

## Review

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

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T031/reviews/implementation-review.md
- generated at: 2026-07-26T23:57:00Z

---

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