# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> History page
- Location: e2e/visual.spec.ts:42:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.cra-history__table') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]: Timizer Like
    - navigation "Main navigation" [ref=e6]:
      - button "New CRA" [ref=e7] [cursor=pointer]
      - button "History" [active] [ref=e8] [cursor=pointer]
      - button "Paramètres" [ref=e9] [cursor=pointer]
  - main [ref=e10]:
    - heading "CRA History" [level=1] [ref=e13]
    - list [ref=e15]:
      - listitem [ref=e16]:
        - generic [ref=e17]: March 2024
        - generic [ref=e18]:
          - generic [ref=e19]: Brouillon
          - generic [ref=e20]: "Days: 5"
          - generic [ref=e21]: "Validated: —"
        - button "Open CRA for March 2024" [ref=e23] [cursor=pointer]: Open
      - listitem [ref=e24]:
        - generic [ref=e25]: February 2024
        - generic [ref=e26]:
          - generic [ref=e27]: Validé
          - generic [ref=e28]: "Days: 18"
          - generic [ref=e29]: "Validated: 2024-03-01"
        - generic [ref=e30]:
          - button "Open CRA for February 2024" [ref=e31] [cursor=pointer]: Open
          - button "Download PDF for February 2024" [ref=e32] [cursor=pointer]: Download PDF
      - listitem [ref=e33]:
        - generic [ref=e34]: January 2024
        - generic [ref=e35]:
          - generic [ref=e36]: Validé
          - generic [ref=e37]: "Days: 20"
          - generic [ref=e38]: "Validated: 2024-02-01"
        - generic [ref=e39]:
          - button "Open CRA for January 2024" [ref=e40] [cursor=pointer]: Open
          - button "Download PDF for January 2024" [ref=e41] [cursor=pointer]: Download PDF
    - generic [ref=e42]: No CRA data available.
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import {
  3   |   mockCraInProgressSummary,
  4   |   mockCraValidatedSummary,
  5   |   mockCraList,
  6   |   type CraSummaryApi,
  7   | } from './fixtures/cra-fixtures';
  8   | 
  9   | const DISABLE_ANIMATIONS =
  10  |   '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
  11  | 
  12  | async function mockCrasEndpoint(page: Page, data: CraSummaryApi[]) {
  13  |   await page.route('**/api/cras', route =>
  14  |     route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) }),
  15  |   );
  16  | }
  17  | 
  18  | async function navigateToCraScreen(page: Page, month: number, year: number) {
  19  |   await page.goto('/');
  20  |   await page.waitForLoadState('networkidle');
  21  |   await page.selectOption('#month-select', String(month));
  22  |   await page.fill('#year-input', String(year));
  23  |   await page.click('button:has-text("Open CRA")');
  24  |   await page.waitForSelector('.calendar-grid');
  25  |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  26  | }
  27  | 
  28  | // Runs on both desktop and mobile projects to produce two baselines.
  29  | test('CRA screen', async ({ page }) => {
  30  |   await mockCrasEndpoint(page, [mockCraInProgressSummary]);
  31  |   await navigateToCraScreen(page, 3, 2024);
  32  |   await expect(page).toHaveScreenshot('cra-screen.png', { fullPage: true });
  33  | });
  34  | 
  35  | test('Validated CRA', async ({ page }, testInfo) => {
  36  |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  37  |   await mockCrasEndpoint(page, [mockCraValidatedSummary]);
  38  |   await navigateToCraScreen(page, 3, 2024);
  39  |   await expect(page).toHaveScreenshot('cra-validated.png', { fullPage: true });
  40  | });
  41  | 
  42  | test('History page', async ({ page }, testInfo) => {
  43  |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  44  |   await mockCrasEndpoint(page, mockCraList);
  45  |   await page.goto('/');
  46  |   await page.waitForLoadState('networkidle');
  47  |   await page.click('button:has-text("History")');
> 48  |   await page.waitForSelector('.cra-history__table');
      |              ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  49  |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  50  |   await expect(page).toHaveScreenshot('history.png', { fullPage: true });
  51  | });
  52  | 
  53  | test('Loading state', async ({ page }, testInfo) => {
  54  |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  55  |   // Route handler that never fulfills keeps the loading state visible.
  56  |   await page.route('**/api/cras', () => { /* intentionally stalled */ });
  57  |   await page.goto('/');
  58  |   await page.waitForSelector('p:has-text("Loading...")');
  59  |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  60  |   await expect(page).toHaveScreenshot('loading-state.png', { fullPage: true });
  61  | });
  62  | 
  63  | test('Error state', async ({ page }, testInfo) => {
  64  |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  65  |   await page.route('**/api/cras', route =>
  66  |     route.fulfill({ status: 500, body: 'Internal Server Error' }),
  67  |   );
  68  |   await page.goto('/');
  69  |   await page.waitForLoadState('networkidle');
  70  |   await page.waitForSelector('[role="alert"]');
  71  |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  72  |   await expect(page).toHaveScreenshot('error-state.png', { fullPage: true });
  73  | });
  74  | 
  75  | test('Annual calendar – desktop', async ({ page }, testInfo) => {
  76  |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  77  |   await mockCrasEndpoint(page, mockCraList);
  78  |   await page.goto('/');
  79  |   await page.waitForLoadState('networkidle');
  80  |   await page.waitForSelector('.annual-calendar-grid');
  81  |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  82  |   await expect(page).toHaveScreenshot('annual-calendar-desktop.png', { fullPage: true });
  83  | });
  84  | 
  85  | test('Annual calendar – tablet', async ({ page }, testInfo) => {
  86  |   test.skip(testInfo.project.name !== 'tablet', 'tablet only');
  87  |   await mockCrasEndpoint(page, mockCraList);
  88  |   await page.goto('/');
  89  |   await page.waitForLoadState('networkidle');
  90  |   await page.waitForSelector('.annual-calendar-grid');
  91  |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  92  |   await expect(page).toHaveScreenshot('annual-calendar-tablet.png', { fullPage: true });
  93  | });
  94  | 
  95  | test('Annual calendar – mobile', async ({ page }, testInfo) => {
  96  |   test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  97  |   await mockCrasEndpoint(page, mockCraList);
  98  |   await page.goto('/');
  99  |   await page.waitForLoadState('networkidle');
  100 |   await page.waitForSelector('.annual-calendar-grid');
  101 |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  102 |   await expect(page).toHaveScreenshot('annual-calendar-mobile.png', { fullPage: true });
  103 | });
  104 | 
```