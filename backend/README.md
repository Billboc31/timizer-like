# timizer-backend

Spring Boot backend for the Timizer application.

## Requirements

- Java 21 (JDK)

Maven is not required — the Maven Wrapper (`mvnw`) is included.

## Run locally

```bash
cd backend
./mvnw spring-boot:run
```

The application listens on port `8080` by default.

## Health endpoints

- `GET http://localhost:8080/health` — custom endpoint, returns `{"status":"UP"}`.
- `GET http://localhost:8080/actuator/health` — Spring Boot Actuator, returns `{"status":"UP"}`.

## Build

```bash
./mvnw -DskipTests package
```

Produces `target/timizer-backend-0.0.1-SNAPSHOT.jar`.
