# PR Review — T007 (attempt #3)

## Résumé

L'implémentation livre bien un endpoint `POST /api/cra` conforme aux critères d'acceptation du ticket : création d'un CRA mensuel avec une entrée par jour calendaire, valeurs par défaut `1`/`0` (semaine/weekend), gestion des doublons idempotente (200 + CRA existant), validation d'entrée (400). Tous les 54 tests passent sous JDK 21 (version déclarée dans `pom.xml:22`). Les déviations par rapport au plan sont documentées et justifiées.

## Vérifications effectuées

- Lecture du plan (`runs/T007/plan.md`), du ticket, du rapport d'implémentation.
- Lecture des sources principales : `MonthlyCraCreationService.java`, `CraController.java`, `CreateCraRequest.java`, `CraDetailsMapper.java`.
- Lecture des tests unitaires (`MonthlyCraCreationServiceTest`, 5 cas) et `@WebMvcTest` (`CraControllerTest`, 6 cas).
- Exécution `mvn test` sous JDK 21 (compatible `pom.xml`) : **54 tests, 0 échec, 0 erreur, BUILD SUCCESS**.
- Diff `git diff 165638e..HEAD --stat` pour l'analyse du périmètre.

## Points validés

- **Endpoint conforme** : `POST /api/cra`, JSON `{"year","month"}`, retourne `CraDetailsDto`, `201`/`200` selon création/existant.
- **Algorithme de génération** : `YearMonth.of(year, month)` + itération 1..lengthOfMonth, `SATURDAY|SUNDAY → 0.0`, sinon `1.0` (`MonthlyCraCreationService.java:69-75`).
- **Idempotence** : `findByMonthAndYear` d'abord ; si présent → renvoyé sans `save` (test `duplicateCallReturnsExistingCraWithoutSaving` couvre le `verify(never()).save(...)`).
- **Validation** : `@NotNull @Min @Max` sur `year (2000..2100)` et `month (1..12)`, tests de mois 13, année 1999, champ manquant, valeur non numérique — tous 400.
- **Réutilisation** : `CraDetailsDto` (T005) et `MonthlyCraReportRepository.findByMonthAndYear` (T004) réutilisés, plan `plan.md:67` autorise.
- **Déviations documentées** : package `com.timizer.backend.cra.*` (au lieu de `com.timizerlike.backend.cra.*`) justifié par le constructeur package-private de `MonthlyCraReport` (T002 non modifiable). Renommage `MonthlyCraCreationService` pour éviter la collision de bean avec `com.timizerlike.cra.service.CraCreationService` préexistant. Arbitrages raisonnables.
- Aucun secret, aucun log de données sensibles, aucun comportement destructif introduit.

## Problèmes détectés

### 1. Artefacts de build committés (hygiène) — Non bloquant

`git ls-files backend/target` remonte **73 fichiers** (`.class`, `.jar`, rapports Surefire XML) sous version. Le commit courant (`feat(T007/workflow): coder — update 78 file(s)`) en ajoute une grosse partie. `.gitignore` n'exclut pas `backend/target/`. La pathologie a été introduite antérieurement (T026, `d1253e3`), donc pas imputable à T007 seul, mais T007 l'aggrave. À traiter dans un ticket dédié (`.gitignore` + `git rm -r --cached backend/target`). Ne bloque pas T007 mais doit être remonté.

### 2. Modifications hors périmètre du plan — Non bloquant

Le plan `plan.md:96` stipule : *"No changes are made to files outside `backend/src/main/java/com/timizerlike/backend/cra/…`, `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`, and the corresponding test directories."*

Or l'implémentation touche également :
- `backend/pom.xml` — ajout `spring-boot-starter-web`, `-data-jpa`, `-validation`, `h2`. Nécessaire (le POM de base n'incluait rien de tout ça).
- `backend/src/main/java/com/timizerlike/cra/TimizerLikeApplication.java` — élargissement `scanBasePackages`, `@EntityScan`, `@EnableJpaRepositories`. Nécessaire pour que le contexte Spring découvre les entités/repo/controller sous `com.timizer.backend.cra.*`.
- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportPersistenceTest.java` — élargissement d'une assertion (`assertThatThrownBy(...).isInstanceOfAny(DataIntegrityViolationException, ConstraintViolationException)`).

Ces déviations sont justifiées (le POM de base était incomplet, le contexte Spring inutilisable en l'état) et documentées dans `implementation-output.md`. Elles violent la lettre du plan mais respectent son esprit : sans elles, `mvn test` échoue. À entériner explicitement par l'orchestrateur.

### 3. Workaround `buildReport`/`splitName` — Observation

`MonthlyCraCreationService.buildReport` remplit les champs `providerFirstName/LastName`, `clientFirstName/LastName`, `clientCompany`, `clientContactEmail` depuis `CraDefaultsProperties` — obligatoire car T002 impose `@NotBlank` dessus. Le naming split (`splitName("Provider Name") → ["Provider","Name"]`) est naïf mais suffisant pour le MVP (aligné avec `plan.md:71-72`, "CRA scoped to a single provider/user in the MVP — no provider ID in the request"). Aucune valeur hardcodée sensible ; les défauts sortent de la config `cra.defaults.*`.

### 4. Course concurrente sur duplication — Observation

Le pattern `findByMonthAndYear` puis `save` n'est pas atomique. Deux `POST /api/cra` concurrents pour la même `(year, month)` pourraient tous deux passer la lecture, puis le second échoue sur `uk_monthly_cra_report_period` avec `DataIntegrityViolationException` non gérée. Hors scope pour l'MVP (mono-utilisateur), mais à noter pour T012+.

### 5. Redondance de `@Import(CraController.class)` — Cosmétique

`CraControllerTest.java:26` ajoute `@Import(CraController.class)` alors que `@WebMvcTest(CraController.class)` déjà présent le monte. Sans conséquence, à nettoyer si opportunité.

## Risques éventuels

- Le repo continue d'accumuler des artefacts `target/`. À chaque ticket la PR diff sera bruitée par des `.class`/`.jar`. Impact reviews futures.
- La compensation `buildReport` couple `MonthlyCraCreationService` à `CraDefaultsProperties`. Quand T026+ introduira des CRA par utilisateur, ce couplage devra être défait — pas un problème aujourd'hui.

## Décision

- APPROVE — les critères d'acceptation du ticket sont satisfaits, les tests passent, les déviations sont justifiées et tracées.

## Actions demandées

1. **Orchestrateur** : ouvrir un ticket de nettoyage `.gitignore` + `git rm -r --cached backend/target` (hygiène repo, pré-existant depuis T026).
2. **Orchestrateur / mémoire projet** : consigner l'arbitrage package (`com.timizer.backend.cra.*` retenu comme package canonique côté backend CRA, en raison de T002/T003/T004) afin que les tickets suivants ne re-débattent pas.
3. **Nettoyage mineur** (peut être fait en follow-up, non bloquant) : retirer `@Import(CraController.class)` redondant dans `CraControllerTest.java:26`.
4. Mémoire projet peut être mise à jour maintenant que l'implémentation est validée.

IMPLEMENTATION_APPROVED
