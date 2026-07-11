# Test Report — T030

## Scope

Documentation-only ticket. No application code exists on this branch (verified: no `backend/`, `frontend/`, or `assets/` directories tracked by git). Validation is therefore restricted to reading the produced docs and verifying they cover the acceptance criteria.

## Commands executed

- `git log --oneline` — confirmed 3 T030 commits on branch.
- `git ls-files` — confirmed only two user-visible files added: `README.md`, `docs/local-development.md`. No modifications or deletions of existing tracked files.
- `git diff --name-status ba7163e~1 05e8fdf -- . ':!runs/'` → `A README.md`, `A docs/local-development.md`.
- `git show ba7163e~1:README.md` → `fatal: path 'README.md' exists on disk, but not in 'ba7163e~1'` — confirms README.md is genuinely new (no prior version overwritten).
- Section extraction on `docs/local-development.md` → 10 numbered `## N.` sections in the expected order.
- Cross-link anchor check: `#4-backend-startup`, `#6-sqlite-configuration`, `#8-provider-signature-asset` in `README.md` all match GFM slugs of the numbered H2s in `docs/local-development.md`.
- `docs/ai/global-context.md` exists (referenced from `README.md:8`).

## Acceptance criteria

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | Documentation explains backend startup | PASS | `README.md:52-59`, `docs/local-development.md:48-67` — `./mvnw spring-boot:run` + `SERVER_PORT` override |
| 2 | Documentation explains frontend startup | PASS | `README.md:62-70`, `docs/local-development.md:69-84` — `npm install`, `npm start`, `REACT_APP_API_BASE_URL` |
| 3 | Documentation explains SQLite configuration | PASS | `README.md:39-41`, `docs/local-development.md:86-101` — embedded SQLite, `SPRING_DATASOURCE_URL` override, reset procedure |
| 4 | Documentation explains CRA default settings | PASS | `docs/local-development.md:103-115` — `timizer.cra.*` namespace, env-var convention, explicit disambiguation from Create React App |
| 5 | Documentation explains provider signature asset setup | PASS | `README.md:45-49`, `docs/local-development.md:117-133` — default path `assets/provider-signature.png`, PNG/JPEG, `timizer.provider-signature.path`, `TIMIZER_PROVIDER_SIGNATURE_PATH` |
| 6 | Documentation explains test commands | PASS | `README.md:72-86`, `docs/local-development.md:135-159` — `./mvnw test`, `npm test -- --watchAll=false`, single-test invocations |
| 7 | Existing project files are not broken | PASS | Diff shows only two `A` (added) entries and no modifications to any pre-existing tracked file |

## Regressions observed

None. Only additions; no edits to previously tracked files.

## Blocking issues

None.

## Non-blocking observations

- Runtime execution of the documented commands cannot be verified: `backend/`, `frontend/`, and `assets/` do not yet exist on this branch (owned by tickets T009, T010, T027). The docs correctly phrase downstream references as pointers to owning tickets rather than fabricating file paths or ports.
- Forward references to `docs/backend/database.md`, `docs/configuration.md`, `docs/provider-signature.md` are stubs ("once that document is available on the branch") — will need one-line adjustments if upstream tickets land under different filenames. Not a defect of T030.
- Docs interpret "CRA" as *Compte-Rendu d'Activité* (the domain object of the project, per `README.md:5-6`) and explicitly disambiguate from Create React App. Consistent with the project mission.

## Decision

**VALIDATED** — all seven acceptance criteria satisfied; no regressions; no blocking issues.
