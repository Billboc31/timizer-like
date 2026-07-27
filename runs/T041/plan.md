## Objective

Introduce Playwright as the browser-level E2E test framework and add a test suite that covers the complete monthly CRA workflow — from month selection through PDF download — including one API failure scenario. No browser E2E framework currently exists; unit and integration tests are already covered by Vitest and JUnit.

## Included

**New files:**

- `frontend/playwright.config.ts` — Playwright configuration: base URL `http://localhost:5173`, `webServer` block that starts `vite` dev server, test dir `e2e/`, single Chromium project, screenshot on failure.
- `frontend/e2e/cra-workflow.spec.ts` — Single spec file with the following `test` blocks (all sharing one `test.describe` block):
  1. **Happy path** — full workflow:
     - Navigate to `/`, assert the month selector is visible.
     - Select current month and year via `CraMonthSelector` controls.
     - Click "Créer" / "Ouvrir" button; assert `CalendarGrid` renders.
     - Click a weekday cell to set it to `1` (full day); assert the cell label updates.
     - Click the same cell again to cycle to `0.5` (half day); assert label.
     - Click again to cycle to `0` (reset); assert label.
     - Assert the `CraSummaryPanel` total reflects the day changes (e.g. `0.5 jour(s)`).
     - Click "Valider le CRA"; confirm the dialog; assert status changes to `VALIDATED`.
     - Navigate to the "Historique" tab; assert the validated CRA row appears with correct status and month.
     - Click "Télécharger PDF" for that row; assert the download is triggered (use `page.waitForEvent('download')`).
  2. **API failure scenario** — network interception:
     - Use `page.route('**/api/cras/*/days/*', route => route.fulfill({ status: 500, body: '{}' }))`.
     - Attempt to update a day value; assert an error message is displayed in the UI.

**Modified files:**

- `frontend/package.json` — add `@playwright/test` to `devDependencies`; add scripts:
  - `"test:e2e": "playwright test"`
  - `"test:e2e:ui": "playwright test --ui"`

**Documentation:**

- Append an `## End-to-end tests` section to `docs/dev-setup.md` (or whichever doc describes local dev commands) explaining: start the backend (`./mvnw spring-boot:run`), then run `cd frontend && npm run test:e2e`. Note that the Vite dev server is started automatically by Playwright.

## Excluded

- Visual / screenshot regression testing.
- Client-side signature functionality.
- Performance or load testing.
- Cross-browser matrix (Firefox, WebKit, mobile viewports) — Chromium only for this ticket.
- Backend E2E harness changes (JUnit / Maven).
- CI pipeline integration (separate ticket).
- Tests for `DRAFT` → re-open flows beyond the happy path.
- Exhaustive edge cases already covered by existing Vitest unit tests.

## Acceptance criteria

- `cd frontend && npm run test:e2e` runs without errors against a locally running backend and passes all tests.
- The happy-path test exercises day values `0`, `0.5`, and `1` and asserts the correct cell label after each change.
- The happy-path test asserts the `CraSummaryPanel` monthly total matches the sum of set days.
- The happy-path test asserts CRA status is `VALIDATED` after the validation step.
- The happy-path test asserts the validated CRA row appears in the History view with the correct month and status.
- The happy-path test captures a `download` event when the PDF button is clicked (no manual interaction).
- At least one test uses `page.route()` to simulate a 500 response on a day-update call and asserts the UI displays an error.
- `frontend/playwright.config.ts` exists and is valid (Playwright can parse it without errors).
- The local run command is documented in the project's dev-setup documentation.
