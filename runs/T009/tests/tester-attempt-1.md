# T009 — Tester Report (attempt 1)

**Ticket**: T009 — Bootstrap Spring Boot backend
**Branch**: `ticket/T009-bootstrap-spring-boot-backend`
**Date**: 2026-07-10
**Verdict**: **PASS** — all acceptance criteria satisfied.

## Environment

- macOS Darwin 25.5.0 (arm64)
- Java runtime was **not** installed on the test host at the start of the run.
  Installed via `brew install openjdk@21` → `openjdk 21.0.11` (Homebrew build).
- `JAVA_HOME=/opt/homebrew/opt/openjdk@21` used for the build/run.
- Maven Wrapper `mvnw` shipped in `backend/` (Maven `3.9.9`, wrapper `3.3.2`).

## Commands executed

All commands run from the ticket worktree
`/Users/pierrebocquet/runtime/timizer-like/worktrees/T009`.

1. Build (from `backend/`):
   ```
   ./mvnw -DskipTests -B -q package
   ```
   → exit code `0`, produced `target/timizer-backend-0.0.1-SNAPSHOT.jar`
   (≈ 22 MB fat jar).

2. Start (port 8080 already occupied by Docker on this host, so used 8090):
   ```
   java -jar target/timizer-backend-0.0.1-SNAPSHOT.jar --server.port=8090
   ```
   Startup log excerpt:
   ```
   Tomcat started on port 8090 (http) with context path '/'
   Started TimizerBackendApplication in 0.874 seconds (process running for 1.061)
   ```
   Spring Boot `3.3.5`, Java `21.0.11`. No errors, no warnings of note.

3. Endpoint checks:
   ```
   GET http://localhost:8090/health
     → HTTP 200, application/json, body {"status":"UP"}
   GET http://localhost:8090/actuator/health
     → HTTP 200, application/vnd.spring-boot.actuator.v3+json, body {"status":"UP"}
   GET http://localhost:8090/definitely-not-a-route
     → HTTP 404  (control — confirms routing is discriminating, not blanket-200)
   ```

4. Stopped the process; verified `pgrep -fl timizer-backend` returns nothing.

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Backend project exists in the repository | **PASS** | `backend/` with `pom.xml`, `src/main/java/com/timizer/backend/…`, Maven wrapper, `README.md`, `.gitignore`, `application.properties`. |
| 2 | Backend can start locally | **PASS** | Fat jar built and launched; Spring Boot logged `Started TimizerBackendApplication in 0.874 seconds`. |
| 3 | A basic health/status endpoint returns a successful response | **PASS** | Both `/health` (custom `HealthController`) and `/actuator/health` (Spring Boot Actuator) return `200 {"status":"UP"}`. |
| 4 | Backend dependencies are declared in the project configuration | **PASS** | `pom.xml` declares `spring-boot-starter-parent 3.3.5`, `spring-boot-starter-web`, `spring-boot-starter-actuator`, Java 21, and `spring-boot-maven-plugin`. |
| 5 | Existing project files are not broken | **PASS** | `git diff 0031ccd..HEAD --diff-filter=DMR --name-status` returns empty — every change on the branch is a pure addition; no pre-existing file was modified, renamed, or deleted. |

## Regressions

None observed.

## Blocking issues

None.

## Notes / non-blocking observations

- **Port conflict on the test host**: `8080` was held by another process
  (Docker Desktop), so the run used `--server.port=8090`. This is a host issue,
  not a backend defect. `application.properties` still defaults to `8080`,
  which is fine for the ticket scope.
- **Java toolchain not pre-installed**: developers running this locally need
  a JDK 21 in `PATH` (or `JAVA_HOME` pointing at one). The `README.md` calls
  this out.
- **Actuator health exposure**: `management.endpoints.web.exposure.include=health`
  exposes only `health` under `/actuator`, which matches the scope
  (no over-exposure). Good.
- **Out-of-scope items** (CRA model, persistence, PDF, auth, frontend, tests
  beyond startup) are correctly absent, matching the ticket's "Out of Scope"
  section.

## Reproduction summary

```
# One-off: install JDK 21 if absent
brew install openjdk@21
export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
export PATH="$JAVA_HOME/bin:$PATH"

cd backend
./mvnw -DskipTests package
java -jar target/timizer-backend-0.0.1-SNAPSHOT.jar   # port 8080 by default

# In another terminal:
curl -i http://localhost:8080/health
curl -i http://localhost:8080/actuator/health
```

## Verdict

**Validated.** T009 satisfies all five acceptance criteria with no regressions
and no blockers.
