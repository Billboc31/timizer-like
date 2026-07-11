# PR Review — T027 (attempt 7)

## Résumé

Septième review consécutive sur T027. État strictement inchangé depuis review-6 côté livrable applicatif : **zéro fichier applicatif** sur la branche (`git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → vide), **plan byte-identique à `865a769`** (`git diff 865a769 HEAD -- runs/T027/plan.md` → vide), **0/5 critères d'acceptation** satisfaits après 4 tentatives Coder + 7 reviews.

Le Coder a produit son 4ᵉ halt à l'identique (`f3a0975`, 17:41:00 +0200), qu'il qualifie lui-même de « halt terminal », en respectant la clause d'auto-arrêt du plan : *« If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt. »* Le halt est correct côté rôle Coder ; le blocage reste côté **Planner** (plan jamais rejoué) et côté **routage harness** (`IMPLEMENTATION_FIX_REQUIRED` continue de renvoyer sur `step: coder` au lieu de `step: planner`).

Cette review-7 ne peut rien débloquer par elle-même : elle acte que le sous-loop Coder→Review est désormais démontré stérile sur 4 tours consécutifs et maintient l'escalade P0 pour intervention humaine. Décision inchangée : `IMPLEMENTATION_FIX_REQUIRED`.

## Vérifications effectuées

- `git log --oneline -- runs/T027/plan.md` → `865a769 T027: planner checkpoint`, **commit unique**. Plan **jamais** rejoué en 4 tentatives Coder + 7 reviews.
- `git diff 865a769 HEAD -- runs/T027/plan.md` → vide. Aucune mutation du plan depuis le checkpoint initial.
- `git log --oneline -- runs/T027/implementation-output.md` → 4 commits Coder (`19ba7d1`, `6707204`, `4a0b74b`, `f3a0975`). Aucun step Coder intercalé entre review-6 (`1cb54c0`, 17:36:47 +0200) et cette review-7 : le dernier step Coder producteur date de review-5→coder attempt 4 (`f3a0975`, 17:41:00 +0200), antérieur à review-6.
- `git diff 4a0b74b f3a0975 -- runs/T027/implementation-output.md` (analysé côté review-6) → contenu textuel changé, **décision inchangée** (halt #4 = halt #3 = halt #2 = halt #1 côté livrable).
- `git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → **vide**. Zéro fichier applicatif introduit depuis le fork de la branche.
- `git ls-files | grep -v "^runs/T027" | grep -v "^ai/" | grep -v "^docs/ai/" | grep -v "^prompts/generic/" | grep -v "^tickets/"` → uniquement `runs/.gitkeep`. Aucun `backend/`, `pom.xml`, `build.gradle`, `frontend/`, `package.json`, `src/`, `assets/.gitkeep`, `.env.example`, `.gitignore` racine, `docs/provider-signature.md`.
- `git status` : uniquement `runs/T027/daemon.lock` et `runs/T027/runtime.log` modifiés (harness-managed) + `runs/T027/prompts/review-attempt-7.md` untracked (auto-généré pour ce step). Aucun fichier applicatif introduit ou modifié.
- `git branch -a` : `ticket/T009-bootstrap-spring-boot-backend` et `ticket/T010-bootstrap-react-frontend` existent mais restent **non mergés** dans `main` ni dans `ai-dev-factory/bootstrap-agent-layout` (la base de fork de T027). La dépendance implicite du plan v1 sur une stack Node/TS reste factuellement fausse.
- Lecture de `runs/T027/state.json` : `IMPLEMENTATION_REVIEW_NEEDED` figé depuis `2026-07-10T15:41:00Z`. Aucun avancement d'état vers `PLAN_FIX_REQUIRED` malgré 6 reviews qui l'ont demandé.
- Lecture de `runs/T027/workflow-status.md` : dernier step producteur = `coder` 15:41:00Z, sans step `planner` intercalé depuis `2026-07-10T15:11:16Z` (checkpoint initial). Le pattern `coder → review → coder → review …` est respecté par le harness sur les 4 dernières itérations, mais chaque cycle produit un halt à l'identique — la boucle est **productive côté harness** et **stérile côté livrable**.
- Lecture de `runs/T027/implementation-output.md` (attempt 4) : le Coder qualifie explicitement son halt de « terminal » et prédit un halt #5 identique en cas de nouveau `step: coder` sur le même plan. Ce diagnostic est déjà vérifié depuis 4 tentatives et reste vrai.
- Aucun secret, aucun binaire de signature, aucune donnée sensible n'a été ajouté sur les 4 tentatives Coder (respect `security` par vacuité).

## Points validés

- **Auto-arrêt honoré** : le Coder respecte à la lettre la clause d'auto-arrêt du plan (attempt 4, comme les 3 précédents). Aucun basculement unilatéral vers docs-only, aucune traduction Node→Java « à la volée », aucune adaptation silencieuse.
- **`refactor-safety`** : zéro fichier hors périmètre modifié. La branche reste strictement au scaffolding AI Dev Factory + artefacts workflow T027.
- **`workflow-discipline`** côté Coder : mémoire projet non touchée avant validation implémentation ; séparation plan / implémentation / mémoire strictement respectée par le Coder ; `state.json` et `workflow-status.md` non mutés par le Coder (respect du contrat des rôles).
- **`security`** : aucun secret, aucune signature binaire, aucune donnée sensible ajoutée. Le Coder n'ayant rien écrit, aucune surface d'attaque n'a été introduite en 4 tentatives.
- **Escalade explicite maintenue** : le Coder documente clairement (dans `implementation-output.md`) la nature du blocage, la nécessité d'un rejeu Planner, et les deux bugs harness à ouvrir. Le rapport de halt reste factuel, structuré, sans dérive.

## Problèmes détectés

### Bloquants (inchangés depuis 7 reviews, non-adressés)

1. **Hypothèse de stack incorrecte dans `plan.md`** (Node/TS + `src/`). Stack cible confirmée par les tickets antérieurs : Spring Boot Java (T009) + React (T010) ; T016 place la génération PDF côté backend, donc le loader de signature appartient au module backend Java.
2. **Dépendance à T009 non déclarée** dans le plan (T009 non mergé, aucun `backend/` sur cette branche ni sur la base `ai-dev-factory/bootstrap-agent-layout`). Rien ne permet à un loader Java d'atterrir sur cette branche sans conflit de merge ultérieur.
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override env `TIMIZER_PROVIDER_SIGNATURE_PATH`. Non-idiomatique côté cible.
4. **Layout de fichiers Maven manquant** : fixtures attendues sous `backend/src/test/resources/signature/`, pas sous `src/assets/__fixtures__/`.
5. **Aucun critère d'acceptation satisfait — 0/5 après 4 tentatives Coder + 7 reviews** :
   - AC1 « Provider signature asset location can be configured » → **absent** (aucun `application.properties`, aucun `.env.example`).
   - AC2 « PDF generation can access the provider signature asset » → **absent** (aucun loader, aucun accès).
   - AC3 « Missing signature asset is handled clearly » → **absent** (aucune exception typée, aucun code de gestion).
   - AC4 « Documentation explains how to provide the signature asset » → **absent** (aucun `docs/provider-signature.md`).
   - AC5 « Existing tests still pass » → **non vérifiable** (aucune suite de tests applicative n'existe encore sur la branche).
6. **Plan jamais rejoué en 4 tentatives + 7 reviews**. Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est mécaniquement stérile. Le diagnostic « halt terminal » du Coder est vérifié depuis 4 itérations.
7. **`state.json` figé à `IMPLEMENTATION_REVIEW_NEEDED`** depuis 15:41:00Z sans transition vers `PLAN_FIX_REQUIRED`, malgré 6 reviews qui l'ont explicitement demandé. Le harness continue de router `IMPLEMENTATION_FIX_REQUIRED` → `step: coder` au lieu de `step: planner` : **bug workflow avéré sur 4 tentatives consécutives**.

### Non bloquants

- **Single access point côté Java** : à conserver au replan (seul `ProviderSignatureLoader` doit lire le fichier).
- **Arbitrage docs-only vs attente T009** à trancher **explicitement dans le plan v2**, pas par déduction Coder. Le Coder a raison de refuser un basculement unilatéral.
- **Security au replan** : rappeler (a) que le binaire de signature ne doit jamais être committé, (b) que l'exposition du chemin résolu dans les messages d'erreur reste acceptable pour l'usage MVP mais doit être documentée comme choix explicite.
- **Coût du diagnostic répété** : cette review-7 duplique majoritairement la review-6 (elle-même quasi-identique aux reviews 1→5). C'est le comportement attendu tant que l'état applicatif ne bouge pas, mais cela alimente le risque de bruit décrit ci-dessous.

## Risques éventuels

- **Coût cumulé du blocage** : 4 tentatives Coder + 7 reviews + 1 plan sur un état applicatif nul. Chaque itération supplémentaire brûle un budget tokens/CI sans hypothèse d'issue positive tant que le plan n'est pas rejoué.
- **Dérive de scope** latente si un opérateur lassé autorise un contournement de la clause d'auto-arrêt. Ce serait une violation cumulée de `refactor-safety`, de la clause explicite du plan, et de `workflow-discipline`. À bloquer.
- **Conflits de merge sur `backend/pom.xml` / layout Maven** à venir si un futur plan crée du code Java avant que T009 soit mergé — d'où l'importance d'arbitrer explicitement docs-only vs attente T009 au replan.
- **Risque documentaire** : T027 n'a livré **aucun AC**. Les artefacts workflow (7 prompts review, 7 reviews, 4 prompts coder, 1 plan, fixes context) ne doivent en aucun cas être confondus avec une livraison — la PR reste **vide de contenu applicatif**.
- **Aucun risque de sécurité immédiat** : rien n'a été ajouté, aucun secret exposé, aucune surface d'attaque introduite en 4 tentatives.
- **Risque d'oubli d'escalade** : la P0 « intervention humaine » est réitérée pour la 5ᵉ review consécutive (depuis review-3). Le risque est que le harness continue de boucler sans jamais atteindre le canal d'escalade externe. Si un mécanisme d'interruption existe côté opérateur, il doit être déclenché maintenant.

## Décision

- REQUEST_CHANGES

Le halt Coder est correct au sens du rôle (5ᵉ confirmation) ; les corrections nécessaires sont côté **Planner** (replan) et côté **harness** (routage `IMPLEMENTATION_FIX_REQUIRED`, garde-fou anti-boucle stérile). Aucune action Coder supplémentaire sur le plan actuel ne peut débloquer la situation.

## Actions demandées

### Priorité 0 — intervention humaine sur le routage (escalade maintenue depuis review-3, 5ᵉ répétition)

- **Suspendre le pipeline automatique sur T027** jusqu'à intervention humaine. Le Coder a explicitement qualifié le halt #4 de « terminal » ; un halt #5 à l'identique est mécaniquement certain sur le plan actuel — les reviews 5, 6, 7 le confirment.
- **Rejouer manuellement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main). Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est stérile.
- Enregistrer (ou confirmer déjà enregistrés) deux bugs workflow distincts **hors T027** :
  1. `IMPLEMENTATION_FIX_REQUIRED` route vers `step: coder` au lieu de `step: planner` lorsque la review demande explicitement un replan (ce bug a produit à lui seul 4 tentatives Coder identiques).
  2. Absence de garde-fou de progression matérielle : le harness peut accepter 4 halts consécutifs sans muter le plan ni escalader hors pipeline automatique. Un compteur « N halts identiques ⇒ escalade externe » doit être ajouté.

### Priorité 1 — re-planification (à destination du Planner, inchangée depuis review-1)

Les 8 actions listées dans `runs/T027/reviews/review-attempt-1.md` §*Actions demandées* (reprises intégralement en reviews 2→6) restent **strictement valides et non-adressées** :

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

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la quatrième fois. Le blocage est côté **routage workflow** (P0, avéré sur 4 tentatives Coder + 7 reviews) **et** côté **Planner** (P1, inchangé depuis 7 reviews).

IMPLEMENTATION_FIX_REQUIRED
