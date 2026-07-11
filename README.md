# Timizer Like

## Project overview

Timizer Like is an MVP for generating activity reports (*Comptes-Rendus
d'Activité*, "CRA") with an embedded provider signature. Higher-level project
context — mission, scope, agent workflow — is described in
[`docs/ai/global-context.md`](docs/ai/global-context.md).

## Prerequisites

- **JDK 17 or later** (backend, T009). Install from the official OpenJDK
  distribution.
- **Maven wrapper** (`./mvnw`) — ships with the backend, no system Maven
  required.
- **Node.js LTS** and **npm** (frontend, T010). Install from the official
  Node.js site.

No database server is required — the MVP uses embedded SQLite.

## Clone and layout

```
git clone git@github.com:Billboc31/timizer-like.git
cd timizer-like
```

Top-level layout (per merged upstream tickets):

```
backend/     Spring Boot backend (T009)
frontend/    React frontend (T010)
assets/      Provider signature and other local assets (T027)
docs/        Project documentation
```

## Local configuration

- **SQLite** — default database file path is defined by T001. Override with
  the standard Spring `SPRING_DATASOURCE_URL` environment variable. Details:
  [`docs/local-development.md`](docs/local-development.md).
- **CRA business defaults** — provider, client, and standard values are
  configured under the `timizer.cra.*` Spring property namespace (T026).
  Details: [`docs/local-development.md`](docs/local-development.md).
- **Provider signature** — provide a PNG or JPEG file at
  `assets/provider-signature.png`, or override via
  `timizer.provider-signature.path` /
  `TIMIZER_PROVIDER_SIGNATURE_PATH` (T027). Details:
  [`docs/local-development.md`](docs/local-development.md).

## Run the backend

```
cd backend
./mvnw spring-boot:run
```

The default HTTP port and how to change it are documented in
[`docs/local-development.md`](docs/local-development.md).

## Run the frontend

```
cd frontend
npm install
npm start
```

The frontend uses its default development port. To point it at a non-default
backend URL, see [`docs/local-development.md`](docs/local-development.md).

## Run the tests

Backend:

```
cd backend
./mvnw test
```

Frontend:

```
cd frontend
npm test -- --watchAll=false
```

## Troubleshooting

- **Missing provider signature file** — the backend expects a signature at
  `assets/provider-signature.png` (or at the path in the override property /
  env variable). See
  [`docs/local-development.md`](docs/local-development.md#8-provider-signature-asset).
- **SQLite file locked** — stop any other process still using the database
  file, then restart the backend. See
  [`docs/local-development.md`](docs/local-development.md#6-sqlite-configuration).
- **Port already in use** — set `SERVER_PORT` (backend) or the frontend's dev
  server port before starting the process. See
  [`docs/local-development.md`](docs/local-development.md#4-backend-startup).
