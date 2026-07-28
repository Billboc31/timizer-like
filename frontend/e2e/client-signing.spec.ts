import { test, expect } from '@playwright/test';
import type { CraPublicView } from '../src/types/craPublicView';

const VALID_TOKEN = 'valid-sign-token-xyz';
const CONSUMED_TOKEN = 'consumed-token-xyz';

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

test.describe('Client signing workflow', () => {
  test('full workflow — view CRA, fill form, draw signature, submit, see success screen', async ({ page }) => {
    await page.route(`**/public/cra-link/${VALID_TOKEN}`, async (route) => {
      await route.fulfill({ json: MOCK_CRA });
    });

    await page.route(`**/public/cra-link/${VALID_TOKEN}/sign`, async (route) => {
      await route.fulfill({ status: 200, body: '' });
    });

    await page.goto(`/sign/${VALID_TOKEN}`);

    // CRA read-only view is displayed
    await expect(page.getByTestId('cra-public-view')).toBeVisible();
    await expect(page.getByText(/Juillet 2026/)).toBeVisible();
    await expect(page.getByText(/Alice Durand/)).toBeVisible();

    // Signature form is present
    await expect(page.getByTestId('client-signature-form')).toBeVisible();
    await expect(page.getByTestId('submit-button')).toBeDisabled();

    // Fill signer name
    await page.getByTestId('signer-name-input').fill('Bob Martin');

    // Submit still disabled (no consent, no signature)
    await expect(page.getByTestId('submit-button')).toBeDisabled();

    // Check consent
    await page.getByTestId('consent-checkbox').check();

    // Submit still disabled (no signature)
    await expect(page.getByTestId('submit-button')).toBeDisabled();

    // Draw on signature canvas via mouse drag
    const canvas = page.getByRole('img', { name: /signature/i });
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 60);
      await page.mouse.up();
    }

    // Submit now enabled
    await expect(page.getByTestId('submit-button')).not.toBeDisabled();

    // Submit
    await page.getByTestId('submit-button').click();

    // Success screen shown
    await expect(page.getByTestId('signing-success')).toBeVisible();
    await expect(page.getByTestId('signing-success')).toContainText('Le CRA a bien été signé');
    await expect(page.getByTestId('signing-success')).toContainText('Bob Martin');

    // Signature form is gone
    await expect(page.getByTestId('client-signature-form')).not.toBeVisible();
  });

  test('clear button resets canvas and re-disables submit', async ({ page }) => {
    await page.route(`**/public/cra-link/${VALID_TOKEN}`, async (route) => {
      await route.fulfill({ json: MOCK_CRA });
    });

    await page.goto(`/sign/${VALID_TOKEN}`);
    await expect(page.getByTestId('client-signature-form')).toBeVisible();

    await page.getByTestId('signer-name-input').fill('Bob');
    await page.getByTestId('consent-checkbox').check();

    const canvas = page.getByRole('img', { name: /signature/i });
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + 50);
      await page.mouse.up();
    }
    await expect(page.getByTestId('submit-button')).not.toBeDisabled();

    // Clear the signature
    await page.getByTestId('clear-button').click();
    await expect(page.getByTestId('submit-button')).toBeDisabled();
  });

  test('second visit with consumed token shows error state', async ({ page }) => {
    await page.route(`**/public/cra-link/${CONSUMED_TOKEN}`, async (route) => {
      await route.fulfill({ status: 404, json: { error: 'token_invalid' } });
    });

    await page.goto(`/sign/${CONSUMED_TOKEN}`);

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('Ce lien est invalide, expiré ou déjà utilisé.');
    await expect(page.getByTestId('client-signature-form')).not.toBeVisible();
  });

  test('API error during signing shows error message without navigating away', async ({ page }) => {
    await page.route(`**/public/cra-link/${VALID_TOKEN}`, async (route) => {
      await route.fulfill({ json: MOCK_CRA });
    });

    await page.route(`**/public/cra-link/${VALID_TOKEN}/sign`, async (route) => {
      await route.fulfill({ status: 500, json: {} });
    });

    await page.goto(`/sign/${VALID_TOKEN}`);
    await expect(page.getByTestId('client-signature-form')).toBeVisible();

    await page.getByTestId('signer-name-input').fill('Bob');
    await page.getByTestId('consent-checkbox').check();

    const canvas = page.getByRole('img', { name: /signature/i });
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + 50);
      await page.mouse.up();
    }

    await page.getByTestId('submit-button').click();

    await expect(page.getByTestId('form-error')).toBeVisible();
    await expect(page.getByTestId('client-signature-form')).toBeVisible();
    await expect(page.getByTestId('signing-success')).not.toBeVisible();
  });
});
