# PR Review — T027 (attempt 1)

## Résumé

Le Coder a **halté** l'implémentation avant tout changement, en invoquant la clause d'auto-arrêt du plan : *"If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt."* L'analyse du Coder est **correcte** — la stack hypothétique (Node/TS + `src/`) ne correspond pas à la stack réelle du projet (Spring Boot backend Java + React frontend). Le halt est le bon comportement au regard du plan actuel.

Cependant, un halt ne satisfait aucun critère d'acceptation du ticket T027 (aucun code, aucune config, aucune doc). Le blocage se situe au niveau du **plan**, qui doit être ré-instruit avec la stack correcte et une dépendance explicite à T009. La décision est donc `IMPLEMENTATION_FIX_REQUIRED`, l'action attendue étant un **retour au Planner**, pas une reprise du Coder sur le plan actuel.

## Vérifications effectuées

- Lecture du ticket `runs/T027/ticket.md` et des critères d'acceptation.
- Lecture du plan `runs/T027/plan.md` (hypothèse Node/TS explicitement posée, clause d'auto-arrêt présente).
- Lecture du rapport de halt `runs/T027/implementation-output.md`.
- Vérification de l'arbre de la worktree : seule la scaffolding AI Dev Factory est présente sur la branche T027, aucun code applicatif.
- Vérification via `git branch -a` : `ticket/T009-bootstrap-spring-boot-backend` et `ticket/T010-bootstrap-react-frontend` existent mais ne sont pas mergés dans `main`. Aucun `pom.xml` / `build.gradle` / `package.json` n'existe sur `main`.
- Inspection de `ticket/T009` (Spring Boot / Java sous `backend/`) et du ticket T016 (générateur PDF placé côté backend) — confirme que le loader de signature appartient à la stack Java, pas Node/TS.
- Confirmation qu'aucun fichier n'a été modifié par le Coder (`git status` propre côté application, seuls les artefacts workflow ont bougé).
- Confirmation que ni `state.json` ni `workflow-status.md` n'ont été mutés par le Coder (respect de la séparation des rôles).

## Points validés

- Respect du contrat du plan : la clause d'auto-arrêt en cas de stack falsifiée a été honorée à la lettre.
- Respect de `refactor-safety` : aucun refactor implicite, aucune tentative d'adaptation silencieuse vers Java.
- Respect de `workflow-discipline` : aucune mutation de la mémoire, aucune mutation d'état workflow, aucun bypass de la boucle plan → code → review.
- Rapport de halt clair, factuel, avec les vérifications effectuées et une proposition de correctif structurée (nouvelle stack, dépendance T009, layout Spring, `@ConfigurationProperties`).
- Aucun secret / signature binaire committé (rien n'a été committé, mais la vigilance security était rappelée dans le plan).
- La proposition du Planner de faire échouer proprement l'accès manquant à la signature (typé, avec chemin résolu) reste alignée avec le ticket : le Coder l'a validée et propose de la conserver.

## Problèmes détectés

### Bloquants (au niveau du plan, pas de l'implémentation)

1. **Hypothèse de stack incorrecte.** Le plan cible `src/config/signature.ts`, `src/assets/providerSignature.ts`, `.env.example`. Le backend cible est Java/Spring Boot (ticket T009), et le générateur PDF (T016) — consommateur direct de cette signature — vit côté backend. Le code TypeScript serait mort.
2. **Dépendance manquante à T009.** Le plan ne déclare pas que T027 dépend de la présence d'un projet backend. Sur `main`, aucun `backend/` n'existe. Le Coder n'a nulle part où déposer un loader Java, ni de test runner câblé (JUnit).
3. **Modèle de configuration inadapté à Spring.** `PROVIDER_SIGNATURE_PATH` en variable d'environnement pure ignore les conventions Spring (`@ConfigurationProperties`, `application.properties` / `application.yml`, override par variable d'environnement). Un `timizer.provider-signature.path` est plus idiomatique et testable.
4. **Layout de fichiers erroné.** `src/assets/__fixtures__/signature.png` n'existe pas dans une arborescence Maven ; les fixtures doivent aller sous `backend/src/test/resources/...`.
5. **Aucun critère d'acceptation satisfait.** À ce stade, ni la configuration, ni le loader, ni la doc, ni les tests ne sont livrés. L'implémentation est vide.

### Non bloquants / observations

- Le principe *"single access point"* du plan (point 8 des AC) est bon et doit être conservé côté Java (une seule classe `ProviderSignatureLoader` qui lit le fichier ; le reste du code appelle son API).
- Le refus explicite de "silent fallback" en MVP est aligné avec le ticket (« fail clearly OR render a documented placeholder » — le plan choisit *fail clearly* de manière explicite, ce qui est conforme).
- Si T027 doit avancer avant que T009 soit mergé, un plan "docs-only" scope réduit est envisageable (voir *Actions demandées*), mais il faut le décider explicitement.

## Risques éventuels

- **Risque de dérive de scope** si le Coder reprend le plan actuel sans replan : traduction "à la volée" Node → Java, avec choix de config / packaging non revus. À bloquer.
- **Risque de couplage silencieux à T009** : si un nouveau plan crée `backend/src/main/java/...` alors que T009 n'est pas mergé, on introduit des conflits de merge sur `backend/pom.xml` et le layout de package. À arbitrer explicitement (attendre T009, ou livrer un scope docs-only sans code Java).
- **Risque sécurité mineur** à surveiller lors du replan : la doc doit rappeler que le fichier signature ne doit pas être committé ni loggé, et que le chemin résolu peut apparaître dans les messages d'erreur — c'est acceptable, mais à documenter comme choix explicite.
- **Aucun risque d'incident immédiat** puisque rien n'a été modifié dans le code.

## Décision

- REQUEST_CHANGES

Le halt du Coder est correct au regard du plan actuel, mais les critères d'acceptation du ticket restent non couverts. Le workflow doit repartir vers le Planner, pas vers un nouveau tour de Coder sur le plan existant.

## Actions demandées

À destination du Planner (ré-instruction du plan) :

1. Remplacer l'hypothèse Node/TS par la stack confirmée : **Spring Boot backend Java** ; le loader de signature appartient au module `backend/`.
2. Déclarer explicitement la dépendance : **T009 (bootstrap backend) doit être mergé avant que T027 puisse livrer du code Java**. Si T027 doit avancer avant T009, réduire le scope du plan à un livrable "docs-only" : `docs/provider-signature.md`, entrée `.gitignore` pour `assets/provider-signature.*`, `assets/.gitkeep`, conventions de clé de configuration. Le loader Java + tests deviennent un sous-ticket bloqué par T009.
3. Ré-écrire la liste de fichiers dans le layout Maven :
   - `backend/src/main/java/com/timizer/backend/signature/ProviderSignatureProperties.java` (`@ConfigurationProperties("timizer.provider-signature")`)
   - `backend/src/main/java/com/timizer/backend/signature/ProviderSignatureLoader.java`
   - `backend/src/main/java/com/timizer/backend/signature/ProviderSignatureAssetException.java`
   - `backend/src/main/resources/application.properties` : clé `timizer.provider-signature.path` (avec override env `TIMIZER_PROVIDER_SIGNATURE_PATH`)
   - `backend/src/test/java/com/timizer/backend/signature/ProviderSignatureLoaderTest.java`
   - Fixtures : `backend/src/test/resources/signature/valid.png`, `valid.jpg`, `not-an-image.txt`
4. Conserver la décision "fail clearly avec exception typée portant `resolvedPath` et `reason`" — elle est saine et alignée avec le ticket.
5. Conserver le principe *single access point* : seul `ProviderSignatureLoader` lit le fichier ; toute autre couche l'appelle.
6. Documenter dans `docs/provider-signature.md` : emplacement par défaut, override par propriété / variable d'environnement, formats supportés (PNG/JPEG), comportement en cas d'absence, rappel que le binaire n'est pas committé.
7. Ajouter au plan la vérification explicite que `backend/.gitignore` (déjà présent sur `ticket/T009`) inclut le pattern `assets/provider-signature.*`, ou proposer un emplacement plus proche de Spring (`backend/config/` ou similaire) à trancher.
8. Reconfirmer dans le plan que la nouvelle version n'introduit aucun appel au fichier signature en dehors du loader, et que la mémoire projet ne sera mise à jour qu'après validation de l'implémentation (respect de `workflow-discipline`).

Rien à corriger côté Coder : sa décision d'arrêt est conforme au plan et aux skills. La balle est chez le Planner.

IMPLEMENTATION_FIX_REQUIRED
