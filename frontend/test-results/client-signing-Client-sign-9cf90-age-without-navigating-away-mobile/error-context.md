# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: client-signing.spec.ts >> Client signing workflow >> API error during signing shows error message without navigating away
- Location: e2e/client-signing.spec.ts:121:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('client-signature-form')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('client-signature-form')

```

```yaml
- heading "Timizer Like" [level=1]
- navigation:
  - button "New CRA"
  - button "History"
- alert: "Failed to list CRAs: 502"
- text: No CRA data available.
```

# Test source

```ts
  31  |     await page.route(`**/public/cra-link/${VALID_TOKEN}/sign`, async (route) => {
  32  |       await route.fulfill({ status: 200, body: '' });
  33  |     });
  34  | 
  35  |     await page.goto(`/sign/${VALID_TOKEN}`);
  36  | 
  37  |     // CRA read-only view is displayed
  38  |     await expect(page.getByTestId('cra-public-view')).toBeVisible();
  39  |     await expect(page.getByText(/Juillet 2026/)).toBeVisible();
  40  |     await expect(page.getByText(/Alice Durand/)).toBeVisible();
  41  | 
  42  |     // Signature form is present
  43  |     await expect(page.getByTestId('client-signature-form')).toBeVisible();
  44  |     await expect(page.getByTestId('submit-button')).toBeDisabled();
  45  | 
  46  |     // Fill signer name
  47  |     await page.getByTestId('signer-name-input').fill('Bob Martin');
  48  | 
  49  |     // Submit still disabled (no consent, no signature)
  50  |     await expect(page.getByTestId('submit-button')).toBeDisabled();
  51  | 
  52  |     // Check consent
  53  |     await page.getByTestId('consent-checkbox').check();
  54  | 
  55  |     // Submit still disabled (no signature)
  56  |     await expect(page.getByTestId('submit-button')).toBeDisabled();
  57  | 
  58  |     // Draw on signature canvas via mouse drag
  59  |     const canvas = page.getByRole('img', { name: /signature/i });
  60  |     const box = await canvas.boundingBox();
  61  |     if (box) {
  62  |       await page.mouse.move(box.x + 20, box.y + 20);
  63  |       await page.mouse.down();
  64  |       await page.mouse.move(box.x + 100, box.y + 60);
  65  |       await page.mouse.up();
  66  |     }
  67  | 
  68  |     // Submit now enabled
  69  |     await expect(page.getByTestId('submit-button')).not.toBeDisabled();
  70  | 
  71  |     // Submit
  72  |     await page.getByTestId('submit-button').click();
  73  | 
  74  |     // Success screen shown
  75  |     await expect(page.getByTestId('signing-success')).toBeVisible();
  76  |     await expect(page.getByTestId('signing-success')).toContainText('Le CRA a bien été signé');
  77  |     await expect(page.getByTestId('signing-success')).toContainText('Bob Martin');
  78  | 
  79  |     // Signature form is gone
  80  |     await expect(page.getByTestId('client-signature-form')).not.toBeVisible();
  81  |   });
  82  | 
  83  |   test('clear button resets canvas and re-disables submit', async ({ page }) => {
  84  |     await page.route(`**/public/cra-link/${VALID_TOKEN}`, async (route) => {
  85  |       await route.fulfill({ json: MOCK_CRA });
  86  |     });
  87  | 
  88  |     await page.goto(`/sign/${VALID_TOKEN}`);
  89  |     await expect(page.getByTestId('client-signature-form')).toBeVisible();
  90  | 
  91  |     await page.getByTestId('signer-name-input').fill('Bob');
  92  |     await page.getByTestId('consent-checkbox').check();
  93  | 
  94  |     const canvas = page.getByRole('img', { name: /signature/i });
  95  |     const box = await canvas.boundingBox();
  96  |     if (box) {
  97  |       await page.mouse.move(box.x + 20, box.y + 20);
  98  |       await page.mouse.down();
  99  |       await page.mouse.move(box.x + 80, box.y + 50);
  100 |       await page.mouse.up();
  101 |     }
  102 |     await expect(page.getByTestId('submit-button')).not.toBeDisabled();
  103 | 
  104 |     // Clear the signature
  105 |     await page.getByTestId('clear-button').click();
  106 |     await expect(page.getByTestId('submit-button')).toBeDisabled();
  107 |   });
  108 | 
  109 |   test('second visit with consumed token shows error state', async ({ page }) => {
  110 |     await page.route(`**/public/cra-link/${CONSUMED_TOKEN}`, async (route) => {
  111 |       await route.fulfill({ status: 404, json: { error: 'token_invalid' } });
  112 |     });
  113 | 
  114 |     await page.goto(`/sign/${CONSUMED_TOKEN}`);
  115 | 
  116 |     await expect(page.getByRole('alert')).toBeVisible();
  117 |     await expect(page.getByRole('alert')).toContainText('Ce lien est invalide, expiré ou déjà utilisé.');
  118 |     await expect(page.getByTestId('client-signature-form')).not.toBeVisible();
  119 |   });
  120 | 
  121 |   test('API error during signing shows error message without navigating away', async ({ page }) => {
  122 |     await page.route(`**/public/cra-link/${VALID_TOKEN}`, async (route) => {
  123 |       await route.fulfill({ json: MOCK_CRA });
  124 |     });
  125 | 
  126 |     await page.route(`**/public/cra-link/${VALID_TOKEN}/sign`, async (route) => {
  127 |       await route.fulfill({ status: 500, json: {} });
  128 |     });
  129 | 
  130 |     await page.goto(`/sign/${VALID_TOKEN}`);
> 131 |     await expect(page.getByTestId('client-signature-form')).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
  132 | 
  133 |     await page.getByTestId('signer-name-input').fill('Bob');
  134 |     await page.getByTestId('consent-checkbox').check();
  135 | 
  136 |     const canvas = page.getByRole('img', { name: /signature/i });
  137 |     const box = await canvas.boundingBox();
  138 |     if (box) {
  139 |       await page.mouse.move(box.x + 20, box.y + 20);
  140 |       await page.mouse.down();
  141 |       await page.mouse.move(box.x + 80, box.y + 50);
  142 |       await page.mouse.up();
  143 |     }
  144 | 
  145 |     await page.getByTestId('submit-button').click();
  146 | 
  147 |     await expect(page.getByTestId('form-error')).toBeVisible();
  148 |     await expect(page.getByTestId('client-signature-form')).toBeVisible();
  149 |     await expect(page.getByTestId('signing-success')).not.toBeVisible();
  150 |   });
  151 | });
  152 | 
```