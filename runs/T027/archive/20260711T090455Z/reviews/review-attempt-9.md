# PR Review — T027 (attempt 9)

## Résumé

Neuvième review consécutive sur T027. **État applicatif strictement inchangé depuis review-1** : zéro fichier applicatif sur la branche, plan byte-identique à `865a769`, 0/5 critères d'acceptation satisfaits. Le Coder a produit son **6ᵉ halt à l'identique** (`0eca5f3`, attempt 6, cf. `runs/T027/implementation-output.md`), en respect strict de la clause d'auto-arrêt du plan (`runs/T027/plan.md:9`). La prédiction déterministe faite en attempt 5 (« halt #6 identique ») est **vérifiée**.

Cette review-9 est fonctionnellement identique aux reviews 1→8 tant que ni le plan ni le routage harness ne bougent. Elle est produite pour honorer le contrat harness (chaque `step: review` doit produire un artefact), mais elle **n'apporte aucune information neuve** au-delà de review-8. Décision inchangée : `IMPLEMENTATION_FIX_REQUIRED`, avec **escalade P0 renouvelée pour la 7ᵉ review consécutive**.

## Vérifications effectuées

- `git log --oneline -- runs/T027/plan.md` → `865a769 T027: planner checkpoint`, **commit unique**. Plan **jamais rejoué** en 6 tentatives Coder + 9 reviews.
- `git diff 865a769 HEAD -- runs/T027/plan.md` → vide. Aucune mutation du plan depuis le checkpoint initial.
- `git ls-files | grep -Ev "^(ai|prompts|tickets|docs/ai|runs)/"` → **vide**. Zéro fichier applicatif présent sur la branche.
- Confirmé absent : `backend/`, `src/`, `package.json`, `pom.xml`, `build.gradle`, `frontend/`, `assets/.gitkeep`, `.env.example`, `.gitignore` racine, `docs/provider-signature.md`.
- `git log --oneline -- runs/T027/implementation-output.md` → **6 commits Coder** (`19ba7d1`, `6707204`, `4a0b74b`, `f3a0975`, `724d009`, `0eca5f3`), tous des halts à décision identique.
- Lecture de `runs/T027/implementation-output.md` (attempt 6) : le Coder qualifie explicitement son halt de « 6ᵉ halt à l'identique aux attempts 2→5 » et confirme la prédiction déterministe faite en attempt 5. Il pose une nouvelle prédiction pour un éventuel halt #7 dans les mêmes termes.
- Lecture de `runs/T027/state.json` : `IMPLEMENTATION_REVIEW_NEEDED` figé, `updated_at: 2026-07-10T15:55:57Z`. Aucune transition vers `PLAN_FIX_REQUIRED` malgré 8 reviews qui l'ont demandé.
- Lecture de `runs/T027/workflow-status.md` : aucun step `planner` intercalé depuis le checkpoint initial du 2026-07-10T15:11:16Z. Le pattern `coder → review → coder → review …` est reconduit sans mutation matérielle.
- `git status` : uniquement `runs/T027/daemon.lock`, `runs/T027/runtime.log` (harness-managed) et `runs/T027/prompts/review-attempt-9.md` (auto-généré pour ce step). Aucun fichier applicatif touché.
- `git branch -a` : `ticket/T009-bootstrap-spring-boot-backend` et `ticket/T010-bootstrap-react-frontend` existent mais restent **non mergés** dans `main` ni dans `ai-dev-factory/bootstrap-agent-layout` (base de fork de T027). L'hypothèse Node/TS du plan reste factuellement fausse ; la stack cible réelle (Spring Boot + React) reste inaccessible depuis cette branche.
- Aucun secret, aucun binaire de signature, aucune donnée sensible sur les 6 tentatives Coder (respect `security` par vacuité).

## Points validés

- **Auto-arrêt honoré (6ᵉ fois)** : le Coder respecte à la lettre la clause d'auto-arrêt du plan (« *If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt.* »). Aucun basculement unilatéral vers docs-only, aucune traduction Node→Java à la volée, aucune adaptation silencieuse.
- **`refactor-safety`** : zéro fichier hors périmètre modifié. La branche reste strictement au scaffolding AI Dev Factory + artefacts workflow T027.
- **`workflow-discipline` côté Coder** : mémoire projet non touchée, séparation plan / implémentation / mémoire strictement respectée, `state.json` et `workflow-status.md` non mutés par le Coder.
- **`security`** : rien ajouté, aucune surface d'attaque introduite en 6 tentatives.
- **`code-quality`** : par vacuité — aucun code non-sollicité produit, aucune complexité introduite.
- **Escalade explicite maintenue** : le Coder documente clairement (dans `implementation-output.md` et `fixes/context-*.md`) la nature du blocage, la nécessité d'un rejeu Planner, et les deux bugs harness à ouvrir. Le rapport de halt reste factuel, structuré, sans dérive.

## Problèmes détectés

### Bloquants (inchangés depuis 9 reviews, non-adressés)

