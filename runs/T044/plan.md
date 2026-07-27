## Objective
Add Playwright screenshot-based visual regression tests covering the application's most important screens — CRA entry, history, and representative loading/error states — with deterministic viewport, date, and fixture data so baselines are stable and a genuine layout change causes a test failure.

## Included

**New dependencies (`frontend/package.json`)**
- `@playwright/test` as a devDependency
- Add scripts: `"test:visual": "playwright test"` and `"test:visual:update": "playwright test --update-snapshots"`

**New config (`frontend/playwright.config.ts`)**
- `webServer` block pointing at `vite dev` on port 5173
- Two named projects: `desktop` (1280 × 800) and `mobile` (390 × 844, Pixel 7 UA)
- `expect.toHaveScreenshot` threshold: pixel-diff tolerance ≤ 0.1 %
- `fullyParallel: false` (consistent rendering order)
- Snapshot directory: `e2e/__snapshots__`

**Fixture file (`frontend/e2e/fixtures/cra-fixtures.ts`)**
- `mockCraInProgress`: a CRA object for March 2024, status `IN_PROGRESS`, with ≥ 5 days partially filled
- `mockCraValidated`: same period, status `VALIDATED`, all working days filled
- `mockCraList`: array of 3 CRAs at various statuses for the history table
- All dates are absolute strings (no `new Date()` / `Date.now()`)

**Visual test file (`frontend/e2e/visual.spec.ts`)**

Six test cases, each using `page.route()` to intercept API calls before navigation:

| # | Test name | Viewport | API mock | Screenshot target |
|---|---|---|---|---|
| 1 | CRA screen — desktop | desktop | `mockCraInProgress` | full page after calendar renders |
| 2 | CRA screen — mobile | mobile | `mockCraInProgress` | full page after calendar renders |
| 3 | Validated CRA | desktop | `mockCraValidated` | full page; validation panel shows validated badge |
| 4 | History page | desktop | `mockCraList` | full page with populated history table |
| 5 | Loading state | desktop | delayed response (never resolves during screenshot) | CalendarGrid `data-testid="calendar-loading"` element |
| 6 | Error state | desktop | API returns 500 | error message element via `data-testid` |

Each test:
1. Calls `page.route('/api/**', ...)` before `page.goto('/')`
2. Navigates to the correct view (via UI interaction or URL param, depending on router state)
3. Waits for `networkidle` + `page.waitForLoadState('domcontentloaded')`
4. Disables CSS animations: `page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }' })`
5. Calls `expect(page).toHaveScreenshot('test-name.png')`

**Baseline snapshots (`frontend/e2e/__snapshots__/`)**
- Generated on first run with `--update-snapshots` and committed to the repo
- Naming: `visual-desktop-cra-screen-1.png`, `visual-mobile-cra-screen-1.png`, etc.

**README update (`frontend/README.md` or inline in `playwright.config.ts` comment)**
- One-line doc of the two commands: `npm run test:visual` / `npm run test:visual:update`

## Excluded

- Visual coverage for individual minor components (CraSummaryPanel, CraValidation in isolation)
- CI/CD pipeline integration (no GitHub Actions changes)
- Percy / Chromatic cloud diffing
- Cross-OS pixel-perfect parity guarantee
- Automated baseline updates on intentional design changes (manual `--update-snapshots` required)
- Any backend or API changes

## Acceptance criteria

- `npm run test:visual` runs without browser install errors (`npx playwright install chromium` documented in README or package.json `postinstall`)
- Desktop and mobile screenshots for the main CRA screen are committed as baselines in `e2e/__snapshots__/`
- History page baseline exists and shows the populated table
- At least one loading-state and one error-state baseline exist
- All six tests pass against the committed baselines on a clean checkout
- Manually adding `margin-top: 100px` to a shared layout element causes at least one test to fail with a diff report
- No test reads `new Date()` or `Date.now()` — all dates come from `cra-fixtures.ts` constants
