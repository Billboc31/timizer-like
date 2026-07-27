import { test, expect } from '@playwright/test';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

test.describe('CRA monthly workflow', () => {
  test('happy path — complete workflow from creation to PDF download', async ({ page }) => {
    const craId = 1;
    const month = 7;
    const year = 2026;
    const monthName = MONTH_NAMES[month - 1];

    // Mutable state shared across route handlers
    const cra = {
      id: craId,
      month,
      year,
      status: 'DRAFT' as 'DRAFT' | 'VALIDATED',
      totalWorkedDays: 0,
      days: [] as Array<{ day: number; worked: number; note: null }>,
      validationDate: null as string | null,
      providerSignatureDate: null,
    };
    let listResponse: unknown[] = [];

    // GET /api/cras — list (initially empty, updated after create/validate)
    await page.route((url: URL) => url.pathname === '/api/cras', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({ json: listResponse });
      } else {
        await route.continue();
      }
    });

    // POST /api/cra — create CRA
    await page.route((url: URL) => url.pathname === '/api/cra', async (route) => {
      listResponse = [{ id: craId, month, year, status: 'DRAFT', totalWorkedDays: 0, validationDate: null }];
      await route.fulfill({ json: cra });
    });

    // PATCH /api/cras/*/days/* — update a day value
    await page.route('**/api/cras/*/days/**', async (route, request) => {
      const body = request.postDataJSON() as { workValue: number };
      const segments = new URL(request.url()).pathname.split('/');
      const dateStr = segments[segments.length - 1];
      const dayNum = parseInt(dateStr.split('-')[2]);
      const idx = cra.days.findIndex(d => d.day === dayNum);
      if (idx >= 0) {
        cra.days[idx].worked = body.workValue;
      } else {
        cra.days.push({ day: dayNum, worked: body.workValue, note: null });
      }
      cra.totalWorkedDays = cra.days.reduce((sum, d) => sum + d.worked, 0);
      await route.fulfill({ json: cra });
    });

    // POST /api/cras/*/validate — validate CRA
    await page.route('**/api/cras/*/validate', async (route) => {
      cra.status = 'VALIDATED';
      cra.validationDate = '2026-07-27';
      listResponse = [{
        id: craId, month, year,
        status: 'VALIDATED',
        totalWorkedDays: cra.totalWorkedDays,
        validationDate: cra.validationDate,
      }];
      await route.fulfill({ json: cra });
    });

    // GET /api/cras/*/pdf — PDF download
    await page.route('**/api/cras/*/pdf', async (route) => {
      await route.fulfill({
        contentType: 'application/pdf',
        body: '%PDF-1.4 test',
        headers: { 'Content-Disposition': `attachment; filename="cra-${year}-07.pdf"` },
      });
    });

    // ── Navigate and assert month selector ────────────────────────────────
    await page.goto('/');
    await expect(page.getByLabel('Month')).toBeVisible();

    // Select July 2026 (matches current defaults, but be explicit)
    await page.getByLabel('Month').selectOption({ value: String(month) });
    await page.getByLabel('Year').fill(String(year));

    // ── Create the CRA ────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Create CRA' }).click();
    await expect(page.getByTestId('day-cell').first()).toBeVisible();

    // ── Cycle a weekday cell through 0 → 1 → 0.5 → 0 → 1 ────────────────
    const weekdayCell = page.locator('[data-testid="day-cell"]:not(.day-cell--weekend)').first();

    await weekdayCell.click();
    await expect(weekdayCell.locator('.day-cell__worked')).toHaveText('1');

    await weekdayCell.click();
    await expect(weekdayCell.locator('.day-cell__worked')).toHaveText('0.5');

    // Assert summary total reflects 0.5 worked day
    await expect(page.getByTestId('summary-total')).toHaveText('0.5');

    await weekdayCell.click();
    await expect(weekdayCell.locator('.day-cell__worked')).toHaveText('0');

    // Set back to 1 for a non-empty CRA before validation
    await weekdayCell.click();
    await expect(weekdayCell.locator('.day-cell__worked')).toHaveText('1');
    await expect(page.getByTestId('summary-total')).toHaveText('1');

    // ── Validate the CRA ─────────────────────────────────────────────────
    await page.getByRole('button', { name: 'Valider le CRA' }).click();
    await page.getByRole('button', { name: 'Confirmer' }).click();
    await expect(page.getByTestId('summary-status')).toHaveText('VALIDATED');

    // ── Check history ────────────────────────────────────────────────────
    await page.getByRole('button', { name: 'History' }).click();
    const historyRow = page
      .locator('.cra-history__row')
      .filter({ hasText: `${monthName} ${year}` });
    await expect(historyRow).toBeVisible();
    await expect(historyRow).toContainText('VALIDATED');

    // ── PDF download ─────────────────────────────────────────────────────
    const downloadPromise = page.waitForEvent('download');
    await historyRow.getByRole('button', { name: 'Download PDF' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/cra-.*\.pdf/);
  });

  test('API failure — day update displays an error message', async ({ page }) => {
    const month = 7;
    const year = 2026;

    // List returns one DRAFT CRA so the "Open CRA" button is shown
    await page.route((url: URL) => url.pathname === '/api/cras', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          json: [{ id: 2, month, year, status: 'DRAFT', totalWorkedDays: 0, validationDate: null }],
        });
      } else {
        await route.continue();
      }
    });

    // Day update returns 500
    await page.route('**/api/cras/*/days/**', async (route) => {
      await route.fulfill({ status: 500, json: {} });
    });

    await page.goto('/');
    await page.getByLabel('Month').selectOption({ value: String(month) });
    await page.getByLabel('Year').fill(String(year));
    await page.getByRole('button', { name: 'Open CRA' }).click();

    // Wait for calendar to render
    await expect(page.getByTestId('day-cell').first()).toBeVisible();

    // Click a weekday cell — the PATCH returns 500
    await page.locator('[data-testid="day-cell"]:not(.day-cell--weekend)').first().click();

    // An error alert must appear
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
