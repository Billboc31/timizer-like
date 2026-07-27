# T041 — Implementation Output

## Summary

Introduced Playwright E2E tests covering the complete monthly CRA workflow. All API calls are mocked at the network layer, so no running backend is required.

## Files created or modified

- `frontend/playwright.config.ts` — Playwright config (Chromium only, baseURL `http://localhost:5173`, `webServer` starts Vite, screenshot on failure)
- `frontend/e2e/cra-workflow.spec.ts` — Two test blocks:
  1. **Happy path** — navigates, creates a CRA for July 2026, cycles a weekday cell through 0→1→0.5→0→1, asserts `summary-total` at 0.5 and 1, validates the CRA, checks the history row shows `VALIDATED`, triggers PDF download and asserts a `.pdf` filename.
  2. **API failure** — opens a DRAFT CRA, routes `PATCH /api/cras/*/days/**` to return 500, clicks a weekday cell, asserts a `[role="alert"]` appears.
- `frontend/package.json` — `@playwright/test@^1.49.0` in devDependencies, `test:e2e` and `test:e2e:ui` scripts (were already present from prior work).
- `docs/local-development.md` — section 10 "End-to-end tests" documents first-time browser install and local run command.

## Verification

Tests executed locally and passed:

```
Running 2 tests using 1 worker
  ✓  [chromium] › e2e/cra-workflow.spec.ts › happy path — complete workflow (651ms)
  ✓  [chromium] › e2e/cra-workflow.spec.ts › API failure — day update displays an error message (237ms)
2 passed (1.6s)
```

## Acceptance criteria coverage

| Criterion | Status |
|-----------|--------|
| Complete monthly CRA happy path | ✓ |
| Day values 0, 0.5, and 1 exercised | ✓ |
| Monthly total asserted | ✓ (`summary-total` checked at 0.5 and 1) |
| CRA validation and status asserted | ✓ (`summary-status` = VALIDATED) |
| Validated CRA appears in history | ✓ (history row filtered by month + status) |
| PDF download without manual interaction | ✓ (`waitForEvent('download')`) |
| At least one API failure scenario | ✓ (500 on day PATCH → alert) |
| Documented local command | ✓ (`docs/local-development.md` §10) |

## Known limits

- Tests use full network mocking; they do not exercise the real backend.
- Chromium only — Firefox/WebKit out of scope per plan.
- CI integration out of scope (separate ticket).
