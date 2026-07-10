# PR Review

## Résumé

Re-review (attempt 2) de l'implémentation T009. L'état de la branche est identique à celui de l'attempt 1 : aucun changement de code entre les deux passes (`git log` s'arrête à `a3fedd6 feat(T009/workflow): coder — update 14 file(s)` suivi d'un `chore(T009): pre-sync auto-commit`). L'implémentation reste un bootstrap Spring Boot 3.3.5 minimal, Java 21, isolé sous `backend/`, exposant `GET /health` (custom) + `/actuator/health`. Le périmètre correspond strictement au ticket T009 et au plan approuvé. Aucun problème bloquant.

## Vérifications effectuées

- Lecture intégrale des fichiers créés sous `backend/` (`pom.xml`, `TimizerBackendApplication.java`, `HealthController.java`, `application.properties`, `.gitignore`, `README.md`, wrappers Maven).
- Comparaison ligne à ligne avec `runs/T009/plan.md` (sections Included / Excluded / Acceptance criteria) et `runs/T009/ticket.md` (Description / Out of Scope / Acceptance Criteria).
- `git diff a3fedd6~1..a3fedd6 --stat` : confirme que seuls `backend/**` et les artefacts de workflow `runs/T009/**` sont touchés (aucune modification d'un fichier existant).
- `git log --oneline -10` : pas de nouveau commit d'implémentation depuis l'attempt 1.
- Vérification exécutable de `mvnw` (`-rwxr-xr-x`).
- Vérification que le wrapper Apache Maven 3.3.2 est de type "script-only" — pas de `maven-wrapper.jar` à committer, `distributionUrl` pointe vers Maven Central.
- Vérification que `mvnw.cmd` invoque `mvnw.ps1` → justifie l'ajout de `mvnw.ps1` par le coder (déviation contrôlée).
- Contrôle du scope "Out of Scope" du ticket : aucune trace de JPA, Flyway, sécurité, PDF, domaine CRA, tests, Docker, CI.
- Contrôle sécurité : pas de secrets, pas de log sensible, pas d'endpoint Actuator sur-exposé.

## Points validés

- **Structure conforme au plan** : `backend/pom.xml`, `mvnw`, `mvnw.cmd`, `mvnw.ps1`, `.mvn/wrapper/maven-wrapper.properties`, `src/main/java/com/timizer/backend/TimizerBackendApplication.java`, `src/main/java/com/timizer/backend/health/HealthController.java`, `src/main/resources/application.properties`, `.gitignore`, `README.md`.
- **`pom.xml`** : parent `spring-boot-starter-parent:3.3.5`, `groupId=com.timizer`, `artifactId=timizer-backend`, `version=0.0.1-SNAPSHOT`, `packaging=jar`, `java.version=21`, dépendances `spring-boot-starter-web` et `spring-boot-starter-actuator`, plugin `spring-boot-maven-plugin`. Aucune dépendance hors périmètre.
- **`TimizerBackendApplication`** : classe minimale `@SpringBootApplication` avec `main` appelant `SpringApplication.run(...)`. Correct.
- **`HealthController`** : `@RestController` + `@GetMapping("/health")` retournant `Map.of("status", "UP")`. Sérialisation JSON par défaut. Conforme au ticket (basic health endpoint) et au plan.
- **`application.properties`** : `server.port=8080`, `spring.application.name=timizer-backend`, `management.endpoints.web.exposure.include=health` — exposition Actuator restreinte au strict nécessaire (bonne posture sécurité, pas de `*`).
- **Maven Wrapper** : version 3.3.2 script-only, `distributionUrl` vers Maven Central, `mvnw` exécutable.
- **Scope respecté** : `git diff --stat` ne touche que `backend/**` et les artefacts de workflow. Aucun fichier existant modifié. Root `.gitignore` non créé (correct : le plan ne l'exigeait qu'en cas de préexistence, et aucun root `.gitignore` n'existe).
- **README** : instructions run/build documentées, endpoints listés (`/health` et `/actuator/health`), Java 21 mentionné.
- **`.gitignore`** : entrées standard (`target/`, `*.log`, `.idea/`, `.vscode/`, `*.iml`).
- **Déviation `mvnw.ps1`** correctement documentée par le coder : `mvnw.cmd` invoque `mvnw.ps1`, son absence casserait le point d'entrée Windows. Extension légitime du plan.
- **Sécurité** : aucun secret, aucun log sensible, exposition Actuator minimale.

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels

- **Runtime non exécuté** (non-bloquant) : les critères d'acceptation runtime (`./mvnw spring-boot:run`, `curl http://localhost:8080/health`, `curl http://localhost:8080/actuator/health`, `./mvnw -DskipTests package`) n'ont pas pu être lancés faute de JDK 21 disponible dans l'environnement de review. Le code est du boilerplate Spring Boot standard, mais une validation locale par le mainteneur reste recommandée avant merge en production.
- **Doublon `/health` custom + `/actuator/health`** (non-bloquant) : choix explicite du plan pour offrir une URL stable ; à réévaluer ultérieurement.
- **Pattern `*.log` dans `backend/.gitignore`** (non-bloquant) : large mais standard, sans impact ici.

## Décision

- APPROVED

## Actions demandées

Aucune action bloquante.

Recommandations non-bloquantes à traiter dans un ticket ultérieur :
- Exécuter localement `./mvnw spring-boot:run` puis `curl http://localhost:8080/health` et `curl http://localhost:8080/actuator/health` pour valider les critères d'acceptation runtime sur une machine avec JDK 21.
- Décider à terme si le `/health` custom doit rester en plus de `/actuator/health` (redondance intentionnelle mais à réévaluer une fois la stack CI/CD en place).

IMPLEMENTATION_APPROVED
