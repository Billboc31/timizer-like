# PR Review — T027 (attempt 6)

## Résumé

Sixième review consécutive sur T027. Depuis la review-5, un nouveau step Coder a bien été intercalé (`f3a0975`, 15:41:00Z, « attempt 4 : halt terminal ») — la boucle *review-sur-review* stérile observée entre reviews 4 et 5 est donc rompue sur ce tour. En revanche, **le plan reste byte-identique à `865a769`** (`git diff 865a769 HEAD -- runs/T027/plan.md` → vide) et **aucun fichier applicatif** n'a été ajouté (`git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → vide, `git ls-files` → 66 fichiers, tous scaffolding AI Dev Factory + artefacts workflow T027).

Le Coder a de nouveau halté conformément à la clause d'auto-arrêt du plan : *« If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt. »* La stack cible du plan (Node/TS + `src/`) n'existe pas sur la branche ; la stack projet réelle (Spring Boot Java via T009, React via T010) n'est pas mergée. Ce halt (le 4ᵉ à l'identique) est donc **correct côté rôle Coder** — le blocage est côté **Planner**, qui n'a jamais rejoué de step sur `plan.md` malgré 6 reviews demandant un replan.

Les 5 critères d'acceptation du ticket restent à **0/5** après 4 tentatives Coder + 6 reviews. Décision maintenue : `IMPLEMENTATION_FIX_REQUIRED`. La sortie de boucle exige toujours une intervention externe pour rejouer un step Planner (ou arbitrer une réduction de scope à docs-only).

## Vérifications effectuées

