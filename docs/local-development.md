# Local Development

## 1. Purpose and audience

This document explains how to install, configure, run, and test the Timizer Like
MVP on a local workstation. It targets two audiences:

- the project owner running the app on their own machine;
- autonomous coding agents that need a deterministic, self-contained setup
  procedure.

It is the reference document for local development. `README.md` at the
repository root is a short entry point that points here for the details.

## 2. Prerequisites

Install the following before working on the project:

- **JDK 17 or later** — required by the Spring Boot backend (T009). Install
  from the official OpenJDK distribution of your choice.
- **Maven wrapper (`./mvnw`)** — the backend ships a Maven wrapper, so a
  system-wide Maven install is not required. The wrapper downloads a pinned
  Maven version on first run.
- **Node.js LTS** — required by the React frontend (T010). Any active LTS
  release is expected to work. Install from the official Node.js site.
- **npm** — bundled with Node.js. Used to install frontend dependencies and to
  run the frontend dev server and tests.

No database server is required: the MVP uses an embedded SQLite database
(T001).

## 3. First-time setup checklist

Run these steps in order the first time you clone the repository:

1. Clone the repository:
   ```
   git clone git@github.com:Billboc31/timizer-like.git
   cd timizer-like
   ```
2. Provide the provider signature asset at `assets/provider-signature.png`
   (see section 8). The file is not committed to the repository.
3. Set any environment overrides you need (SQLite path, signature path,
   CRA business defaults). Defaults are usable as-is for a first run.
4. Start the backend (see section 4).
5. Start the frontend (see section 5).

## 4. Backend startup

The backend is a Spring Boot service (T009) built with Maven.

From the repository root:

```
cd backend
./mvnw spring-boot:run
```

The service listens on the default Spring Boot HTTP port defined by ticket
T009. To change the port, override the standard Spring property
`server.port`, for example:

```
SERVER_PORT=8081 ./mvnw spring-boot:run
```

No custom JVM flags are required for local development.

## 5. Frontend startup

The frontend is a React application (T010). From the repository root:

```
cd frontend
npm install
npm start
```

`npm install` is required on the first run and whenever dependencies change.
`npm start` launches the development server on its default port.

If the backend is not reachable at its default URL, point the frontend at the
backend by setting the standard React environment variable
`REACT_APP_API_BASE_URL` before running `npm start`.

## 6. SQLite configuration

The MVP uses SQLite as its embedded database (T001). The database file lives
at the default path defined by T001. To override it, set the Spring
datasource URL, for example:

```
SPRING_DATASOURCE_URL=jdbc:sqlite:/absolute/path/to/timizer.db ./mvnw spring-boot:run
```

To reset the database, stop the backend and delete the SQLite file; the
backend recreates the schema on next startup according to the migration
strategy defined by T001.

See `docs/backend/database.md` for the authoritative schema and migration
reference once that document is available on the branch.

## 7. CRA business defaults

"CRA" in this project stands for *Compte-Rendu d'Activité* (activity report),
the domain object of the MVP — it is **not** a reference to Create React App.

The CRA business defaults (default provider, default client, standard
values applied when creating a new activity report) are configured under the
Spring property namespace `timizer.cra.*` (T026). Each property can be
overridden via the standard Spring environment-variable convention, for
example `TIMIZER_CRA_DEFAULT_PROVIDER=...`.

See `docs/configuration.md` for the exhaustive list of `timizer.cra.*`
keys once that document is available on the branch.

## 8. Provider signature asset

The MVP embeds a fixed provider signature image into generated activity
reports (T027).

- **Default location**: `assets/provider-signature.png` at the repository
  root.
- **Accepted formats**: PNG and JPEG.
- **Property override**: `timizer.provider-signature.path`.
- **Environment override**: `TIMIZER_PROVIDER_SIGNATURE_PATH`.

The signature file is not tracked in the repository. Copy your own file to
the default location, or point the backend at another path using either
override above.

See `docs/provider-signature.md` for the full asset specification once that
document is available on the branch.

## 9. Test commands

Backend tests (from `backend/`):

```
./mvnw test
```

To run a single test class:

```
./mvnw test -Dtest=MyTestClass
```

Frontend tests (from `frontend/`):

```
npm test -- --watchAll=false
```

To run a single test file:

```
npm test -- --watchAll=false path/to/file.test.tsx
```

## 10. Known limitations

The following topics are intentionally out of scope for this document and are
tracked by their own tickets:

- Deployment, hosting, and production configuration.
- Client-side signature capture.
- Phase-2 end-user guide.
- CI/CD pipelines.

Refer to the ticket registry and to `docs/ai/global-context.md` for the
current status of these topics.
