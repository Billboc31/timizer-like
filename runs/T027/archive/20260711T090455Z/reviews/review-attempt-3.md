# PR Review — T027 (attempt 3)

## Résumé

Troisième halt consécutif du Coder sur un plan **toujours byte-identique** à sa version initiale (`plan.md` reste sur l'unique commit `865a769`, aucun step planner n'a été rejoué depuis attempt 1). Le Coder honore de nouveau, à raison, la clause d'auto-arrêt du plan (« *If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt.* ») et n'a muté ni code applicatif, ni config, ni doc, ni mémoire, ni state workflow.

La prédiction explicite de la review-2 (« *le troisième halt est mécaniquement garanti* ») s'est réalisée à l'identique. Le blocage n'est plus une hypothèse : c'est un fait workflow reproduit trois fois. Les critères d'acceptation de T027 restent à zéro, et **aucun retry Coder supplémentaire ne peut produire autre chose qu'un quatrième halt tant que `plan.md` n'est pas rejoué**.

Décision : `IMPLEMENTATION_FIX_REQUIRED`, avec escalade renforcée — intervention humaine nécessaire pour forcer un step Planner (ou trancher explicitement un scope docs-only) avant tout nouveau step Coder.

## Vérifications effectuées

- Lecture du ticket `runs/T027/ticket.md` : AC inchangés depuis attempt 1.
- Lecture du plan `runs/T027/plan.md` : hypothèse Node/TS + `src/` toujours en place, clause d'auto-arrêt inchangée.
- `git log --all --oneline -- runs/T027/plan.md` → un seul commit `865a769 T027: planner checkpoint`. Confirmation objective que le plan n'a pas été re-joué.
- Lecture du rapport de halt `runs/T027/implementation-output.md` (attempt 3) : factuel, cite `git log` sur `plan.md`, référence explicite aux deux reviews précédentes, aucune mutation hors du rapport lui-même.
- `git log --oneline -- runs/T027/implementation-output.md` → trois commits `coder — update` (`19ba7d1`, `6707204`, `4a0b74b`), aucun commit `planner` intercalé entre eux. La séquence attendue par la review-1 (`FIX_REQUIRED → planner → coder`) n'a jamais eu lieu.
- `git ls-files` : 57 fichiers, tous du scaffolding AI Dev Factory + artefacts workflow T027. Toujours aucun `backend/`, `frontend/`, `pom.xml`, `package.json`, `src/`.
- `git status` : uniquement `daemon.lock`, `runtime.log`, `prompts/review-attempt-3.md` — artefacts workflow, aucun code applicatif.
- `git branch -a` : `ticket/T009-bootstrap-spring-boot-backend` et `ticket/T010-bootstrap-react-frontend` toujours non mergés dans `main`. La dépendance décrite dans les reviews 1 & 2 reste ouverte.
- Vérification que le Coder n'a muté ni `state.json` ni `workflow-status.md` par lui-même (respect strict de la séparation des rôles).
- Aucun secret, aucune signature binaire, aucune donnée sensible ajoutée — la worktree n'a rien reçu à ce niveau depuis trois attempts.

## Points validés

- Auto-arrêt honoré pour la troisième fois consécutive : le Coder ne traduit pas silencieusement le plan Node/TS en Java. `refactor-safety` et la clause explicite du plan sont respectées.
- `workflow-discipline` respecté : aucune mutation mémoire, aucun bypass, aucun step sauté ; les artefacts workflow sont versionnés.
- Rapport de halt attempt-3 concis, factuel, adossé aux mêmes vérifications objectives qu'en attempt 2 (`git log` sur `plan.md`, absence de commit planner intercalé, plan.md byte-identique).
- Escalade formulée explicitement par le Coder (« *Troisième halt consécutif à l'identique — la review d'attempt 2 avait prédit ce résultat mot pour mot* ») — signalement clair et cohérent avec ce que les reviews précédentes demandaient.
- `security` respecté : rien n'est loggué, rien n'est committé, aucune surface d'attaque introduite.

## Problèmes détectés

### Bloquants (inchangés depuis attempt 1, non-adressés depuis 3 attempts)

Les 5 points bloquants énoncés en attempt 1 sont **strictement identiques** puisque le plan reste byte-identique :

1. **Hypothèse de stack incorrecte** dans `plan.md` (Node/TS + `src/`). La stack cible est Spring Boot Java (T009) + React (T010) ; T016 place la génération PDF côté backend. Un loader `src/…/*.ts` serait du code mort.
2. **Dépendance à T009 non déclarée** dans le plan.
3. **Modèle de configuration inadapté à Spring** : `PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")` + override `TIMIZER_PROVIDER_SIGNATURE_PATH`.
4. **Layout de fichiers Maven manquant** : `src/assets/__fixtures__` inexistant ; fixtures à placer sous `backend/src/test/resources/signature/`.
5. **Aucun critère d'acceptation satisfait** : 0 config, 0 loader, 0 doc, 0 test après trois attempts.

