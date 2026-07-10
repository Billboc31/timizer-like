# PR Review — T001 attempt 1

## Résumé

L'implémentation livre un squelette backend Python/FastAPI + SQLAlchemy 2 avec
persistance SQLite locale, URL de base de données configurable via
`TIMIZER_DATABASE_URL`, endpoint `/health` prouvant la connectivité, tests
unitaires et documentation. Le périmètre est respecté (pas de CRA, pas
d'Alembic, pas de PostgreSQL, pas de frontend) et le plan approuvé est suivi
fichier par fichier.

## Vérifications effectuées

- Lecture du ticket, du plan approuvé (`runs/T001/plan.md`) et de la sortie
  coder (`runs/T001/implementation-output.md`).
- Lecture des fichiers créés : `backend/pyproject.toml`, `backend/app/config.py`,
  `backend/app/db.py`, `backend/app/main.py`, `backend/.env.example`,
  `backend/tests/test_db.py`, `backend/tests/test_health.py`,
  `docs/backend/database.md`, `.gitignore`.
- Reproduction locale : création d'un venv, `pip install -e '.[dev]'`,
  `pytest` → 3 passed (avec un warning de dépréciation Starlette/httpx sans
  incidence).
- Confrontation ligne à ligne aux critères d'acceptation du ticket et au
  périmètre déclaré (Included / Excluded du plan).
- Vérification des règles `code-quality`, `refactor-safety`, `security` et
  `workflow-discipline`.

## Points validés

- **AC1 — Backend can connect to SQLite** : `app/db.py` construit un `Engine`
  SQLAlchemy 2, `app/main.py` ouvre/ferme une connexion dans le `lifespan` au
  démarrage et exécute `SELECT 1` sur `GET /health`. Couvert par
  `test_engine_connects_to_sqlite` et `test_health_returns_ok`.
- **AC2 — Database file location is configurable** : `Settings.database_url`
  lit `TIMIZER_DATABASE_URL` (préfixe `TIMIZER_`) avec fallback `.env`, défaut
  `sqlite:///./var/timizer.db`. Test dédié
  (`test_settings_default_database_url`) plus override effectif dans
  `test_health.py`.
- **AC3 — Local database configuration is documented** :
  `docs/backend/database.md` documente le chemin par défaut, l'override par
  variable d'environnement et par `.env`, la commande locale
  `uvicorn app.main:app --reload`, la procédure de reset et rappelle
  explicitement que seul SQLite est supporté.
- **AC4 — Backend starts successfully with SQLite enabled** : le `lifespan`
  échoue explicitement si la connexion ne peut être ouverte ; exécuté via
  `TestClient` dans le test `/health` (green).
- **AC5 — Existing tests still pass** : aucun test préexistant ; les 3 nouveaux
  tests passent (`pytest -q` → `3 passed`).
- **Scope** : aucun symbole `cra`, `report`, `activity` n'apparaît dans le
  diff ; aucune migration Alembic ; aucun autre driver installé. Rien n'est
  modifié hors `backend/`, `docs/backend/` et le `.gitignore` racine.
- **Sécurité** : `.env` et `backend/var/*.db` gitignorés, `.env.example`
  contient uniquement la valeur par défaut publique, aucun secret loggué, pas
  d'opération destructive implicite.
- **Qualité de code** : fichiers courts, noms explicites, gestion d'erreur
  explicite côté `/health` (503 en cas d'échec DB), pas de magie cachée,
  `connect_args={"check_same_thread": False}` correctement conditionné au
  préfixe `sqlite`.

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels (observations mineures, non bloquantes)

- **Chemin par défaut relatif** : `sqlite:///./var/timizer.db` est résolu par
  rapport au CWD du process. La doc précise « depuis `backend/` », ce qui est
  cohérent avec le développement local, mais un futur ticket packaging /
  service systemd devra en tenir compte. Hors scope T001, à noter pour la
  suite.
- **`/health` renvoie `"database": "sqlite"` en dur** : cohérent avec le scope
  « SQLite only à ce stade », mais deviendra menteur le jour où un autre
  dialecte sera introduit. Acceptable ici, à réviser quand le driver deviendra
  variable.
- **`SessionLocal` et `Base` exportés mais non utilisés** : scaffolding
  attendu par le plan (préparation pour les tickets CRA à venir). Pas un
  problème tant que le prochain ticket les branche.
- **`test_health.py` fait `importlib.reload(app.db)` et `importlib.reload(app.main)`** :
  contournement pragmatique du fait que `engine` est un singleton module. Ça
  fonctionne aujourd'hui mais rend le test sensible à l'ordre d'exécution si
  d'autres suites importent `app.main` par ailleurs. Documenté par le coder,
  toléré pour un skeleton ; envisager plus tard un pattern de dépendance
  FastAPI (`Depends(get_engine)`) pour éviter le reload.
- **Détail d'exception exposé dans le 503 `/health`** : `detail=f"database
  unavailable: {exc}"` peut fuiter une chaîne d'erreur SQLAlchemy. Sur un
  backend local personnel c'est acceptable ; à masquer dès qu'un déploiement
  multi-utilisateur est envisagé.
- **`extra="ignore"` dans `SettingsConfigDict`** : silence les variables
  d'environnement inconnues préfixées `TIMIZER_`. Choix défendable pour éviter
  des crashs, à surveiller si on veut au contraire détecter les typos plus
  tard.

## Décision

- APPROVED

## Actions demandées

Aucune action bloquante. Les observations ci-dessus sont à garder en tête pour
les tickets suivants (CRA models, endpoints, éventuel packaging), pas à
corriger dans T001.

IMPLEMENTATION_APPROVED
