## Objective

Bootstrap a minimal, runnable Spring Boot backend inside a new top-level `backend/` directory that starts locally and exposes a health endpoint, without introducing any domain logic, persistence, or existing-file changes.

## Included

- `backend/` — new directory at repository root, isolating all backend sources from the rest of the repo.
- `backend/pom.xml` — Maven project descriptor:
  - `parent`: `spring-boot-starter-parent` (Spring Boot 3.x, e.g. `3.3.x`).
  - `groupId`: `com.timizer`, `artifactId`: `timizer-backend`, `version`: `0.0.1-SNAPSHOT`, `packaging`: `jar`.
  - `java.version`: `21` (or `17` if the toolchain requires it — pick one and document it in the pom `properties` block).
  - Dependencies: `spring-boot-starter-web`, `spring-boot-starter-actuator`.
  - Build plugin: `spring-boot-maven-plugin`.
- `backend/mvnw`, `backend/mvnw.cmd`, `backend/.mvn/wrapper/maven-wrapper.properties` — Maven Wrapper so the backend runs locally without a preinstalled Maven.
- `backend/src/main/java/com/timizer/backend/TimizerBackendApplication.java` — `@SpringBootApplication` class with a `main` method calling `SpringApplication.run(...)`.
- `backend/src/main/java/com/timizer/backend/health/HealthController.java` — `@RestController` exposing `GET /health` returning `{"status":"UP"}` with HTTP 200. This complements the Actuator endpoint and guarantees a stable custom URL.
- `backend/src/main/resources/application.properties` — minimal config:
  - `server.port=8080`
  - `spring.application.name=timizer-backend`
  - `management.endpoints.web.exposure.include=health`
- `backend/.gitignore` — ignore `target/`, `*.log`, `.idea/`, `.vscode/`, `*.iml`.
- `backend/README.md` — short section: how to run (`./mvnw spring-boot:run`), default port, health endpoint URLs (`/health` and `/actuator/health`).
- Root `.gitignore` — append backend build artifacts (`backend/target/`) only if a root `.gitignore` already exists; otherwise skip (leave repo root untouched).

## Excluded

- CRA domain model, entities, DTOs, services.
- Any database, JPA, Flyway/Liquibase, or `spring-boot-starter-data-*` dependency.
- PDF generation libraries or endpoints.
- Authentication, security configuration, CORS beyond defaults.
- Frontend code or changes to any existing file outside `backend/` (except an optional `.gitignore` append as noted).
- Automated tests beyond what Spring Initializr-style bootstrap provides; no new test classes are required for this ticket.
- Docker, CI pipeline, deployment scripts.
- Gradle alternative — Maven is chosen to keep the plan single-track.

## Acceptance criteria

- `backend/` exists at the repository root and contains `pom.xml`, `mvnw`, `src/main/java/com/timizer/backend/TimizerBackendApplication.java`, and `src/main/resources/application.properties`.
- Running `./mvnw spring-boot:run` from `backend/` starts the application without errors and logs `Started TimizerBackendApplication`.
- `curl http://localhost:8080/health` returns HTTP 200 with a JSON body containing `"status":"UP"`.
- `curl http://localhost:8080/actuator/health` returns HTTP 200 with `{"status":"UP"}`.
- No files outside `backend/` are modified, except at most an append to a preexisting root `.gitignore`.
- `git status` shows only new files under `backend/` (and the optional `.gitignore` line) — no unrelated deletions or edits.
- The build passes: `./mvnw -q -DskipTests package` produces `backend/target/timizer-backend-0.0.1-SNAPSHOT.jar`.
