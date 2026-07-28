# Frontend CI

## When it runs

The workflow triggers on pull requests that change at least one file under `frontend/`.

## What it checks

| Step | Command | Fails when |
|---|---|---|
| Lint | `npm run lint` | oxlint rule violation |
| Type check | `npm run typecheck` | TypeScript type error |
| Component tests | `npm test` | Vitest test failure |
| Build | `npm run build` | Build error or broken import |
| E2E tests | `npm run test:e2e` | Playwright smoke test failure |

## Artifacts on failure

When E2E tests fail, Playwright traces and screenshots from `frontend/test-results/` are uploaded as a GitHub Actions artifact named `playwright-artifacts`, visible in the workflow run summary.

## Local equivalent commands

Run these from the `frontend/` directory:

```sh
# Lint
npm run lint

# Type check
npm run typecheck

# Component tests
npm test

# Production build
npm run build

# E2E tests (requires a production build first)
npm run build && npm run test:e2e
```
