I have enough context to write the plan. The T030 base branch contains only the AI Dev Factory scaffolding (no backend, no frontend, no SQLite, no signature docs) — the same situation the T027 planner faced. The plan needs to be explicit about that assumption and scope the documentation accordingly, referencing conventions defined by upstream tickets (T001, T009, T010, T026, T027) without requiring their code to exist on this branch.

## Objective

Add a repository-level "local development" documentation set that lets the owner and autonomous coding agents install, run, test, and configure the MVP on a workstation. The change is documentation-only; no application code, config file, or asset binary is produced.

## Included

Working assumptions (the Coder must validate them **before** writing any content):

1. The T030 base branch does **not** contain `backend/`, `frontend/`, `pom.xml`, `package.json`, `application.yml`, `assets/`, `docs/provider-signature.md`, `docs/backend/database.md`, or `docs/configuration.md`. Verification command: `git ls-files | grep -Ev "^(ai|prompts|tickets|docs/ai/|runs/|\.gitignore$)"` must return an empty list on the base commit. If any of those paths already exist, **stop and request a replan** — the doc must then reference the real files, not the conventions below.
2. The conventions to document come from the upstream tickets already merged upstream on their own branches: T001 (SQLite), T009 (Spring Boot backend), T010 (React frontend), T026 (CRA defaults), T027 (provider signature asset). The doc describes commands and locations as they are defined in those tickets; it does not invent new conventions.
3. "CRA" in this repo refers to the *Compte-Rendu d'Activité* business object (activity report), **not** Create React App. The ticket line "configure CRA defaults" means configuring the CRA business defaults (provider, client, standard values). Any React-tooling wording in the docs must not use the "CRA" acronym in that sense.

Files to create (all documentation, no code, no binary):

- `README.md` at the repository root (new). Sections in this order:
  1. **Project overview** — one paragraph, points to `docs/ai/global-context.md`.
  2. **Prerequisites** — JDK 17+, Maven wrapper (`./mvnw`), Node.js LTS, npm. No installer instructions — just versions and a pointer to each tool's official install page (no URL fabrication: use only URLs the Coder can confirm from an existing file in the repo, otherwise phrase as "install from the official site").
  3. **Clone and layout** — one-line `git clone` and a short tree showing `backend/`, `frontend/`, `assets/`, `docs/`.
  4. **Local configuration** — three subsections: SQLite, CRA business defaults, provider signature. Each is a **short pointer** to its dedicated doc under `docs/` (see below); the README itself only lists the minimum command a user needs.
  5. **Run the backend** — `cd backend && ./mvnw spring-boot:run`, default port from T009 (state the port only if the Coder can read it from a merged file; otherwise write `see docs/local-development.md`).
  6. **Run the frontend** — `cd frontend && npm install && npm start`, default dev port.
  7. **Run the tests** — backend: `cd backend && ./mvnw test`; frontend: `cd frontend && npm test -- --watchAll=false`.
  8. **Troubleshooting** — three bullets max: missing signature file, SQLite file locked, port already in use. Each bullet links to the dedicated doc.
- `docs/local-development.md` (new) — the expanded workflow doc; the README is a short surface, this file is the reference. Sections:
  1. Purpose and audience (owner + coding agents).
  2. Prerequisites (same content as README, expanded with version rationale).
  3. First-time setup checklist (clone → provide `assets/provider-signature.png` → set env overrides if any → run backend → run frontend).
  4. Backend startup (Maven command, JVM flags if T009 defines any, default HTTP port, how to change it).
  5. Frontend startup (npm install, npm start, default dev port, how to point it at a non-default backend URL).
  6. SQLite configuration (default file path, how to override, how to reset). Links to `docs/backend/database.md` if that file exists after upstream merge.
  7. CRA business defaults (Spring property namespace `timizer.cra.*`, environment override pattern). Links to `docs/configuration.md` if that file exists after upstream merge.
  8. Provider signature asset (default location `assets/provider-signature.png`, override key `timizer.provider-signature.path`, env `TIMIZER_PROVIDER_SIGNATURE_PATH`, accepted formats PNG/JPEG). Links to `docs/provider-signature.md` if that file exists after upstream merge.
  9. Test commands (backend `./mvnw test`, frontend `npm test`, how to run a single test).
  10. Known-limitations pointer (out of scope for T030 — see Excluded).
- `docs/ai/global-context.md` — add a **single line** under an existing section pointing to `docs/local-development.md`. If no natural anchor exists, **skip this file** (do not create a new section just to host the pointer).

Task ordering for the Coder:

1. Run the verification command in assumption 1. If anything unexpected exists, stop and request a replan.
2. Write `docs/local-development.md` first (the reference doc).
3. Write `README.md` at the root, keeping every cross-link consistent with what `docs/local-development.md` actually contains.
4. Optionally add the one-line pointer in `docs/ai/global-context.md`.
5. Run `git diff --stat` to confirm only the three doc files changed. No code, no config, no asset.
6. Record in `runs/T030/implementation-output.md` (a) the verification command output, (b) the exact list of files added, (c) the fact that no application test suite exists on this branch and therefore no test command was executed.

## Excluded

- Any change under `backend/`, `frontend/`, `src/`, `assets/`, or any application source or config tree.
- Creating or committing a real provider-signature binary (`.png`, `.jpg`, `.jpeg`).
- Writing Dockerfiles, docker-compose files, or any container-runtime documentation.
- Deployment, hosting, or production-configuration documentation (per ticket Out of Scope).
- Client-side signature capture documentation (per ticket Out of Scope).
- Phase-2 end-user guide (per ticket Out of Scope).
- CI/CD pipeline, GitHub Actions, or release-workflow files (per ticket Out of Scope).
- Editing, moving, or renaming any file under `ai/`, `prompts/`, `tickets/`, or `runs/` other than the ticket's own artifact folder.
- Inventing commands, ports, property keys, or file paths that are not defined by an already-merged upstream ticket. Any convention the Coder cannot trace to an upstream file must be phrased as an explicit placeholder linking to the owning ticket, not stated as fact.
- Fabricated URLs to external documentation sites.
- PR opening, memory update, or `state.json` mutation — those are downstream harness steps.

## Acceptance criteria

- `README.md` exists at the repository root and contains, in this order: Project overview, Prerequisites, Clone and layout, Local configuration, Run the backend, Run the frontend, Run the tests, Troubleshooting.
- `docs/local-development.md` exists and contains the ten sections listed in Included, in that order.
- The README's "Run the backend" section names the exact command `./mvnw spring-boot:run` (run from `backend/`).
- The README's "Run the frontend" section names the exact commands `npm install` and `npm start` (run from `frontend/`).
- The README's "Run the tests" section names both `./mvnw test` and `npm test`.
- `docs/local-development.md` names the SQLite override mechanism, the CRA defaults Spring property namespace `timizer.cra.*`, and both signature override keys `timizer.provider-signature.path` (property) and `TIMIZER_PROVIDER_SIGNATURE_PATH` (env).
- `docs/local-development.md` states the default provider-signature asset location `assets/provider-signature.png` and lists PNG and JPEG as the accepted formats.
- No file outside `README.md`, `docs/local-development.md`, and (optionally) `docs/ai/global-context.md` is modified, added, or deleted by the Coder's commit.
- `git diff --stat` on the Coder's commit shows at most three changed files, all under the paths listed above.
- `runs/T030/implementation-output.md` records the verification-command output, the file list, and an explicit note that no application test suite exists on this branch.
