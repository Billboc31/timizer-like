# PR Review — T027 (attempt 4)

## Résumé

Quatrième review consécutive sur un état **strictement inchangé** depuis l'attempt 3 : aucun step Planner rejoué, `runs/T027/plan.md` toujours byte-identique au commit unique `865a769`, `implementation-output.md` toujours daté « attempt 3 : halt confirmé », aucun nouveau code, aucune nouvelle config, aucune nouvelle doc. Le workflow a ré-invoqué un `step: review` sans qu'aucune action Coder ou Planner n'ait produit de mutation entre la review-3 (commit `2e9aa97`, 15:29Z) et cette nouvelle invocation (15:29:41Z).

Il n'y a donc **rien de neuf à examiner**. Les conclusions des reviews 1, 2 et 3 restent intégralement valides et non-adressées : le Coder halte à raison sur la clause d'auto-arrêt du plan (stack hypothétique Node/TS vs stack réelle Spring Boot Java), aucun critère d'acceptation du ticket n'est satisfait, et la boucle de routage `IMPLEMENTATION_FIX_REQUIRED → step: coder → halt → IMPLEMENTATION_REVIEW_NEEDED → step: review → IMPLEMENTATION_FIX_REQUIRED` s'auto-alimente maintenant sans même produire de nouveau step Coder intercalé.

Décision : `IMPLEMENTATION_FIX_REQUIRED`, escalade **P0** encore renforcée — la boucle de review-sur-review sans action intermédiaire indique un routage workflow définitivement cassé qui requiert une intervention humaine immédiate.

## Vérifications effectuées

- `git log --all --oneline -- runs/T027/plan.md` → un seul commit `865a769 T027: planner checkpoint`. Le plan n'a **jamais** été rejoué en 4 attempts.
- `git log --oneline -- runs/T027/implementation-output.md` → trois commits Coder (`19ba7d1`, `6707204`, `4a0b74b`), aucun commit Planner intercalé, contenu du fichier toujours daté « attempt 3 ».
- Lecture de `runs/T027/implementation-output.md` : identique au contenu déjà audité en review-3. Le Coder n'a rien touché entre les deux invocations de review.
- `git status` : uniquement `daemon.lock` et `runtime.log` modifiés + `runs/T027/prompts/review-attempt-4.md` (artefacts workflow, aucun code applicatif).
- `git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → **vide**. Zéro fichier hors des artefacts workflow T027 n'a été ajouté ni modifié sur cette branche.
- `git ls-files` : uniquement scaffolding AI Dev Factory + artefacts workflow T027. Toujours ni `backend/`, ni `frontend/`, ni `pom.xml`, ni `build.gradle`, ni `package.json`, ni `src/`.
- Lecture de `runs/T027/reviews/review-attempt-3.md` : les 8 actions Planner + la P0 d'intervention humaine sur le routage y sont explicitement listées et restent non-adressées.
- Lecture de `runs/T027/workflow-status.md` : dernier step enregistré = `coder` à 15:25:28Z ; le runtime.log montre une nouvelle invocation `step: review` à 15:29:41Z sans step Coder intercalé — la boucle se resserre.
- Vérification que le Coder n'a muté ni `state.json` ni `workflow-status.md` depuis la review-3.
- Aucun secret, aucune signature binaire, aucune donnée sensible ajoutée en 4 attempts.

## Points validés

- Rien à revalider : aucune action Coder ni Planner n'a été effectuée depuis la review-3. Les points validés en review-3 (auto-arrêt honoré, `workflow-discipline` et `refactor-safety` respectés, aucun secret, escalade explicite) restent vrais par simple continuité.

## Problèmes détectés

### Bloquants (inchangés depuis 4 attempts, non-adressés)

Report intégral des 5 points bloquants de la review-1 (contenu du plan) + du point 6 (routage), tous inchangés :

1. **Hypothèse de stack incorrecte** dans `plan.md` (Node/TS + `src/`). Stack cible confirmée : Spring Boot Java (T009) + React (T010) ; T016 place la génération PDF côté backend.
2. **Dépendance à T009 non déclarée** dans le plan (T009 non mergé, aucun `backend/` sur `main`).
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override `TIMIZER_PROVIDER_SIGNATURE_PATH`.
4. **Layout de fichiers Maven manquant** : fixtures à placer sous `backend/src/test/resources/signature/`, pas sous `src/assets/__fixtures__`.
5. **Aucun critère d'acceptation satisfait** : 0 config, 0 loader, 0 doc, 0 test après 4 attempts.
6. **Boucle de routage cassée, désormais aggravée** : la review-4 s'exécute sans même un step Coder intercalé depuis la review-3 (comparer les timestamps `workflow-status.md` 15:25:28Z coder et `runtime.log` 15:29:41Z review). Le harness produit maintenant des reviews stériles sur un état gelé — coût de tokens/CI pur, aucune progression possible.

### Non bloquants

- Les non-bloquants signalés en reviews 1/2/3 (principe *single access point* côté Java, piste docs-only à arbitrer explicitement, rappel security sur le non-commit du binaire et l'exposition du chemin résolu dans les erreurs) restent valides pour le futur replan.

## Risques éventuels

- **Boucle de review-sur-review confirmée.** Sans step Coder intercalé, la review n'apporte aucune information nouvelle et pourtant elle re-consomme le pipeline. Chaque tour brûle un budget tokens/CI sans hypothèse d'issue positive.
- **Dérive de scope** toujours latente si un opérateur lassé autorise un contournement de la clause d'auto-arrêt. Ce serait une violation de `refactor-safety`, de la clause explicite du plan et de `workflow-discipline`.
- **Conflits de merge** sur `backend/pom.xml` / layout Maven à venir si un futur plan crée du code Java avant que T009 soit mergé — d'où la piste docs-only à arbitrer explicitement.
- **Risque documentaire** : T027 n'a livré **aucun AC** ; les artefacts workflow ne doivent pas être confondus avec une livraison.
- **Aucun risque de sécurité immédiat** : rien n'a été ajouté, aucun secret exposé, aucune surface d'attaque introduite en 4 attempts.

## Décision

- REQUEST_CHANGES

Aucun changement d'état factuel depuis la review-3. La sortie de boucle exige toujours une intervention externe. Cette review ne peut, à elle seule, débloquer la situation.

## Actions demandées

### Priorité 0 — intervention humaine immédiate sur le routage (escalade renforcée vs review-3)

- **Arrêter le pipeline automatique sur T027** jusqu'à intervention humaine. Le harness a maintenant démontré qu'il peut ré-invoquer un step `review` sans step Coder intercalé — c'est une régression du garde-fou de progression.
- **Rejouer manuellement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main). Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` est vide, tout step aval est mécaniquement stérile.
- Enregistrer deux bugs workflow distincts, **hors T027** :
  1. `IMPLEMENTATION_FIX_REQUIRED` route vers `step: coder` au lieu de `step: planner` quand la review demande explicitement un replan.
  2. `IMPLEMENTATION_REVIEW_NEEDED` peut être ré-invoqué sans nouveau step Coder producteur — le garde-fou anti-boucle stérile est absent.

### Priorité 1 — re-planification (à destination du Planner, inchangée)

Les 8 actions listées dans `runs/T027/reviews/review-attempt-1.md` (également reprises intégralement dans les reviews 2 et 3) restent **strictement valides et non-adressées** :

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

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la troisième fois (aucune 4ᵉ tentative n'a même été effectuée). Le blocage est côté **routage workflow** (P0, aggravé) **et** côté **Planner** (P1, inchangé).

IMPLEMENTATION_FIX_REQUIRED
