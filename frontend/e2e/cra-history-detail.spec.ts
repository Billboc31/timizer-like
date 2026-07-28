import { test, expect } from '@playwright/test';

test.describe('CRA history detail view', () => {
  test('open → inspect → back — validated CRA', async ({ page }) => {
    const craId = 10;
    const month = 7;
    const year = 2026;

    const summary = {
      id: craId,
      month,
      year,
      status: 'VALIDATED',
      totalWorkedDays: 21,
      validationDate: '2026-07-31',
    };

    const detail = {
      id: craId,
      month,
      year,
      status: 'VALIDATED',
      totalWorkedDays: 21,
      validationDate: '2026-07-31',
      providerSignatureDate: '2026-07-31',
      clientSignatureDate: null,
      providerFirstName: 'Jean',
      providerLastName: 'Dupont',
      providerCompany: 'Prestataire SARL',
      clientFirstName: 'Marie',
      clientLastName: 'Martin',
      clientCompany: 'Client SA',
      clientContactFirstName: 'Pierre',
      clientContactLastName: 'Durand',
      days: Array.from({ length: 23 }, (_, i) => ({
        day: i + 1,
        worked: 1,
        note: null,
      })),
    };

    // GET /api/cras — list
    await page.route((url: URL) => url.pathname === '/api/cras', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({ json: [summary] });
      } else {
        await route.continue();
      }
    });

    // GET /api/cras/:id — detail
    await page.route(
      (url: URL) => url.pathname === `/api/cras/${craId}`,
      async (route, request) => {
        if (request.method() === 'GET') {
          await route.fulfill({ json: detail });
        } else {
          await route.continue();
        }
      },
    );

    // GET /api/cras/:id/pdf — PDF download
    await page.route('**/api/cras/*/pdf', async (route) => {
      await route.fulfill({
        contentType: 'application/pdf',
        body: '%PDF-1.4 test',
        headers: { 'Content-Disposition': `attachment; filename="cra-${year}-07.pdf"` },
      });
    });

    await page.goto('/');

    // Navigate to history
    await page.getByRole('button', { name: 'History' }).click();

    // History list should show the validated CRA card
    await expect(page.getByText('July 2026')).toBeVisible();
    await expect(page.getByText('VALIDATED')).toBeVisible();

    // Click Open to navigate to detail view
    await page.getByRole('button', { name: /open cra for july 2026/i }).click();

    // Detail view: period heading
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Juillet 2026');
    await expect(page.getByText('1 juillet 2026 – 31 juillet 2026')).toBeVisible();

    // Metadata visible
    await expect(page.getByText('Jean Dupont')).toBeVisible();
    await expect(page.getByText('Prestataire SARL')).toBeVisible();
    await expect(page.getByText('Marie Martin')).toBeVisible();
    await expect(page.getByText('Pierre Durand')).toBeVisible();

    // Calendar shown (read-only cells)
    await expect(page.getByTestId('day-cell').first()).toBeVisible();

    // PDF download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /télécharger le pdf/i }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/cra-.*\.pdf/);

    // Back to history list
    await page.getByRole('button', { name: /retour à l'historique/i }).click();
    await expect(page.getByText('July 2026')).toBeVisible();
    // Detail heading should no longer be present
    await expect(page.getByRole('heading', { level: 1 })).not.toBeVisible();
  });

  test('error state shown when detail API fails', async ({ page }) => {
    const craId = 99;

    await page.route((url: URL) => url.pathname === '/api/cras', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          json: [{
            id: craId, month: 7, year: 2026,
            status: 'VALIDATED', totalWorkedDays: 5, validationDate: '2026-07-01',
          }],
        });
      } else {
        await route.continue();
      }
    });

    await page.route(
      (url: URL) => url.pathname === `/api/cras/${craId}`,
      async (route) => {
        await route.fulfill({ status: 500, json: { error: 'Internal error' } });
      },
    );

    await page.goto('/');
    await page.getByRole('button', { name: 'History' }).click();
    await expect(page.getByText('July 2026')).toBeVisible();

    await page.getByRole('button', { name: /open cra for july 2026/i }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
