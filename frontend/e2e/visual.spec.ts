import { test, expect, type Page } from '@playwright/test';
import {
  mockCraInProgressSummary,
  mockCraValidatedSummary,
  mockCraList,
  type CraSummaryApi,
} from './fixtures/cra-fixtures';

const DISABLE_ANIMATIONS =
  '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';

async function mockCrasEndpoint(page: Page, data: CraSummaryApi[]) {
  await page.route('**/api/cras', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) }),
  );
}

async function navigateToCraScreen(page: Page, month: number, year: number) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.selectOption('#month-select', String(month));
  await page.fill('#year-input', String(year));
  await page.click('button:has-text("Open CRA")');
  await page.waitForSelector('.calendar-grid');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
}

// Runs on both desktop and mobile projects to produce two baselines.
test('CRA screen', async ({ page }) => {
  await mockCrasEndpoint(page, [mockCraInProgressSummary]);
  await navigateToCraScreen(page, 3, 2024);
  await expect(page).toHaveScreenshot('cra-screen.png', { fullPage: true });
});

test('Validated CRA', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  await mockCrasEndpoint(page, [mockCraValidatedSummary]);
  await navigateToCraScreen(page, 3, 2024);
  await expect(page).toHaveScreenshot('cra-validated.png', { fullPage: true });
});

test('History page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  await mockCrasEndpoint(page, mockCraList);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.click('button:has-text("History")');
  await page.waitForSelector('.cra-history__table');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  await expect(page).toHaveScreenshot('history.png', { fullPage: true });
});

test('Loading state', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  // Route handler that never fulfills keeps the loading state visible.
  await page.route('**/api/cras', () => { /* intentionally stalled */ });
  await page.goto('/');
  await page.waitForSelector('p:has-text("Loading...")');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  await expect(page).toHaveScreenshot('loading-state.png', { fullPage: true });
});

test('Error state', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  await page.route('**/api/cras', route =>
    route.fulfill({ status: 500, body: 'Internal Server Error' }),
  );
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('[role="alert"]');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  await expect(page).toHaveScreenshot('error-state.png', { fullPage: true });
});

test('Annual calendar – desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'desktop only');
  await mockCrasEndpoint(page, mockCraList);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.annual-calendar-grid');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  await expect(page).toHaveScreenshot('annual-calendar-desktop.png', { fullPage: true });
});

test('Annual calendar – tablet', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'tablet', 'tablet only');
  await mockCrasEndpoint(page, mockCraList);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.annual-calendar-grid');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  await expect(page).toHaveScreenshot('annual-calendar-tablet.png', { fullPage: true });
});

test('Annual calendar – mobile', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await mockCrasEndpoint(page, mockCraList);
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.annual-calendar-grid');
  await page.addStyleTag({ content: DISABLE_ANIMATIONS });
  await expect(page).toHaveScreenshot('annual-calendar-mobile.png', { fullPage: true });
});
