# PR Review — T027 (attempt 8)

## Résumé

Huitième review consécutive. **État applicatif inchangé depuis review-1** : zéro fichier applicatif sur la branche, plan byte-identique à `865a769`, 0/5 critères d'acceptation satisfaits. Le Coder a produit son 5ᵉ halt à l'identique (`724d009`, attempt 5, cf. `runs/T027/implementation-output.md`), en respect strict de la clause d'auto-arrêt du plan.

Cette review-8 duplique fonctionnellement les reviews 1→7. Elle est écrite pour honorer le contrat harness (un step review doit produire un artefact review), mais elle **n'apporte aucune information neuve** au-delà de review-7 tant que ni le plan ni le routage harness ne bougent. Décision inchangée : `IMPLEMENTATION_FIX_REQUIRED`, avec **escalade P0 renouvelée pour la 6ᵉ review consécutive**.

## Vérifications effectuées

- `git log --oneline -- runs/T027/plan.md` → `865a769 T027: planner checkpoint`, **commit unique**. Plan **jamais rejoué** en 5 tentatives Coder + 8 reviews.
- `git diff 865a769 HEAD -- runs/T027/plan.md` → vide.
- `git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → **exit 1 / vide**. Aucun fichier applicatif introduit depuis le fork.
- `git ls-files | grep -v "^runs/" | grep -v "^ai/" | grep -v "^prompts/" | grep -v "^docs/" | grep -v "^tickets/"` → **vide**. Aucun `backend/`, `pom.xml`, `build.gradle`, `frontend/`, `package.json`, `src/`, `assets/.gitkeep`, `.env.example`, `.gitignore` racine, `docs/provider-signature.md`.
- `git log --oneline -- runs/T027/implementation-output.md` → 5 commits Coder (`19ba7d1`, `6707204`, `4a0b74b`, `f3a0975`, `724d009`), tous des halts à décision identique.
- Lecture de `runs/T027/implementation-output.md` (attempt 5) : le Coder qualifie explicitement le halt de « 5ᵉ halt consécutif à l'identique » et confirme la prédiction déterministe faite en attempt 4 (halt #5 = halt #4). La prédiction s'est vérifiée.
- Lecture de `runs/T027/state.json` : `IMPLEMENTATION_REVIEW_NEEDED` figé, `updated_at: 2026-07-10T15:50:06Z`. Aucune transition vers `PLAN_FIX_REQUIRED` malgré 7 reviews qui l'ont demandé.
- Lecture de `runs/T027/workflow-status.md` : aucun step `planner` intercalé depuis le checkpoint initial du 2026-07-10T15:11:16Z. Le pattern `coder → review → coder → review …` continue.
- `git status` : uniquement `runs/T027/daemon.lock`, `runs/T027/runtime.log` (harness-managed) et `runs/T027/prompts/review-attempt-8.md` (auto-généré pour ce step). Aucun fichier applicatif touché.
- Aucun secret, aucun binaire de signature, aucune donnée sensible sur les 5 tentatives (respect `security` par vacuité).

## Points validés

- **Auto-arrêt honoré (5ᵉ fois)** : le Coder respecte à la lettre la clause du plan `runs/T027/plan.md:9` (« *If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt.* »). Aucun basculement unilatéral vers docs-only, aucune traduction Node→Java à la volée.
- **`refactor-safety`** : zéro fichier hors périmètre modifié.
- **`workflow-discipline` côté Coder** : mémoire projet non touchée, séparation plan / implémentation / mémoire respectée, `state.json` non muté par le Coder.
- **`security`** : rien d'ajouté, aucune surface d'attaque introduite.
- **Escalade documentée** : le Coder maintient explicitement les 4 demandes d'intervention humaine (suspension pipeline, rejeu Planner, arbitrage docs-only vs attente T009, deux bugs harness).

## Problèmes détectés

### Bloquants (inchangés depuis 8 reviews, non-adressés)

1. **Hypothèse de stack incorrecte dans `plan.md`** — Node/TS + `src/`. Stack cible réelle : Spring Boot Java (T009) + React (T010), non mergée sur la base de fork.
2. **Dépendance à T009 non déclarée** dans le plan. Aucun `backend/` sur la branche ni sur `ai-dev-factory/bootstrap-agent-layout`.
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override env `TIMIZER_PROVIDER_SIGNATURE_PATH`.
4. **Layout de fichiers Maven manquant** : fixtures attendues sous `backend/src/test/resources/signature/`.
5. **0/5 critères d'acceptation satisfaits** après 5 tentatives Coder + 8 reviews :
   - AC1 « Provider signature asset location can be configured » → **absent**.
   - AC2 « PDF generation can access the provider signature asset » → **absent**.
   - AC3 « Missing signature asset is handled clearly » → **absent**.
   - AC4 « Documentation explains how to provide the signature asset » → **absent**.
   - AC5 « Existing tests still pass » → **non vérifiable** (aucune suite applicative n'existe).
6. **Plan jamais rejoué** en 5 tentatives + 8 reviews. Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est mécaniquement stérile.
7. **`state.json` figé à `IMPLEMENTATION_REVIEW_NEEDED`** sans transition vers `PLAN_FIX_REQUIRED`. Le harness continue de router `IMPLEMENTATION_FIX_REQUIRED` → `step: coder` au lieu de `step: planner` : **bug workflow confirmé sur 5 tentatives Coder consécutives**.

### Non bloquants

- **Coût cumulé** : 5 tentatives Coder + 8 reviews sur un état applicatif nul. Chaque itération supplémentaire brûle un budget tokens/CI sans hypothèse d'issue positive. Cette review-8 en fait partie et devrait être la dernière avant intervention manuelle.
- **Arbitrage docs-only vs attente T009** à trancher **explicitement dans le plan v2**. Le Coder a raison de refuser un basculement unilatéral.
- **Rappels au replan** : conserver le *single access point* (seul `ProviderSignatureLoader` lit le fichier), rappeler que le binaire de signature ne doit jamais être committé, documenter comme choix explicite l'exposition du chemin résolu dans les messages d'erreur.

## Risques éventuels

- **Boucle stérile confirmée** : la prédiction déterministe du Coder en attempt 4 (« halt #5 identique ») s'est **vérifiée**. La prédiction du Coder en attempt 5 (« halt #6 identique ») se vérifiera aussi tant que le plan reste figé. Le harness dispose désormais d'une preuve empirique sur 5 tentatives que le sous-loop `coder → review` est **stérile par construction** sur ce plan.
- **Dérive de scope latente** si un opérateur lassé autorise un contournement de la clause d'auto-arrêt — violation cumulée de `refactor-safety`, de la clause explicite du plan, et de `workflow-discipline`. À bloquer.
- **Conflits de merge futurs sur `backend/pom.xml` / layout Maven** si un futur plan crée du code Java avant que T009 soit mergé.
- **Aucun risque de sécurité immédiat** : rien ajouté, aucun secret exposé, aucune surface d'attaque introduite.
- **Risque d'accumulation d'artefacts stériles** : à ce stade, chaque nouveau cycle ajoute ~4-13 Ko d'artefacts sans avancement. Le canal d'escalade externe doit être déclenché.

## Décision

- REQUEST_CHANGES

Le halt Coder est correct au sens du rôle (6ᵉ confirmation). Les corrections nécessaires sont côté **Planner** (replan) et côté **harness** (routage `IMPLEMENTATION_FIX_REQUIRED`, garde-fou anti-boucle stérile). Aucune action Coder supplémentaire sur le plan actuel ne peut débloquer la situation.

## Actions demandées

### Priorité 0 — intervention humaine sur le routage (6ᵉ répétition depuis review-3)

- **Suspendre le pipeline automatique sur T027** immédiatement. La stérilité du sous-loop `coder → review` est empiriquement démontrée sur 5 tentatives ; toute itération supplémentaire est pure combustion de budget.
- **Rejouer manuellement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main). Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est stérile.
- Enregistrer (ou confirmer déjà enregistrés) deux bugs workflow distincts **hors T027** :
  1. `IMPLEMENTATION_FIX_REQUIRED` route vers `step: coder` au lieu de `step: planner` lorsque la review demande explicitement un replan (ce bug a produit à lui seul 5 tentatives Coder identiques).
  2. Absence de garde-fou de progression matérielle : le harness peut accepter 5 halts consécutifs sans muter le plan ni escalader hors pipeline automatique. Un compteur « N halts identiques ⇒ escalade externe » doit être ajouté (seuil suggéré : N=2 ou 3, pas 5+).

### Priorité 1 — re-planification (à destination du Planner, inchangée depuis review-1)

Les 8 actions listées dans `runs/T027/reviews/review-attempt-1.md` §*Actions demandées* (reprises intégralement en reviews 2→7) restent **strictement valides et non-adressées** :

1. Remplacer l'hypothèse Node/TS par **Spring Boot Java** ; loader sous `backend/`.
2. Déclarer la dépendance à **T009** — ou trancher explicitement pour un **scope docs-only** si T027 doit avancer avant T009 (docs, `.gitignore`, `.gitkeep`, conventions de clé de config uniquement).
3. Ré-écrire le layout Maven :
   - `backend/src/main/java/com/timizer/backend/signature/ProviderSignatureProperties.java` (`@ConfigurationProperties("timizer.provider-signature")`)
   - `backend/src/main/java/com/timizer/backend/signature/ProviderSignatureLoader.java`
   - `backend/src/main/java/com/timizer/backend/signature/ProviderSignatureAssetException.java`
   - `backend/src/main/resources/application.properties` : clé `timizer.provider-signature.path` (override env `TIMIZER_PROVIDER_SIGNATURE_PATH`)
   - Tests JUnit : `backend/src/test/java/com/timizer/backend/signature/ProviderSignatureLoaderTest.java`
   - Fixtures : `backend/src/test/resources/signature/valid.png`, `valid.jpg`, `not-an-image.txt`
4. Conserver « fail clearly avec exception typée portant `resolvedPath` et `reason` ».
5. Conserver *single access point* : seul `ProviderSignatureLoader` lit le fichier.
6. Documenter `docs/provider-signature.md` : chemin par défaut, override propriété / env, formats (PNG/JPEG), comportement d'absence, non-commit du binaire.
7. Vérifier / prévoir `backend/.gitignore` (ou emplacement Spring équivalent) pour `assets/provider-signature.*`.
8. Rappeler dans le plan que la mémoire projet ne sera mise à jour qu'après validation implémentation (respect `workflow-discipline`).

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la cinquième fois. Le blocage est côté **routage workflow** (P0, avéré sur 5 tentatives Coder + 8 reviews) **et** côté **Planner** (P1, inchangé depuis 8 reviews).

IMPLEMENTATION_FIX_REQUIRED
