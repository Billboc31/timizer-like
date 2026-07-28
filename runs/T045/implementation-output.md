All checks pass. Here's a summary of everything implemented:

---

**Files created:**
- `.github/workflows/frontend-ci.yml` — CI workflow triggered on PRs touching `frontend/**`; runs lint → typecheck → component tests → build → E2E; uploads `test-results/` artifact on failure
- `frontend/playwright.config.ts` — minimal Playwright config: chromium project, preview server, traces/screenshots retained on failure in `test-results/`
- `frontend/e2e/smoke.test.ts` — single smoke test: navigate to `/`, assert page title is non-empty
- `docs/ci-frontend.md` — documents what the workflow checks, when it triggers, artifacts on failure, and local equivalent commands

**Files modified:**
- `frontend/package.json` — added `lint` (`oxlint .`), `typecheck` (`tsc --noEmit`), `test:e2e` (`playwright test`) scripts; added `@playwright/test` and `oxlint` as devDependencies
- `frontend/vite.config.ts` — added `include: ['src/**/*.test.{ts,tsx}']` to Vitest config to prevent it from picking up Playwright e2e tests
- `frontend/src/api/httpClient.ts` — fixed pre-existing TS2591 error: replaced `process.env.REACT_APP_API_BASE_URL` (dead CRA code, never worked in Vite) with `import.meta.env.VITE_API_BASE_URL ?? ''`

**Verified locally:** lint exits 0, typecheck clean, 61 component tests pass, production build succeeds. E2E requires Playwright browsers (`npx playwright install --with-deps chromium`) which the CI installs as a dedicated step.
