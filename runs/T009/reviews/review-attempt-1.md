# PR Review

## Résumé

Implémentation d'un bootstrap Spring Boot 3.3.5 minimal sous `backend/`, en Java 21, exposant `GET /health` (custom) + `/actuator/health`. Le périmètre correspond strictement au ticket T009 et au plan approuvé. Aucun fichier hors `backend/` n'est modifié (seuls les artefacts de workflow sous `runs/T009/` sont ajoutés). Faute de JDK dans cet environnement, les critères d'acceptation runtime (`./mvnw spring-boot:run`, `curl /health`, `package`) n'ont pas pu être exécutés ; l'analyse est statique. Aucun problème bloquant détecté.

## Vérifications effectuées

- Lecture intégrale des fichiers créés sous `backend/`.
- Comparaison ligne à ligne avec `runs/T009/plan.md` (Included / Excluded / Acceptance criteria).
- Comparaison avec `runs/T009/ticket.md` (Description / Out of Scope / Acceptance Criteria).
- `git diff a3fedd6~1..a3fedd6 --stat` pour confirmer le périmètre des modifications.
- Vérification que `mvnw` est exécutable (`-rwxr-xr-x`).
- Vérification que `.mvn/wrapper/` ne nécessite pas de `maven-wrapper.jar` (Apache Maven Wrapper 3.3.2 est le variant "script-only" qui télécharge Maven depuis `distributionUrl`).
- Vérification que `mvnw.cmd` invoque bien `mvnw.ps1` → justifie l'ajout de `mvnw.ps1` par le coder.
- Contrôle de l'absence de secrets, de logs sensibles, ou d'endpoints Actuator sur-exposés.
- Contrôle du respect strict du scope "Out of Scope" (aucune trace de JPA, Flyway, sécurité, PDF, domaine CRA, tests, Docker, CI).

## Points validés

- **Structure conforme au plan** : `backend/pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`, `src/main/java/com/timizer/backend/TimizerBackendApplication.java`, `src/main/java/com/timizer/backend/health/HealthController.java`, `src/main/resources/application.properties`, `.gitignore`, `README.md`.
- **`pom.xml`** : parent `spring-boot-starter-parent:3.3.5`, `groupId=com.timizer`, `artifactId=timizer-backend`, `version=0.0.1-SNAPSHOT`, `packaging=jar`, `java.version=21`, dépendances `spring-boot-starter-web` et `spring-boot-starter-actuator`, plugin `spring-boot-maven-plugin`. Aucune dépendance hors périmètre.
- **`TimizerBackendApplication`** : classe minimale `@SpringBootApplication` avec `main` appelant `SpringApplication.run(...)`. Correct.
- **`HealthController`** : `@RestController` + `@GetMapping("/health")` retournant `Map.of("status", "UP")`. Spring MVC sérialisera en JSON par défaut. Comportement conforme.
- **`application.properties`** : `server.port=8080`, `spring.application.name=timizer-backend`, `management.endpoints.web.exposure.include=health` — exposition Actuator restreinte au strict nécessaire (bon réflexe sécurité, pas de `*`).
- **Maven Wrapper** : version 3.3.2 (script-only), pas de `maven-wrapper.jar` requis. `distributionUrl` pointe vers Maven Central. `mvnw` est marqué exécutable.
- **Scope respecté** : `git diff --stat` ne touche que `backend/**` et les artefacts de workflow `runs/T009/**`. Aucun fichier existant modifié. Aucun root `.gitignore` créé (correct : le plan ne l'exigeait qu'en cas de préexistence).
- **README** : commandes de run/build documentées, endpoints listés (`/health` et `/actuator/health`), Java 21 mentionné.
- **`.gitignore`** : entrées standard (`target/`, `*.log`, `.idea/`, `.vscode/`, `*.iml`).
- **Déviation `mvnw.ps1`** correctement justifiée : `mvnw.cmd` invoque `mvnw.ps1`, son absence casserait le point d'entrée Windows. Extension légitime, pas une expansion de scope.
- **Sécurité** : aucun secret, aucun log sensible, exposition Actuator minimale.

## Problèmes détectés

Aucun problème bloquant identifié.

## Risques éventuels

- **Runtime non vérifié** (non-bloquant) : les commandes d'acceptation `./mvnw spring-boot:run`, `curl http://localhost:8080/health`, `curl http://localhost:8080/actuator/health`, `./mvnw -DskipTests package` n'ont pas été exécutées faute de JDK 21 dans l'environnement de review (ni celui du coder). Le code est du boilerplate Spring Boot standard et devrait démarrer sans souci, mais la première exécution locale par un mainteneur devrait confirmer.
- **Doublon `/health` custom + `/actuator/health`** (non-bloquant) : c'est un choix explicite du plan ("stable custom URL" qui complète Actuator). Documenter dans un futur ticket si l'un des deux doit être retiré une fois la stack CI/CD en place.
- **`*.log` dans `backend/.gitignore`** (non-bloquant) : pattern large mais standard ; ne pose pas de problème à ce stade.

## Décision

- APPROVED

## Actions demandées

Aucune action bloquante.

Recommandations à traiter dans un ticket ultérieur (ne bloquent pas cette PR) :
- Lors du prochain travail sur le backend, exécuter localement `./mvnw spring-boot:run` puis `curl http://localhost:8080/health` et `curl http://localhost:8080/actuator/health` pour valider les critères d'acceptation runtime.
- Décider à terme si le `/health` custom doit rester en plus de `/actuator/health` (redondance intentionnelle mais à réévaluer).

IMPLEMENTATION_APPROVED
