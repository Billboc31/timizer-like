import { test, expect } from '@playwright/test';
import type { CraPublicView } from '../src/types/craPublicView';

const VALID_TOKEN = 'valid-test-token-abc123';
const INVALID_TOKEN = 'bad-token';

const MOCK_CRA: CraPublicView = {
  month: 7,
  year: 2026,
  providerFirstName: 'Alice',
  providerLastName: 'Durand',
  providerCompany: 'Provider SARL',
  clientFirstName: 'Bob',
  clientLastName: 'Martin',
  clientCompany: 'Client SA',
  clientContactEmail: 'bob@client.example',
  providerSignatureDate: '2026-07-31',
  totalWorkedDays: 20.5,
  dayEntries: [
    { day: 1, worked: 1, note: null },
    { day: 2, worked: 0.5, note: 'demi-journée' },
  ],
};

test.describe('Public CRA signature page', () => {
  test('valid token — renders CRA data', async ({ page }) => {
    await page.route(`**/public/cra-link/${VALID_TOKEN}`, async (route) => {
      await route.fulfill({ json: MOCK_CRA });
    });

    await page.goto(`/sign/${VALID_TOKEN}`);

    await expect(page.getByTestId('cra-public-view')).toBeVisible();
    await expect(page.getByText(/Juillet 2026/)).toBeVisible();
    await expect(page.getByText(/Alice Durand/)).toBeVisible();
    await expect(page.getByText(/Provider SARL/)).toBeVisible();
    await expect(page.getByText(/Bob Martin/)).toBeVisible();
    await expect(page.getByTestId('total-worked-days')).toContainText('20.5');
  });

  test('invalid token — renders generic error message', async ({ page }) => {
    await page.route(`**/public/cra-link/${INVALID_TOKEN}`, async (route) => {
      await route.fulfill({ status: 404, json: { error: 'token_invalid' } });
    });

    await page.goto(`/sign/${INVALID_TOKEN}`);

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(
      'Ce lien est invalide, expiré ou déjà utilisé.',
    );
  });
});
