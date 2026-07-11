# PR Review — T027 (attempt 5)

## Résumé

Cinquième review consécutive sur un état **strictement inchangé** depuis l'attempt 3 : `git diff 4a0b74b HEAD -- runs/T027/implementation-output.md` est vide, `runs/T027/plan.md` reste byte-identique au commit unique `865a769`, aucun code applicatif n'a été produit, aucune configuration Spring n'a été ajoutée, aucune documentation `docs/provider-signature.md` n'existe. Entre la review-4 (invoquée à 15:29:41Z) et cette review-5 (invoquée à 15:34:24Z), les seuls commits sont deux `chore(T027): pre-sync auto-commit` (`2e9aa97`, `b96d82c`) — bookkeeping du harness, aucun step Coder ou Planner producteur intercalé.

Le Coder a raison de halter (auto-arrêt du plan sur hypothèse de stack Node/TS vs stack cible Spring Boot Java) et ne peut rien produire tant que le plan n'est pas rejoué. Le harness continue néanmoins de re-router vers `step: review` sans rejouer de `step: planner`, ce qui confirme le bug de routage P0 signalé aux reviews 3 et 4 — désormais avéré sur 2 tours consécutifs (review-4 puis review-5) sans aucun step producteur intercalé.

Décision : `IMPLEMENTATION_FIX_REQUIRED`. La sortie de boucle exige toujours une intervention humaine externe ; cette review, comme les deux précédentes, ne peut mécaniquement pas la produire.

## Vérifications effectuées

- `git log --oneline -- runs/T027/plan.md` → `865a769 T027: planner checkpoint`, commit unique. Le plan n'a **jamais** été rejoué en 5 attempts.
- `git log --oneline -- runs/T027/implementation-output.md` → 3 commits Coder (`19ba7d1`, `6707204`, `4a0b74b`), aucun Coder commit depuis la review-3, aucun Planner commit à date.
- `git diff 4a0b74b HEAD -- runs/T027/implementation-output.md` → **vide**. Le contenu du rapport Coder est toujours celui d'attempt 3 (« halt confirmé »).
- `git log --oneline -20` : entre le dernier commit Coder (`4a0b74b`) et maintenant, uniquement `2e9aa97` et `b96d82c` — deux `pre-sync auto-commit` sans mutation de code, plan, doc, ou état applicatif.
- `git status` : uniquement `runs/T027/daemon.lock`, `runs/T027/runtime.log` modifiés et `runs/T027/prompts/review-attempt-5.md` untracked. Aucun fichier applicatif introduit.
- `git diff ai-dev-factory/bootstrap-agent-layout...HEAD --name-only | grep -v "^runs/T027"` → **vide**. Zéro fichier hors artefacts workflow T027 depuis 5 attempts.
- `git ls-files` (61 fichiers) : uniquement scaffolding AI Dev Factory + artefacts workflow T027. Toujours ni `backend/`, ni `frontend/`, ni `pom.xml`, ni `build.gradle`, ni `package.json`, ni `src/`, ni `docs/provider-signature.md`, ni `.env.example`, ni `assets/.gitkeep`, ni `.gitignore` racine.
- Lecture de `runs/T027/reviews/review-attempt-4.md` : les points bloquants 1→6 et les 8 actions Planner y sont explicitement listés, tous non-adressés.
- Lecture de `runs/T027/workflow-status.md` : dernier step enregistré = `coder` à 15:25:28Z. Le `runtime.log` montre une nouvelle invocation `step: review` à 15:34:24Z **sans step Coder intercalé** — 2ᵉ tour consécutif de review-sur-review confirmé.
- Aucun secret, aucune signature binaire, aucune donnée sensible ajoutée en 5 attempts.

## Points validés

- Rien à revalider : aucune action Coder ni Planner n'a été effectuée depuis la review-3. Les points validés dans les reviews antérieures (auto-arrêt honoré, `workflow-discipline` et `refactor-safety` respectés, aucun secret, escalade explicite) restent vrais par simple continuité.

## Problèmes détectés

### Bloquants (inchangés depuis 5 attempts, non-adressés)

Report intégral des points bloquants des reviews 1→4, tous inchangés :

