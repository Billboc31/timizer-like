## Objective

Add a GitHub Actions CI workflow that automatically runs linting, type checking, component tests, a production build, and a basic end-to-end smoke test on every pull request touching `frontend/`, retaining browser failure artifacts. No such workflow currently exists in the repository.

## Included

**`.github/workflows/frontend-ci.yml`** — new file:
- Trigger: `pull_request` with path filter `frontend/**`
- Steps in order:
  1. `actions/checkout`
  2. `actions/setup-node` with LTS, cache `npm`, working-dir `frontend/`
  3. `npm ci` in `frontend/`
  4. `npx playwright install --with-deps chromium` (Playwright browsers)
  5. Lint: `npm run lint` (oxlint)
  6. Type check: `npm run typecheck`
  7. Component tests: `npm test`
  8. Production build: `npm run build`
  9. E2E: `npm run test:e2e`
  10. `actions/upload-artifact` on failure — uploads `frontend/test-results/` (Playwright traces/screenshots), conditional on step failure

**`frontend/package.json`** — add three scripts:
- `"lint": "oxlint ."`
- `"typecheck": "tsc --noEmit"`
- `"test:e2e": "playwright test"`

**`frontend/playwright.config.ts`** — new file, minimal config:
- `testDir: './e2e'`
- `webServer: { command: 'npm run preview', url: 'http://localhost:4173', reuseExistingServer: false }`
- `use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' }`
- `outputDir: 'test-results/'`
- Single project: chromium

**`frontend/e2e/smoke.test.ts`** — new file, one smoke test:
- Navigate to `baseURL`
- Assert page title is not empty (app shell loads)

**`frontend/` devDependency** — add `@playwright/test` via `npm install -D @playwright/test`

**`docs/ci-frontend.md`** — new file documenting:
- What the workflow checks and when it triggers
- Local equivalent commands for each CI step:
  - `npm run lint` → oxlint
  - `npm run typecheck` → TypeScript check without emit
  - `npm test` → Vitest component tests
  - `npm run build` → production build
  - `npm run build && npm run test:e2e` → E2E against production preview

## Excluded

- Backend CI (separate concern, separate workflow)
- Automatic deployment to any environment
- Backend performance or load testing
- Visual regression / snapshot tests
- Adding new component tests beyond the smoke test
- Flaky visual tests as mandatory gate

## Acceptance criteria

- `.github/workflows/frontend-ci.yml` exists and triggers on PRs whose diff includes at least one file under `frontend/`
- A PR introducing an oxlint violation causes the workflow to fail at the lint step
- A PR introducing a TypeScript type error causes the workflow to fail at the typecheck step
- A Vitest failure causes the workflow to fail at the component test step
- A broken import or build error causes the workflow to fail at the build step
- `npm run test:e2e` runs the Playwright smoke test against the built preview server and passes on an unmodified `main`
- When the E2E step fails, the `test-results/` directory (traces and screenshots) is uploaded as a GitHub Actions artifact and visible in the workflow run summary
- `docs/ci-frontend.md` lists the local equivalent command for each CI step
