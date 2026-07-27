# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> Validated CRA
- Location: e2e/visual.spec.ts:35:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#month-select')

```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | import {
  3  |   mockCraInProgressSummary,
  4  |   mockCraValidatedSummary,
  5  |   mockCraList,
  6  |   type CraSummaryApi,
  7  | } from './fixtures/cra-fixtures';
  8  | 
  9  | const DISABLE_ANIMATIONS =
  10 |   '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
  11 | 
  12 | async function mockCrasEndpoint(page: Page, data: CraSummaryApi[]) {
  13 |   await page.route('**/api/cras', route =>
  14 |     route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) }),
  15 |   );
  16 | }
  17 | 
  18 | async function navigateToCraScreen(page: Page, month: number, year: number) {
  19 |   await page.goto('/');
  20 |   await page.waitForLoadState('networkidle');
> 21 |   await page.selectOption('#month-select', String(month));
     |              ^ Error: page.selectOption: Test timeout of 30000ms exceeded.
  22 |   await page.fill('#year-input', String(year));
  23 |   await page.click('button:has-text("Open CRA")');
  24 |   await page.waitForSelector('.calendar-grid');
  25 |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  26 | }
  27 | 
  28 | // Runs on both desktop and mobile projects to produce two baselines.
  29 | test('CRA screen', async ({ page }) => {
  30 |   await mockCrasEndpoint(page, [mockCraInProgressSummary]);
  31 |   await navigateToCraScreen(page, 3, 2024);
  32 |   await expect(page).toHaveScreenshot('cra-screen.png', { fullPage: true });
  33 | });
  34 | 
  35 | test('Validated CRA', async ({ page }, testInfo) => {
  36 |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  37 |   await mockCrasEndpoint(page, [mockCraValidatedSummary]);
  38 |   await navigateToCraScreen(page, 3, 2024);
  39 |   await expect(page).toHaveScreenshot('cra-validated.png', { fullPage: true });
  40 | });
  41 | 
  42 | test('History page', async ({ page }, testInfo) => {
  43 |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  44 |   await mockCrasEndpoint(page, mockCraList);
  45 |   await page.goto('/');
  46 |   await page.waitForLoadState('networkidle');
  47 |   await page.click('button:has-text("History")');
  48 |   await page.waitForSelector('.cra-history__table');
  49 |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  50 |   await expect(page).toHaveScreenshot('history.png', { fullPage: true });
  51 | });
  52 | 
  53 | test('Loading state', async ({ page }, testInfo) => {
  54 |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  55 |   // Route handler that never fulfills keeps the loading state visible.
  56 |   await page.route('**/api/cras', () => { /* intentionally stalled */ });
  57 |   await page.goto('/');
  58 |   await page.waitForSelector('p:has-text("Loading...")');
  59 |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  60 |   await expect(page).toHaveScreenshot('loading-state.png', { fullPage: true });
  61 | });
  62 | 
  63 | test('Error state', async ({ page }, testInfo) => {
  64 |   test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  65 |   await page.route('**/api/cras', route =>
  66 |     route.fulfill({ status: 500, body: 'Internal Server Error' }),
  67 |   );
  68 |   await page.goto('/');
  69 |   await page.waitForLoadState('networkidle');
  70 |   await page.waitForSelector('[role="alert"]');
  71 |   await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  72 |   await expect(page).toHaveScreenshot('error-state.png', { fullPage: true });
  73 | });
  74 | 
```