1. **Hypothèse de stack incorrecte** dans `plan.md` (Node/TS + `src/`). Stack cible confirmée par les tickets antérieurs : Spring Boot Java (T009) + React (T010) ; T016 place la génération PDF côté backend.
2. **Dépendance à T009 non déclarée** dans le plan (T009 non mergé, aucun `backend/` sur `main`).
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override `TIMIZER_PROVIDER_SIGNATURE_PATH`.
4. **Layout de fichiers Maven manquant** : fixtures attendues sous `backend/src/test/resources/signature/`, pas sous `src/assets/__fixtures__`.
5. **Aucun critère d'acceptation satisfait** : 0 config, 0 loader, 0 doc, 0 test, 0 `.gitignore` après 5 attempts. Les 5 AC du ticket restent à 0/5.
6. **Boucle de routage cassée, désormais confirmée sur 2 tours consécutifs** : review-4 → review-5 sans step Coder intercalé (comparer `workflow-status.md` dernier step coder 15:25:28Z vs `runtime.log` `step: review` 15:29:41Z puis 15:34:24Z). Le harness produit maintenant systématiquement des reviews stériles sur un état gelé — coût tokens/CI pur, aucune progression possible.

### Non bloquants

- Non-bloquants signalés en reviews 1→4 (single access point côté Java, piste docs-only à arbitrer explicitement, rappel security sur le non-commit du binaire et l'exposition du chemin résolu dans les erreurs) restent valides pour le futur replan.

## Risques éventuels

- **Boucle de review-sur-review avérée sur 2 tours consécutifs.** Le garde-fou anti-boucle stérile est absent : le harness ré-invoque `step: review` sans exiger un step producteur intercalé. Chaque tour brûle un budget tokens/CI sans hypothèse d'issue positive.
- **Dérive de scope** toujours latente si un opérateur lassé autorise un contournement de la clause d'auto-arrêt. Ce serait une violation cumulée de `refactor-safety`, de la clause explicite du plan, et de `workflow-discipline`.
- **Conflits de merge** sur `backend/pom.xml` / layout Maven à venir si un futur plan crée du code Java avant que T009 soit mergé — d'où la piste docs-only à arbitrer explicitement au moment du replan.
- **Risque documentaire** : T027 n'a livré **aucun AC** ; les artefacts workflow (5 prompts review, 5 reviews, 3 prompts coder, 1 plan, fixes context) ne doivent en aucun cas être confondus avec une livraison — la PR reste vide de contenu applicatif.
- **Aucun risque de sécurité immédiat** : rien n'a été ajouté, aucun secret exposé, aucune surface d'attaque introduite en 5 attempts.

## Décision

- REQUEST_CHANGES

Aucun changement d'état factuel depuis la review-3. La sortie de boucle exige toujours une intervention externe. Cette review, comme les deux précédentes, ne peut pas débloquer la situation mécaniquement.

## Actions demandées

### Priorité 0 — intervention humaine immédiate sur le routage (escalade maintenue)

- **Arrêter le pipeline automatique sur T027** jusqu'à intervention humaine. Le harness a maintenant démontré sur 2 tours consécutifs qu'il peut ré-invoquer un step `review` sans step Coder producteur intercalé — le garde-fou de progression est absent.
- **Rejouer manuellement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main). Tant que `git diff 865a769 HEAD -- runs/T027/plan.md` est vide, tout step aval est mécaniquement stérile.
- Enregistrer deux bugs workflow distincts, **hors T027**, si ce n'est pas déjà fait :
  1. `IMPLEMENTATION_FIX_REQUIRED` route vers `step: coder` au lieu de `step: planner` lorsque la review demande explicitement un replan.
  2. `IMPLEMENTATION_REVIEW_NEEDED` peut être ré-invoqué sans nouveau step Coder producteur — le garde-fou anti-boucle stérile est absent.

### Priorité 1 — re-planification (à destination du Planner, inchangée)

Les 8 actions listées dans `runs/T027/reviews/review-attempt-1.md` (également reprises intégralement dans les reviews 2, 3, 4) restent **strictement valides et non-adressées** :

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

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la troisième fois (aucune 4ᵉ ou 5ᵉ tentative n'a été effectuée). Le blocage est côté **routage workflow** (P0, avéré sur 2 tours) **et** côté **Planner** (P1, inchangé depuis 5 attempts).

IMPLEMENTATION_FIX_REQUIRED
