I have all the information I need for a complete review.

---

# PR Review — T045: Run frontend quality checks automatically in CI

## Résumé

The implementation adds a GitHub Actions CI workflow with all five quality gates (lint → typecheck → component tests → build → E2E), Playwright infrastructure, three new npm scripts, a minimal smoke test, and documentation. The scope is tight and matches the plan.

## Vérifications effectuées

- `.github/workflows/frontend-ci.yml` reviewed against ticket acceptance criteria
- `frontend/package.json` diff vs pre-T045 state
- `frontend/playwright.config.ts` — webServer setup and artifact output directory
- `frontend/e2e/smoke.test.ts` — test content
- `frontend/vite.config.ts` — Vitest `include` scope guard
- `frontend/src/api/httpClient.ts` — pre-existing TS2591 fix
- `docs/ci-frontend.md` — documentation completeness
- Commit history: node_modules tracking traced back to the bootstrap checkpoint (`a357ea02`), pre-dating T045

## Points validés

**Acceptance criteria coverage:**

| Criterion | Status |
|---|---|
| CI runs on PRs touching `frontend/` | ✅ `paths: ['frontend/**']` on `pull_request` |
| Linting and type errors fail the workflow | ✅ `npm run lint` (oxlint) and `npm run typecheck` (tsc --noEmit) |
| Component test failures fail the workflow | ✅ `npm test` → `vitest run` |
| Production build verified | ✅ `npm run build` → `tsc -b && vite build` |
| Critical E2E tests run automatically | ✅ `npm run test:e2e` → Playwright smoke test |
| Failure artifacts uploaded | ✅ `actions/upload-artifact@v4` on `failure()`, `if-no-files-found: ignore` |
| Workflow and local commands documented | ✅ `docs/ci-frontend.md` with table + code blocks |

**Quality points:**

- `vitest run` (not `vitest`) is correct for CI — exits cleanly without watch mode.
- Vitest `include: ['src/**/*.test.{ts,tsx}']` prevents Vitest from picking up the Playwright e2e file — necessary and correct.
- `Build` step precedes `E2E tests` step, so `dist/` exists when `npm run preview` is invoked by Playwright's webServer.
- The artifact `path: frontend/test-results/` is correct relative to the repo root (Playwright `outputDir` is `test-results/` relative to `frontend/`).
- `httpClient.ts` fix (`process.env.REACT_APP_API_BASE_URL` → `import.meta.env.VITE_API_BASE_URL`) resolves a pre-existing TS2591 error that would have caused `typecheck` to fail on the very first CI run. It is a necessary enabler for the ticket, not scope creep.

## Problèmes détectés

**Aucun problème bloquant.**

**Observations mineures (non-bloquantes):**

1. **`reuseExistingServer: false`** in `playwright.config.ts` — locally, if a preview server is already running on port 4173, Playwright will fail to bind. `reuseExistingServer: !process.env.CI` is a common pattern that improves local DX without affecting CI. Not blocking.

2. **node_modules committed to git** — the coder's commit includes changes to `frontend/node_modules/` as a side effect of running `npm install` locally. This is a pre-existing tracking problem (node_modules appears tracked since `a357ea02`, the bootstrap checkpoint, before T045). Not introduced by T045 and not blocking the CI goal.

3. **CI workflow file doesn't self-trigger** — modifying `.github/workflows/frontend-ci.yml` on a PR won't re-evaluate the workflow for that PR (GitHub runs the workflow version from the base branch). This is expected GitHub Actions behaviour, not a bug.

## Risques éventuels

None introduced by this implementation. The `httpClient.ts` change is a pure correctness fix (dead CRA code replaced with correct Vite env access) with no runtime behaviour change when `VITE_API_BASE_URL` is unset (both paths fall through to an empty string).

## Décision

APPROVED — all seven acceptance criteria are met, the implementation is minimal and correct, and the only notable out-of-scope change (`httpClient.ts`) was required for the `typecheck` gate to be functional.

## Actions demandées

None required. The three minor observations above can be addressed in follow-up tickets if desired.

IMPLEMENTATION_APPROVED
