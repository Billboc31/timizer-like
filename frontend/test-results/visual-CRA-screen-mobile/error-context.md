# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> CRA screen
- Location: e2e/visual.spec.ts:29:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#month-select')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]: Timizer Like
    - navigation "Main navigation" [ref=e6]:
      - button "New CRA" [ref=e7] [cursor=pointer]
      - button "History" [ref=e8] [cursor=pointer]
      - button "Paramètres" [ref=e9] [cursor=pointer]
  - generic [ref=e10]:
    - button "Open navigation menu" [ref=e11] [cursor=pointer]: ☰
    - generic [ref=e12]: Timizer Like
  - main [ref=e13]:
    - heading "Mes CRA" [level=1] [ref=e16]
    - generic [ref=e17]:
      - generic [ref=e18]:
        - button "Année précédente" [ref=e19] [cursor=pointer]: ◀
        - generic [ref=e20]: "2026"
        - button "Année suivante" [ref=e21] [cursor=pointer]: ▶
      - generic [ref=e22]:
        - button "Janvier 2026 — 0 jour(s) travaillé(s)" [ref=e23] [cursor=pointer]:
          - generic [ref=e24]: Janvier 2026
          - generic [ref=e25]:
            - generic [ref=e26]: L
            - generic [ref=e27]: M
            - generic [ref=e28]: M
            - generic [ref=e29]: J
            - generic [ref=e30]: V
            - generic [ref=e31]: S
            - generic [ref=e32]: D
          - generic [ref=e33]:
            - generic [ref=e37]: "1"
            - generic [ref=e38]: "2"
            - generic [ref=e39]: "3"
            - generic [ref=e40]: "4"
            - generic [ref=e41]: "5"
            - generic [ref=e42]: "6"
            - generic [ref=e43]: "7"
            - generic [ref=e44]: "8"
            - generic [ref=e45]: "9"
            - generic [ref=e46]: "10"
            - generic [ref=e47]: "11"
            - generic [ref=e48]: "12"
            - generic [ref=e49]: "13"
            - generic [ref=e50]: "14"
            - generic [ref=e51]: "15"
            - generic [ref=e52]: "16"
            - generic [ref=e53]: "17"
            - generic [ref=e54]: "18"
            - generic [ref=e55]: "19"
            - generic [ref=e56]: "20"
            - generic [ref=e57]: "21"
            - generic [ref=e58]: "22"
            - generic [ref=e59]: "23"
            - generic [ref=e60]: "24"
            - generic [ref=e61]: "25"
            - generic [ref=e62]: "26"
            - generic [ref=e63]: "27"
            - generic [ref=e64]: "28"
            - generic [ref=e65]: "29"
            - generic [ref=e66]: "30"
            - generic [ref=e67]: "31"
          - generic [ref=e68]: 0 j travaillés
        - button "Février 2026 — 0 jour(s) travaillé(s)" [ref=e69] [cursor=pointer]:
          - generic [ref=e70]: Février 2026
          - generic [ref=e71]:
            - generic [ref=e72]: L
            - generic [ref=e73]: M
            - generic [ref=e74]: M
            - generic [ref=e75]: J
            - generic [ref=e76]: V
            - generic [ref=e77]: S
            - generic [ref=e78]: D
          - generic [ref=e79]:
            - generic [ref=e86]: "1"
            - generic [ref=e87]: "2"
            - generic [ref=e88]: "3"
            - generic [ref=e89]: "4"
            - generic [ref=e90]: "5"
            - generic [ref=e91]: "6"
            - generic [ref=e92]: "7"
            - generic [ref=e93]: "8"
            - generic [ref=e94]: "9"
            - generic [ref=e95]: "10"
            - generic [ref=e96]: "11"
            - generic [ref=e97]: "12"
            - generic [ref=e98]: "13"
            - generic [ref=e99]: "14"
            - generic [ref=e100]: "15"
            - generic [ref=e101]: "16"
            - generic [ref=e102]: "17"
            - generic [ref=e103]: "18"
            - generic [ref=e104]: "19"
            - generic [ref=e105]: "20"
            - generic [ref=e106]: "21"
            - generic [ref=e107]: "22"
            - generic [ref=e108]: "23"
            - generic [ref=e109]: "24"
            - generic [ref=e110]: "25"
            - generic [ref=e111]: "26"
            - generic [ref=e112]: "27"
            - generic [ref=e113]: "28"
          - generic [ref=e114]: 0 j travaillés
        - button "Mars 2026 — 0 jour(s) travaillé(s)" [ref=e115] [cursor=pointer]:
          - generic [ref=e116]: Mars 2026
          - generic [ref=e117]:
            - generic [ref=e118]: L
            - generic [ref=e119]: M
            - generic [ref=e120]: M
            - generic [ref=e121]: J
            - generic [ref=e122]: V
            - generic [ref=e123]: S
            - generic [ref=e124]: D
          - generic [ref=e125]:
            - generic [ref=e132]: "1"
            - generic [ref=e133]: "2"
            - generic [ref=e134]: "3"
            - generic [ref=e135]: "4"
            - generic [ref=e136]: "5"
            - generic [ref=e137]: "6"
            - generic [ref=e138]: "7"
            - generic [ref=e139]: "8"
            - generic [ref=e140]: "9"
            - generic [ref=e141]: "10"
            - generic [ref=e142]: "11"
            - generic [ref=e143]: "12"
            - generic [ref=e144]: "13"
            - generic [ref=e145]: "14"
            - generic [ref=e146]: "15"
            - generic [ref=e147]: "16"
            - generic [ref=e148]: "17"
            - generic [ref=e149]: "18"
            - generic [ref=e150]: "19"
            - generic [ref=e151]: "20"
            - generic [ref=e152]: "21"
            - generic [ref=e153]: "22"
            - generic [ref=e154]: "23"
            - generic [ref=e155]: "24"
            - generic [ref=e156]: "25"
            - generic [ref=e157]: "26"
            - generic [ref=e158]: "27"
            - generic [ref=e159]: "28"
            - generic [ref=e160]: "29"
            - generic [ref=e161]: "30"
            - generic [ref=e162]: "31"
          - generic [ref=e163]: 0 j travaillés
        - button "Avril 2026 — 0 jour(s) travaillé(s)" [ref=e164] [cursor=pointer]:
          - generic [ref=e165]: Avril 2026
          - generic [ref=e166]:
            - generic [ref=e167]: L
            - generic [ref=e168]: M
            - generic [ref=e169]: M
            - generic [ref=e170]: J
            - generic [ref=e171]: V
            - generic [ref=e172]: S
            - generic [ref=e173]: D
          - generic [ref=e174]:
            - generic [ref=e177]: "1"
            - generic [ref=e178]: "2"
            - generic [ref=e179]: "3"
            - generic [ref=e180]: "4"
            - generic [ref=e181]: "5"
            - generic [ref=e182]: "6"
            - generic [ref=e183]: "7"
            - generic [ref=e184]: "8"
            - generic [ref=e185]: "9"
            - generic [ref=e186]: "10"
            - generic [ref=e187]: "11"
            - generic [ref=e188]: "12"
            - generic [ref=e189]: "13"
            - generic [ref=e190]: "14"
            - generic [ref=e191]: "15"
            - generic [ref=e192]: "16"
            - generic [ref=e193]: "17"
            - generic [ref=e194]: "18"
            - generic [ref=e195]: "19"
            - generic [ref=e196]: "20"
            - generic [ref=e197]: "21"
            - generic [ref=e198]: "22"
            - generic [ref=e199]: "23"
            - generic [ref=e200]: "24"
            - generic [ref=e201]: "25"
            - generic [ref=e202]: "26"
            - generic [ref=e203]: "27"
            - generic [ref=e204]: "28"
            - generic [ref=e205]: "29"
            - generic [ref=e206]: "30"
          - generic [ref=e207]: 0 j travaillés
        - button "Mai 2026 — 0 jour(s) travaillé(s)" [ref=e208] [cursor=pointer]:
          - generic [ref=e209]: Mai 2026
          - generic [ref=e210]:
            - generic [ref=e211]: L
            - generic [ref=e212]: M
            - generic [ref=e213]: M
            - generic [ref=e214]: J
            - generic [ref=e215]: V
            - generic [ref=e216]: S
            - generic [ref=e217]: D
          - generic [ref=e218]:
            - generic [ref=e223]: "1"
            - generic [ref=e224]: "2"
            - generic [ref=e225]: "3"
            - generic [ref=e226]: "4"
            - generic [ref=e227]: "5"
            - generic [ref=e228]: "6"
            - generic [ref=e229]: "7"
            - generic [ref=e230]: "8"
            - generic [ref=e231]: "9"
            - generic [ref=e232]: "10"
            - generic [ref=e233]: "11"
            - generic [ref=e234]: "12"
            - generic [ref=e235]: "13"
            - generic [ref=e236]: "14"
            - generic [ref=e237]: "15"
            - generic [ref=e238]: "16"
            - generic [ref=e239]: "17"
            - generic [ref=e240]: "18"
            - generic [ref=e241]: "19"
            - generic [ref=e242]: "20"
            - generic [ref=e243]: "21"
            - generic [ref=e244]: "22"
            - generic [ref=e245]: "23"
            - generic [ref=e246]: "24"
            - generic [ref=e247]: "25"
            - generic [ref=e248]: "26"
            - generic [ref=e249]: "27"
            - generic [ref=e250]: "28"
            - generic [ref=e251]: "29"
            - generic [ref=e252]: "30"
            - generic [ref=e253]: "31"
          - generic [ref=e254]: 0 j travaillés
        - button "Juin 2026 — 0 jour(s) travaillé(s)" [ref=e255] [cursor=pointer]:
          - generic [ref=e256]: Juin 2026
          - generic [ref=e257]:
            - generic [ref=e258]: L
            - generic [ref=e259]: M
            - generic [ref=e260]: M
            - generic [ref=e261]: J
            - generic [ref=e262]: V
            - generic [ref=e263]: S
            - generic [ref=e264]: D
          - generic [ref=e265]:
            - generic [ref=e266]: "1"
            - generic [ref=e267]: "2"
            - generic [ref=e268]: "3"
            - generic [ref=e269]: "4"
            - generic [ref=e270]: "5"
            - generic [ref=e271]: "6"
            - generic [ref=e272]: "7"
            - generic [ref=e273]: "8"
            - generic [ref=e274]: "9"
            - generic [ref=e275]: "10"
            - generic [ref=e276]: "11"
            - generic [ref=e277]: "12"
            - generic [ref=e278]: "13"
            - generic [ref=e279]: "14"
            - generic [ref=e280]: "15"
            - generic [ref=e281]: "16"
            - generic [ref=e282]: "17"
            - generic [ref=e283]: "18"
            - generic [ref=e284]: "19"
            - generic [ref=e285]: "20"
            - generic [ref=e286]: "21"
            - generic [ref=e287]: "22"
            - generic [ref=e288]: "23"
            - generic [ref=e289]: "24"
            - generic [ref=e290]: "25"
            - generic [ref=e291]: "26"
            - generic [ref=e292]: "27"
            - generic [ref=e293]: "28"
            - generic [ref=e294]: "29"
            - generic [ref=e295]: "30"
          - generic [ref=e296]: 0 j travaillés
        - button "Juillet 2026 — 0 jour(s) travaillé(s)" [ref=e297] [cursor=pointer]:
          - generic [ref=e298]: Juillet 2026
          - generic [ref=e299]:
            - generic [ref=e300]: L
            - generic [ref=e301]: M
            - generic [ref=e302]: M
            - generic [ref=e303]: J
            - generic [ref=e304]: V
            - generic [ref=e305]: S
            - generic [ref=e306]: D
          - generic [ref=e307]:
            - generic [ref=e310]: "1"
            - generic [ref=e311]: "2"
            - generic [ref=e312]: "3"
            - generic [ref=e313]: "4"
            - generic [ref=e314]: "5"
            - generic [ref=e315]: "6"
            - generic [ref=e316]: "7"
            - generic [ref=e317]: "8"
            - generic [ref=e318]: "9"
            - generic [ref=e319]: "10"
            - generic [ref=e320]: "11"
            - generic [ref=e321]: "12"
            - generic [ref=e322]: "13"
            - generic [ref=e323]: "14"
            - generic [ref=e324]: "15"
            - generic [ref=e325]: "16"
            - generic [ref=e326]: "17"
            - generic [ref=e327]: "18"
            - generic [ref=e328]: "19"
            - generic [ref=e329]: "20"
            - generic [ref=e330]: "21"
            - generic [ref=e331]: "22"
            - generic [ref=e332]: "23"
            - generic [ref=e333]: "24"
            - generic [ref=e334]: "25"
            - generic [ref=e335]: "26"
            - generic [ref=e336]: "27"
            - generic [ref=e337]: "28"
            - generic [ref=e338]: "29"
            - generic [ref=e339]: "30"
            - generic [ref=e340]: "31"
          - generic [ref=e341]: 0 j travaillés
        - button "Août 2026 — 0 jour(s) travaillé(s)" [ref=e342] [cursor=pointer]:
          - generic [ref=e343]: Août 2026
          - generic [ref=e344]:
            - generic [ref=e345]: L
            - generic [ref=e346]: M
            - generic [ref=e347]: M
            - generic [ref=e348]: J
            - generic [ref=e349]: V
            - generic [ref=e350]: S
            - generic [ref=e351]: D
          - generic [ref=e352]:
            - generic [ref=e358]: "1"
            - generic [ref=e359]: "2"
            - generic [ref=e360]: "3"
            - generic [ref=e361]: "4"
            - generic [ref=e362]: "5"
            - generic [ref=e363]: "6"
            - generic [ref=e364]: "7"
            - generic [ref=e365]: "8"
            - generic [ref=e366]: "9"
            - generic [ref=e367]: "10"
            - generic [ref=e368]: "11"
            - generic [ref=e369]: "12"
            - generic [ref=e370]: "13"
            - generic [ref=e371]: "14"
            - generic [ref=e372]: "15"
            - generic [ref=e373]: "16"
            - generic [ref=e374]: "17"
            - generic [ref=e375]: "18"
            - generic [ref=e376]: "19"
            - generic [ref=e377]: "20"
            - generic [ref=e378]: "21"
            - generic [ref=e379]: "22"
            - generic [ref=e380]: "23"
            - generic [ref=e381]: "24"
            - generic [ref=e382]: "25"
            - generic [ref=e383]: "26"
            - generic [ref=e384]: "27"
            - generic [ref=e385]: "28"
            - generic [ref=e386]: "29"
            - generic [ref=e387]: "30"
            - generic [ref=e388]: "31"
          - generic [ref=e389]: 0 j travaillés
        - button "Septembre 2026 — 0 jour(s) travaillé(s)" [ref=e390] [cursor=pointer]:
          - generic [ref=e391]: Septembre 2026
          - generic [ref=e392]:
            - generic [ref=e393]: L
            - generic [ref=e394]: M
            - generic [ref=e395]: M
            - generic [ref=e396]: J
            - generic [ref=e397]: V
            - generic [ref=e398]: S
            - generic [ref=e399]: D
          - generic [ref=e400]:
            - generic [ref=e402]: "1"
            - generic [ref=e403]: "2"
            - generic [ref=e404]: "3"
            - generic [ref=e405]: "4"
            - generic [ref=e406]: "5"
            - generic [ref=e407]: "6"
            - generic [ref=e408]: "7"
            - generic [ref=e409]: "8"
            - generic [ref=e410]: "9"
            - generic [ref=e411]: "10"
            - generic [ref=e412]: "11"
            - generic [ref=e413]: "12"
            - generic [ref=e414]: "13"
            - generic [ref=e415]: "14"
            - generic [ref=e416]: "15"
            - generic [ref=e417]: "16"
            - generic [ref=e418]: "17"
            - generic [ref=e419]: "18"
            - generic [ref=e420]: "19"
            - generic [ref=e421]: "20"
            - generic [ref=e422]: "21"
            - generic [ref=e423]: "22"
            - generic [ref=e424]: "23"
            - generic [ref=e425]: "24"
            - generic [ref=e426]: "25"
            - generic [ref=e427]: "26"
            - generic [ref=e428]: "27"
            - generic [ref=e429]: "28"
            - generic [ref=e430]: "29"
            - generic [ref=e431]: "30"
          - generic [ref=e432]: 0 j travaillés
        - button "Octobre 2026 — 0 jour(s) travaillé(s)" [ref=e433] [cursor=pointer]:
          - generic [ref=e434]: Octobre 2026
          - generic [ref=e435]:
            - generic [ref=e436]: L
            - generic [ref=e437]: M
            - generic [ref=e438]: M
            - generic [ref=e439]: J
            - generic [ref=e440]: V
            - generic [ref=e441]: S
            - generic [ref=e442]: D
          - generic [ref=e443]:
            - generic [ref=e447]: "1"
            - generic [ref=e448]: "2"
            - generic [ref=e449]: "3"
            - generic [ref=e450]: "4"
            - generic [ref=e451]: "5"
            - generic [ref=e452]: "6"
            - generic [ref=e453]: "7"
            - generic [ref=e454]: "8"
            - generic [ref=e455]: "9"
            - generic [ref=e456]: "10"
            - generic [ref=e457]: "11"
            - generic [ref=e458]: "12"
            - generic [ref=e459]: "13"
            - generic [ref=e460]: "14"
            - generic [ref=e461]: "15"
            - generic [ref=e462]: "16"
            - generic [ref=e463]: "17"
            - generic [ref=e464]: "18"
            - generic [ref=e465]: "19"
            - generic [ref=e466]: "20"
            - generic [ref=e467]: "21"
            - generic [ref=e468]: "22"
            - generic [ref=e469]: "23"
            - generic [ref=e470]: "24"
            - generic [ref=e471]: "25"
            - generic [ref=e472]: "26"
            - generic [ref=e473]: "27"
            - generic [ref=e474]: "28"
            - generic [ref=e475]: "29"
            - generic [ref=e476]: "30"
            - generic [ref=e477]: "31"
          - generic [ref=e478]: 0 j travaillés
        - button "Novembre 2026 — 0 jour(s) travaillé(s)" [ref=e479] [cursor=pointer]:
          - generic [ref=e480]: Novembre 2026
          - generic [ref=e481]:
            - generic [ref=e482]: L
            - generic [ref=e483]: M
            - generic [ref=e484]: M
            - generic [ref=e485]: J
            - generic [ref=e486]: V
            - generic [ref=e487]: S
            - generic [ref=e488]: D
          - generic [ref=e489]:
            - generic [ref=e496]: "1"
            - generic [ref=e497]: "2"
            - generic [ref=e498]: "3"
            - generic [ref=e499]: "4"
            - generic [ref=e500]: "5"
            - generic [ref=e501]: "6"
            - generic [ref=e502]: "7"
            - generic [ref=e503]: "8"
            - generic [ref=e504]: "9"
            - generic [ref=e505]: "10"
            - generic [ref=e506]: "11"
            - generic [ref=e507]: "12"
            - generic [ref=e508]: "13"
            - generic [ref=e509]: "14"
            - generic [ref=e510]: "15"
            - generic [ref=e511]: "16"
            - generic [ref=e512]: "17"
            - generic [ref=e513]: "18"
            - generic [ref=e514]: "19"
            - generic [ref=e515]: "20"
            - generic [ref=e516]: "21"
            - generic [ref=e517]: "22"
            - generic [ref=e518]: "23"
            - generic [ref=e519]: "24"
            - generic [ref=e520]: "25"
            - generic [ref=e521]: "26"
            - generic [ref=e522]: "27"
            - generic [ref=e523]: "28"
            - generic [ref=e524]: "29"
            - generic [ref=e525]: "30"
          - generic [ref=e526]: 0 j travaillés
        - button "Décembre 2026 — 0 jour(s) travaillé(s)" [ref=e527] [cursor=pointer]:
          - generic [ref=e528]: Décembre 2026
          - generic [ref=e529]:
            - generic [ref=e530]: L
            - generic [ref=e531]: M
            - generic [ref=e532]: M
            - generic [ref=e533]: J
            - generic [ref=e534]: V
            - generic [ref=e535]: S
            - generic [ref=e536]: D
          - generic [ref=e537]:
            - generic [ref=e539]: "1"
            - generic [ref=e540]: "2"
            - generic [ref=e541]: "3"
            - generic [ref=e542]: "4"
            - generic [ref=e543]: "5"
            - generic [ref=e544]: "6"
            - generic [ref=e545]: "7"
            - generic [ref=e546]: "8"
            - generic [ref=e547]: "9"
            - generic [ref=e548]: "10"
            - generic [ref=e549]: "11"
            - generic [ref=e550]: "12"
            - generic [ref=e551]: "13"
            - generic [ref=e552]: "14"
            - generic [ref=e553]: "15"
            - generic [ref=e554]: "16"
            - generic [ref=e555]: "17"
            - generic [ref=e556]: "18"
            - generic [ref=e557]: "19"
            - generic [ref=e558]: "20"
            - generic [ref=e559]: "21"
            - generic [ref=e560]: "22"
            - generic [ref=e561]: "23"
            - generic [ref=e562]: "24"
            - generic [ref=e563]: "25"
            - generic [ref=e564]: "26"
            - generic [ref=e565]: "27"
            - generic [ref=e566]: "28"
            - generic [ref=e567]: "29"
            - generic [ref=e568]: "30"
            - generic [ref=e569]: "31"
          - generic [ref=e570]: 0 j travaillés
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
> 21  |   await page.selectOption('#month-select', String(month));
      |              ^ Error: page.selectOption: Test timeout of 30000ms exceeded.
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
  48  |   await page.waitForSelector('.cra-history__table');
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