1. **Hypothèse de stack incorrecte dans `plan.md`** — Node/TS + `src/`. Stack cible réelle confirmée par les tickets antérieurs : Spring Boot Java (T009) + React (T010) ; T016 place la génération PDF côté backend, donc le loader de signature appartient au module backend Java. Ni T009 ni T010 ne sont mergés dans la base de fork de T027.
2. **Dépendance à T009 non déclarée** dans le plan. Aucun `backend/` sur la branche ni sur `ai-dev-factory/bootstrap-agent-layout`. Rien ne permet à un loader Java d'atterrir sur cette branche sans conflit de merge ultérieur.
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override env `TIMIZER_PROVIDER_SIGNATURE_PATH`. Non-idiomatique côté cible.
4. **Layout de fichiers Maven manquant** : fixtures attendues sous `backend/src/test/resources/signature/`, pas sous `src/assets/__fixtures__/`.
5. **0/5 critères d'acceptation satisfaits** après 6 tentatives Coder + 9 reviews :
   - AC1 « Provider signature asset location can be configured » → **absent**.
   - AC2 « PDF generation can access the provider signature asset » → **absent**.
   - AC3 « Missing signature asset is handled clearly » → **absent**.
   - AC4 « Documentation explains how to provide the signature asset » → **absent**.
   - AC5 « Existing tests still pass » → **non vérifiable** (aucune suite applicative n'existe encore).
6. **Plan jamais rejoué** en 6 tentatives Coder + 9 reviews. Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est mécaniquement stérile.
7. **`state.json` figé à `IMPLEMENTATION_REVIEW_NEEDED`** sans transition vers `PLAN_FIX_REQUIRED`. Le harness continue de router `IMPLEMENTATION_FIX_REQUIRED` → `step: coder` au lieu de `step: planner` : **bug workflow avéré sur 6 tentatives Coder consécutives**.
8. **Absence de garde-fou anti-boucle stérile côté harness** : 6 halts identiques ont été acceptés sans mutation matérielle ni escalade hors pipeline automatique. Un compteur « N halts identiques ⇒ escalade externe » aurait dû se déclencher au plus tard au 2ᵉ ou 3ᵉ halt.

### Non bloquants

- **Coût cumulé** : 6 tentatives Coder + 9 reviews sur un état applicatif nul. Chaque itération supplémentaire brûle un budget tokens/CI sans hypothèse d'issue positive.
- **Arbitrage docs-only vs attente T009** à trancher **explicitement dans le plan v2**, pas par déduction Coder. Le Coder a raison de refuser un basculement unilatéral.
- **Rappels pour le replan** : conserver le *single access point* (seul `ProviderSignatureLoader` lit le fichier) ; rappeler que le binaire de signature ne doit jamais être committé ; documenter comme choix explicite l'exposition du chemin résolu dans les messages d'erreur.
- **Duplication d'artefacts** : cette review-9 duplique majoritairement les reviews 1→8. Comportement attendu tant que l'état applicatif ne bouge pas, mais alimente le risque de bruit décrit ci-dessous.

## Risques éventuels

- **Boucle stérile empiriquement démontrée sur 6 tours consécutifs**. La prédiction déterministe du Coder en attempt 5 (« halt #6 identique ») s'est vérifiée. Toute nouvelle itération sur ce plan produira mécaniquement un halt #7 identique. Le canal d'escalade externe doit être déclenché maintenant.
- **Dérive de scope latente** si un opérateur lassé autorise un contournement de la clause d'auto-arrêt — violation cumulée de `refactor-safety`, de la clause explicite du plan, et de `workflow-discipline`. À bloquer.
- **Conflits de merge futurs sur `backend/pom.xml` / layout Maven** si un futur plan crée du code Java avant que T009 soit mergé — d'où l'importance d'arbitrer explicitement docs-only vs attente T009 au replan.
- **Risque documentaire** : T027 n'a livré **aucun AC**. Les artefacts workflow (9 prompts review, 9 reviews, 6 prompts coder, 1 plan, fixes context) ne doivent en aucun cas être confondus avec une livraison — la PR reste **vide de contenu applicatif**.
- **Aucun risque de sécurité immédiat** : rien ajouté, aucun secret exposé, aucune surface d'attaque introduite.
- **Risque d'accumulation d'artefacts stériles** : ~4–13 Ko par cycle sans avancement matériel.

## Décision

- REQUEST_CHANGES

Le halt Coder est correct au sens du rôle (7ᵉ confirmation). Les corrections nécessaires sont côté **Planner** (replan) et côté **harness** (routage `IMPLEMENTATION_FIX_REQUIRED`, garde-fou anti-boucle stérile). Aucune action Coder supplémentaire sur le plan actuel ne peut débloquer la situation.

## Actions demandées

### Priorité 0 — intervention humaine sur le routage (7ᵉ répétition depuis review-3)

- **Suspendre le pipeline automatique sur T027** immédiatement. La stérilité du sous-loop `coder → review` est empiriquement démontrée sur 6 tentatives ; toute itération supplémentaire est pure combustion de budget.
- **Rejouer manuellement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main). Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est stérile.
- Enregistrer (ou confirmer déjà enregistrés) deux bugs workflow distincts **hors T027** :
  1. `IMPLEMENTATION_FIX_REQUIRED` route vers `step: coder` au lieu de `step: planner` lorsque la review demande explicitement un replan (ce bug a produit à lui seul 6 tentatives Coder identiques).
  2. Absence de garde-fou de progression matérielle : le harness accepte des halts consécutifs indéfiniment sans muter le plan ni escalader hors pipeline automatique. Un compteur « N halts identiques ⇒ escalade externe » doit être ajouté (seuil suggéré : N=2 ou 3, pas 6+).

### Priorité 1 — re-planification (à destination du Planner, inchangée depuis review-1)

Les 8 actions listées dans `runs/T027/reviews/review-attempt-1.md` §*Actions demandées* (reprises intégralement en reviews 2→8) restent **strictement valides et non-adressées** :

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

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la sixième fois. Le blocage est côté **routage workflow** (P0, avéré sur 6 tentatives Coder + 9 reviews) **et** côté **Planner** (P1, inchangé depuis 9 reviews).

IMPLEMENTATION_FIX_REQUIRED