- `git log --oneline -- runs/T027/plan.md` → `865a769 T027: planner checkpoint`, **commit unique**. Plan jamais rejoué en 4 tentatives + 6 reviews.
- `git log --oneline -- runs/T027/implementation-output.md` → 4 commits Coder (`19ba7d1`, `6707204`, `4a0b74b`, `f3a0975`). Le dernier (`f3a0975`, 15:41:00Z) confirme un step Coder intercalé entre review-5 et cette review-6 — la boucle *review-sur-review* est cassée sur ce tour.
- `git diff 4a0b74b f3a0975 -- runs/T027/implementation-output.md` → **contenu textuel changé, décision inchangée**. Le Coder documente son 4ᵉ halt (« halt terminal »), maintient l'escalade P0, ne mute ni code, ni config, ni docs, ni mémoire, ni state applicatif.
- `git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → **vide**. Zéro fichier applicatif introduit depuis le fork de la branche.
- `git ls-files` → 66 fichiers, uniquement scaffolding AI Dev Factory (`ai/`, `docs/ai/`, `prompts/generic/`, `tickets/.gitkeep`, `runs/.gitkeep`) + artefacts workflow T027. Toujours **absents** : `backend/`, `pom.xml`, `build.gradle`, `frontend/`, `package.json`, `src/`, `assets/.gitkeep`, `.env.example`, `.gitignore` racine, `docs/provider-signature.md`.
- `git status` : uniquement `runs/T027/daemon.lock`, `runs/T027/runtime.log` modifiés (harness-managed) + `runs/T027/prompts/review-attempt-6.md` untracked (auto-généré pour ce step). Aucun fichier applicatif introduit ou modifié.
- Lecture de `runs/T027/implementation-output.md` (attempt 4) : le Coder qualifie explicitement ce halt de « terminal » et prédit qu'un step Coder supplémentaire sur le même plan produirait un halt #5 identique.
- Lecture de `runs/T027/workflow-status.md` : dernier step producteur = `coder` 15:41:00Z, précédé de `review` 15:36:47Z, `coder` 15:25:28Z, etc. Le pattern `coder → review → coder → review …` est désormais bien respecté (progression alternée sur ce tour), mais chaque itération produit un halt à l'identique — la boucle est *productive côté harness* mais *stérile côté livrable*.
- Croisement plan ↔ tickets antérieurs (T009 Spring Boot Java, T010 React, T016 génération PDF côté backend) : confirme que la stack cible du plan est incorrecte. La dépendance à T009 n'est toujours pas déclarée dans le plan.
- Aucun secret, aucun binaire de signature, aucune donnée sensible ajoutée sur les 4 tentatives Coder.

## Points validés

- **Auto-arrêt honoré** : le Coder respecte la clause explicite du plan (attempt 4, comme les 3 précédents). Aucun basculement unilatéral vers docs-only, aucune dérive de scope, aucun refactor sauvage.
- **`refactor-safety`** : zéro fichier hors périmètre modifié. La branche reste strictement au scaffolding AI Dev Factory + artefacts workflow.
- **`workflow-discipline`** : mémoire projet non touchée avant validation implémentation ; la séparation plan / implémentation / mémoire est respectée par le Coder.
- **`security`** : aucun secret, aucune signature binaire, aucune donnée sensible ajoutée. Le Coder n'ayant rien écrit, aucune surface d'attaque n'est introduite.
- **Sortie du sous-loop review-sur-review** : contrairement au tour 5, un step Coder producteur (au sens harness) a bien été intercalé entre review-5 et review-6 — le garde-fou de progression alternée est respecté sur ce tour. Reste que le step producteur ne produit rien d'applicatif.

## Problèmes détectés

### Bloquants (inchangés depuis 6 reviews, non-adressés)

1. **Hypothèse de stack incorrecte dans `plan.md`** (Node/TS + `src/`). Stack cible confirmée par les tickets antérieurs : Spring Boot Java (T009) + React (T010) ; T016 place la génération PDF côté backend.
2. **Dépendance à T009 non déclarée** dans le plan (T009 non mergé, aucun `backend/` sur cette branche ni sur la base `ai-dev-factory/bootstrap-agent-layout`).
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override env `TIMIZER_PROVIDER_SIGNATURE_PATH`.
4. **Layout de fichiers Maven manquant** : fixtures attendues sous `backend/src/test/resources/signature/`, pas sous `src/assets/__fixtures__/`.
5. **Aucun critère d'acceptation satisfait — 0/5 après 4 tentatives** :
   - AC1 « Provider signature asset location can be configured » → **absent** (aucun `application.properties`, aucun `.env.example`).
   - AC2 « PDF generation can access the provider signature asset » → **absent** (aucun loader, aucun accès).
   - AC3 « Missing signature asset is handled clearly » → **absent** (aucune exception typée, aucun code de gestion).
   - AC4 « Documentation explains how to provide the signature asset » → **absent** (aucun `docs/provider-signature.md`).
   - AC5 « Existing tests still pass » → **non vérifiable** (aucune suite de tests applicative n'existe encore sur la branche).
6. **Plan jamais rejoué en 4 tentatives + 6 reviews**. Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est mécaniquement stérile. Le Coder qualifie lui-même son 4ᵉ halt de « terminal » et prédit un halt #5 identique en cas de nouvelle invocation sur le même plan.

### Non bloquants

- **Single access point côté Java** : à conserver au replan (seul `ProviderSignatureLoader` doit lire le fichier).
- **Docs-only à arbitrer explicitement** au moment du replan : si T027 doit avancer avant T009, réduire le scope à `docs/provider-signature.md` + `.gitignore` + convention de clé de config, sans code Java. Ce choix doit être **explicite dans le plan v2**, pas déduit par le Coder.
- **Security au replan** : rappeler (a) que le binaire de signature ne doit jamais être committé, (b) que l'exposition du chemin résolu dans les messages d'erreur reste acceptable pour l'usage MVP mais doit être documentée.

## Risques éventuels

- **Coût cumulé du blocage** : 4 tentatives Coder + 6 reviews + 1 plan sur un même état applicatif nul. Chaque itération supplémentaire brûle un budget tokens/CI sans hypothèse d'issue positive tant que le plan n'est pas rejoué. Le Coder l'a explicitement qualifié de « halt terminal ».
- **Dérive de scope** toujours latente si un opérateur lassé autorise un contournement de la clause d'auto-arrêt. Ce serait une violation cumulée de `refactor-safety`, de la clause explicite du plan, et de `workflow-discipline`.
- **Conflits de merge sur `backend/pom.xml` / layout Maven** à venir si un futur plan crée du code Java avant que T009 soit mergé — d'où l'importance d'arbitrer explicitement docs-only vs attente T009 au replan.
- **Risque documentaire** : T027 n'a livré **aucun AC**. Les artefacts workflow (6 prompts review, 6 reviews, 4 prompts coder, 1 plan, fixes context) ne doivent en aucun cas être confondus avec une livraison — la PR reste **vide de contenu applicatif**.
- **Aucun risque de sécurité immédiat** : rien n'a été ajouté, aucun secret exposé, aucune surface d'attaque introduite en 4 tentatives.

## Décision

- REQUEST_CHANGES

Le halt Coder est correct au sens du rôle ; les corrections nécessaires sont côté **Planner** (replan) et côté **harness** (routage `IMPLEMENTATION_FIX_REQUIRED`). Aucune action Coder supplémentaire sur le plan actuel ne peut débloquer la situation.

## Actions demandées

### Priorité 0 — intervention humaine sur le routage (escalade maintenue depuis review-3)

- **Suspendre le pipeline automatique sur T027** jusqu'à intervention humaine. Le Coder a explicitement qualifié le halt #4 de « terminal » ; un halt #5 à l'identique est mécaniquement certain sur le plan actuel.
- **Rejouer manuellement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main). Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` reste vide, tout step Coder aval est stérile.
- Enregistrer (ou confirmer déjà enregistrés) deux bugs workflow distincts **hors T027** :
  1. `IMPLEMENTATION_FIX_REQUIRED` route vers `step: coder` au lieu de `step: planner` lorsque la review demande explicitement un replan (ce bug a produit à lui seul 4 tentatives Coder identiques).
  2. Absence de garde-fou de progression matérielle : le harness peut accepter 4 halts consécutifs sans muter le plan ni escalader hors pipeline automatique.

### Priorité 1 — re-planification (à destination du Planner, inchangée depuis review-1)

Les 8 actions listées dans `runs/T027/reviews/review-attempt-1.md` §*Actions demandées* (reprises intégralement en reviews 2→5) restent **strictement valides et non-adressées** :

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

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la quatrième fois. Le blocage est côté **routage workflow** (P0, avéré sur 4 tentatives) **et** côté **Planner** (P1, inchangé depuis 6 reviews).

IMPLEMENTATION_FIX_REQUIRED