### Bloquant confirmé — routage workflow

6. **Boucle de routage cassée, désormais confirmée par la reproduction.** La transition observée est `IMPLEMENTATION_FIX_REQUIRED → step: coder → halt → IMPLEMENTATION_REVIEW_NEEDED`, répétée trois fois de suite. La review-2 avait exigé explicitement un retour Planner ; le harness a de nouveau routé vers le Coder. Cette boucle ne se cassera pas sans intervention externe (rejouer manuellement un step planner sur `plan.md`, ou modifier la politique de routage).

### Non bloquants

- Le principe *single access point* du plan à conserver côté Java lors du replan (déjà noté attempts 1 & 2).
- La piste "docs-only" (livrer `docs/provider-signature.md` + `.gitignore` + `assets/.gitkeep` + conventions de clé de config, sans code Java, en attendant T009) reste une porte de sortie **si** T027 doit avancer avant que T009 soit mergé. À trancher **explicitement** par le Planner ou un opérateur humain, pas à la volée par le Coder.
- Rappel security à intégrer au replan : signature jamais committée ni loggée, chemin résolu potentiellement visible dans les messages d'erreur (acceptable, à documenter comme choix explicite).

## Risques éventuels

- **Boucle de halts confirmée en régime permanent.** Trois halts identiques constatés. Sans intervention sur le routage ou sur `plan.md`, l'attempt 4 sera un quatrième halt à l'identique. Chaque nouveau tour brûle des budgets tokens/CI pour un résultat prévisible.
- **Dérive de scope si un opérateur lassé bypass la clause d'auto-arrêt** en autorisant le Coder à traduire mentalement Node → Java sans replan. Ce serait une violation directe de `refactor-safety` et de la clause explicite du plan, et livrerait du code Java potentiellement en conflit avec T009 (packaging, `pom.xml`, layout de package).
- **Conflits de merge sur `backend/pom.xml` / layout Maven** si un nouveau plan crée du code Java avant que T009 soit mergé — raison pour laquelle l'option docs-only doit être arbitrée explicitement.
- **Risque documentaire** : si le blocage persiste et qu'un futur ticket cite T027 comme "livré" via ses artefacts workflow, il faudra faire attention à ne pas mémoriser cette pseudo-livraison comme un fait. À ce jour, T027 n'a livré aucun AC.
- **Aucun risque de sécurité immédiat** : rien n'a été ajouté, aucun secret n'est exposé, aucune surface d'attaque n'a été introduite en trois attempts.

## Décision

- REQUEST_CHANGES

Halt du Coder conforme (encore une fois). Blocage réel toujours côté **routage workflow** + **plan non révisé**. Aucune sortie de boucle possible sans intervention explicite.

## Actions demandées

### Priorité 0 — intervention humaine sur le routage (nouvelle escalade)

- **Bloquer tout retry Coder automatique** tant que `runs/T027/plan.md` reste byte-identique au commit `865a769`. Un test simple : si `git diff 865a769 HEAD -- runs/T027/plan.md` est vide, refuser le step coder et rejouer un step planner à la place.
- **Rejouer explicitement un step Planner** sur `runs/T027/plan.md` (ou remplacer le plan à la main, si l'automatisation ne peut pas être forcée à le faire). Sans cette étape, la boucle continue.
- Enregistrer le bug de routage (`IMPLEMENTATION_FIX_REQUIRED` renvoyant vers `step: coder` au lieu de `step: planner` quand la review demande explicitement un replan) comme un ticket workflow à traiter séparément — le corriger dans le harness évitera de reproduire cette boucle sur d'autres tickets.

### Priorité 1 — re-planification (à destination du Planner)

Les 8 actions listées dans la section « Actions demandées » de `runs/T027/reviews/review-attempt-1.md` restent **intégralement valides** et non-adressées après trois attempts. Résumé opérationnel inchangé :

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
7. Vérifier / prévoir `backend/.gitignore` pour `assets/provider-signature.*` (ou emplacement plus proche de Spring à trancher).
8. Rappeler dans le plan que la mémoire projet ne sera mise à jour qu'après validation implémentation (respect `workflow-discipline`).

Rien à corriger côté Coder : sa décision d'arrêt reste conforme pour la troisième fois. Le blocage est côté **routage workflow** (priorité 0) **et** côté **Planner** (priorité 1).

IMPLEMENTATION_FIX_REQUIRED
