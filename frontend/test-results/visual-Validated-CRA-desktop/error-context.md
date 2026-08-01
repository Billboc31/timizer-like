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

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]: Timizer Like
    - navigation "Main navigation" [ref=e6]:
      - button "New CRA" [ref=e7] [cursor=pointer]
      - button "History" [ref=e8] [cursor=pointer]
      - button "Paramètres" [ref=e9] [cursor=pointer]
  - main [ref=e10]:
    - heading "Mes CRA" [level=1] [ref=e13]
    - generic [ref=e14]:
      - generic [ref=e15]:
        - button "Année précédente" [ref=e16] [cursor=pointer]: ◀
        - generic [ref=e17]: "2026"
        - button "Année suivante" [ref=e18] [cursor=pointer]: ▶
      - generic [ref=e19]:
        - button "Janvier 2026 — 0 jour(s) travaillé(s)" [ref=e20] [cursor=pointer]:
          - generic [ref=e21]: Janvier 2026
          - generic [ref=e22]:
            - generic [ref=e23]: L
            - generic [ref=e24]: M
            - generic [ref=e25]: M
            - generic [ref=e26]: J
            - generic [ref=e27]: V
            - generic [ref=e28]: S
            - generic [ref=e29]: D
          - generic [ref=e30]:
            - generic [ref=e34]: "1"
            - generic [ref=e35]: "2"
            - generic [ref=e36]: "3"
            - generic [ref=e37]: "4"
            - generic [ref=e38]: "5"
            - generic [ref=e39]: "6"
            - generic [ref=e40]: "7"
            - generic [ref=e41]: "8"
            - generic [ref=e42]: "9"
            - generic [ref=e43]: "10"
            - generic [ref=e44]: "11"
            - generic [ref=e45]: "12"
            - generic [ref=e46]: "13"
            - generic [ref=e47]: "14"
            - generic [ref=e48]: "15"
            - generic [ref=e49]: "16"
            - generic [ref=e50]: "17"
            - generic [ref=e51]: "18"
            - generic [ref=e52]: "19"
            - generic [ref=e53]: "20"
            - generic [ref=e54]: "21"
            - generic [ref=e55]: "22"
            - generic [ref=e56]: "23"
            - generic [ref=e57]: "24"
            - generic [ref=e58]: "25"
            - generic [ref=e59]: "26"
            - generic [ref=e60]: "27"
            - generic [ref=e61]: "28"
            - generic [ref=e62]: "29"
            - generic [ref=e63]: "30"
            - generic [ref=e64]: "31"
          - generic [ref=e65]: 0 j travaillés
        - button "Février 2026 — 0 jour(s) travaillé(s)" [ref=e66] [cursor=pointer]:
          - generic [ref=e67]: Février 2026
          - generic [ref=e68]:
            - generic [ref=e69]: L
            - generic [ref=e70]: M
            - generic [ref=e71]: M
            - generic [ref=e72]: J
            - generic [ref=e73]: V
            - generic [ref=e74]: S
            - generic [ref=e75]: D
          - generic [ref=e76]:
            - generic [ref=e83]: "1"
            - generic [ref=e84]: "2"
            - generic [ref=e85]: "3"
            - generic [ref=e86]: "4"
            - generic [ref=e87]: "5"
            - generic [ref=e88]: "6"
            - generic [ref=e89]: "7"
            - generic [ref=e90]: "8"
            - generic [ref=e91]: "9"
            - generic [ref=e92]: "10"
            - generic [ref=e93]: "11"
            - generic [ref=e94]: "12"
            - generic [ref=e95]: "13"
            - generic [ref=e96]: "14"
            - generic [ref=e97]: "15"
            - generic [ref=e98]: "16"
            - generic [ref=e99]: "17"
            - generic [ref=e100]: "18"
            - generic [ref=e101]: "19"
            - generic [ref=e102]: "20"
            - generic [ref=e103]: "21"
            - generic [ref=e104]: "22"
            - generic [ref=e105]: "23"
            - generic [ref=e106]: "24"
            - generic [ref=e107]: "25"
            - generic [ref=e108]: "26"
            - generic [ref=e109]: "27"
            - generic [ref=e110]: "28"
          - generic [ref=e111]: 0 j travaillés
        - button "Mars 2026 — 0 jour(s) travaillé(s)" [ref=e112] [cursor=pointer]:
          - generic [ref=e113]: Mars 2026
          - generic [ref=e114]:
            - generic [ref=e115]: L
            - generic [ref=e116]: M
            - generic [ref=e117]: M
            - generic [ref=e118]: J
            - generic [ref=e119]: V
            - generic [ref=e120]: S
            - generic [ref=e121]: D
          - generic [ref=e122]:
            - generic [ref=e129]: "1"
            - generic [ref=e130]: "2"
            - generic [ref=e131]: "3"
            - generic [ref=e132]: "4"
            - generic [ref=e133]: "5"
            - generic [ref=e134]: "6"
            - generic [ref=e135]: "7"
            - generic [ref=e136]: "8"
            - generic [ref=e137]: "9"
            - generic [ref=e138]: "10"
            - generic [ref=e139]: "11"
            - generic [ref=e140]: "12"
            - generic [ref=e141]: "13"
            - generic [ref=e142]: "14"
            - generic [ref=e143]: "15"
            - generic [ref=e144]: "16"
            - generic [ref=e145]: "17"
            - generic [ref=e146]: "18"
            - generic [ref=e147]: "19"
            - generic [ref=e148]: "20"
            - generic [ref=e149]: "21"
            - generic [ref=e150]: "22"
            - generic [ref=e151]: "23"
            - generic [ref=e152]: "24"
            - generic [ref=e153]: "25"
            - generic [ref=e154]: "26"
            - generic [ref=e155]: "27"
            - generic [ref=e156]: "28"
            - generic [ref=e157]: "29"
            - generic [ref=e158]: "30"
            - generic [ref=e159]: "31"
          - generic [ref=e160]: 0 j travaillés
        - button "Avril 2026 — 0 jour(s) travaillé(s)" [ref=e161] [cursor=pointer]:
          - generic [ref=e162]: Avril 2026
          - generic [ref=e163]:
            - generic [ref=e164]: L
            - generic [ref=e165]: M
            - generic [ref=e166]: M
            - generic [ref=e167]: J
            - generic [ref=e168]: V
            - generic [ref=e169]: S
            - generic [ref=e170]: D
          - generic [ref=e171]:
            - generic [ref=e174]: "1"
            - generic [ref=e175]: "2"
            - generic [ref=e176]: "3"
            - generic [ref=e177]: "4"
            - generic [ref=e178]: "5"
            - generic [ref=e179]: "6"
            - generic [ref=e180]: "7"
            - generic [ref=e181]: "8"
            - generic [ref=e182]: "9"
            - generic [ref=e183]: "10"
            - generic [ref=e184]: "11"
            - generic [ref=e185]: "12"
            - generic [ref=e186]: "13"
            - generic [ref=e187]: "14"
            - generic [ref=e188]: "15"
            - generic [ref=e189]: "16"
            - generic [ref=e190]: "17"
            - generic [ref=e191]: "18"
            - generic [ref=e192]: "19"
            - generic [ref=e193]: "20"
            - generic [ref=e194]: "21"
            - generic [ref=e195]: "22"
            - generic [ref=e196]: "23"
            - generic [ref=e197]: "24"
            - generic [ref=e198]: "25"
            - generic [ref=e199]: "26"
            - generic [ref=e200]: "27"
            - generic [ref=e201]: "28"
            - generic [ref=e202]: "29"
            - generic [ref=e203]: "30"
          - generic [ref=e204]: 0 j travaillés
        - button "Mai 2026 — 0 jour(s) travaillé(s)" [ref=e205] [cursor=pointer]:
          - generic [ref=e206]: Mai 2026
          - generic [ref=e207]:
            - generic [ref=e208]: L
            - generic [ref=e209]: M
            - generic [ref=e210]: M
            - generic [ref=e211]: J
            - generic [ref=e212]: V
            - generic [ref=e213]: S
            - generic [ref=e214]: D
          - generic [ref=e215]:
            - generic [ref=e220]: "1"
            - generic [ref=e221]: "2"
            - generic [ref=e222]: "3"
            - generic [ref=e223]: "4"
            - generic [ref=e224]: "5"
            - generic [ref=e225]: "6"
            - generic [ref=e226]: "7"
            - generic [ref=e227]: "8"
            - generic [ref=e228]: "9"
            - generic [ref=e229]: "10"
            - generic [ref=e230]: "11"
            - generic [ref=e231]: "12"
            - generic [ref=e232]: "13"
            - generic [ref=e233]: "14"
            - generic [ref=e234]: "15"
            - generic [ref=e235]: "16"
            - generic [ref=e236]: "17"
            - generic [ref=e237]: "18"
            - generic [ref=e238]: "19"
            - generic [ref=e239]: "20"
            - generic [ref=e240]: "21"
            - generic [ref=e241]: "22"
            - generic [ref=e242]: "23"
            - generic [ref=e243]: "24"
            - generic [ref=e244]: "25"
            - generic [ref=e245]: "26"
            - generic [ref=e246]: "27"
            - generic [ref=e247]: "28"
            - generic [ref=e248]: "29"
            - generic [ref=e249]: "30"
            - generic [ref=e250]: "31"
          - generic [ref=e251]: 0 j travaillés
        - button "Juin 2026 — 0 jour(s) travaillé(s)" [ref=e252] [cursor=pointer]:
          - generic [ref=e253]: Juin 2026
          - generic [ref=e254]:
            - generic [ref=e255]: L
            - generic [ref=e256]: M
            - generic [ref=e257]: M
            - generic [ref=e258]: J
            - generic [ref=e259]: V
            - generic [ref=e260]: S
            - generic [ref=e261]: D
          - generic [ref=e262]:
            - generic [ref=e263]: "1"
            - generic [ref=e264]: "2"
            - generic [ref=e265]: "3"
            - generic [ref=e266]: "4"
            - generic [ref=e267]: "5"
            - generic [ref=e268]: "6"
            - generic [ref=e269]: "7"
            - generic [ref=e270]: "8"
            - generic [ref=e271]: "9"
            - generic [ref=e272]: "10"
            - generic [ref=e273]: "11"
            - generic [ref=e274]: "12"
            - generic [ref=e275]: "13"
            - generic [ref=e276]: "14"
            - generic [ref=e277]: "15"
            - generic [ref=e278]: "16"
            - generic [ref=e279]: "17"
            - generic [ref=e280]: "18"
            - generic [ref=e281]: "19"
            - generic [ref=e282]: "20"
            - generic [ref=e283]: "21"
            - generic [ref=e284]: "22"
            - generic [ref=e285]: "23"
            - generic [ref=e286]: "24"
            - generic [ref=e287]: "25"
            - generic [ref=e288]: "26"
            - generic [ref=e289]: "27"
            - generic [ref=e290]: "28"
            - generic [ref=e291]: "29"
            - generic [ref=e292]: "30"
          - generic [ref=e293]: 0 j travaillés
        - button "Juillet 2026 — 0 jour(s) travaillé(s)" [ref=e294] [cursor=pointer]:
          - generic [ref=e295]: Juillet 2026
          - generic [ref=e296]:
            - generic [ref=e297]: L
            - generic [ref=e298]: M
            - generic [ref=e299]: M
            - generic [ref=e300]: J
            - generic [ref=e301]: V
            - generic [ref=e302]: S
            - generic [ref=e303]: D
          - generic [ref=e304]:
            - generic [ref=e307]: "1"
            - generic [ref=e308]: "2"
            - generic [ref=e309]: "3"
            - generic [ref=e310]: "4"
            - generic [ref=e311]: "5"
            - generic [ref=e312]: "6"
            - generic [ref=e313]: "7"
            - generic [ref=e314]: "8"
            - generic [ref=e315]: "9"
            - generic [ref=e316]: "10"
            - generic [ref=e317]: "11"
            - generic [ref=e318]: "12"
            - generic [ref=e319]: "13"
            - generic [ref=e320]: "14"
            - generic [ref=e321]: "15"
            - generic [ref=e322]: "16"
            - generic [ref=e323]: "17"
            - generic [ref=e324]: "18"
            - generic [ref=e325]: "19"
            - generic [ref=e326]: "20"
            - generic [ref=e327]: "21"
            - generic [ref=e328]: "22"
            - generic [ref=e329]: "23"
            - generic [ref=e330]: "24"
            - generic [ref=e331]: "25"
            - generic [ref=e332]: "26"
            - generic [ref=e333]: "27"
            - generic [ref=e334]: "28"
            - generic [ref=e335]: "29"
            - generic [ref=e336]: "30"
            - generic [ref=e337]: "31"
          - generic [ref=e338]: 0 j travaillés
        - button "Août 2026 — 0 jour(s) travaillé(s)" [ref=e339] [cursor=pointer]:
          - generic [ref=e340]: Août 2026
          - generic [ref=e341]:
            - generic [ref=e342]: L
            - generic [ref=e343]: M
            - generic [ref=e344]: M
            - generic [ref=e345]: J
            - generic [ref=e346]: V
            - generic [ref=e347]: S
            - generic [ref=e348]: D
          - generic [ref=e349]:
            - generic [ref=e355]: "1"
            - generic [ref=e356]: "2"
            - generic [ref=e357]: "3"
            - generic [ref=e358]: "4"
            - generic [ref=e359]: "5"
            - generic [ref=e360]: "6"
            - generic [ref=e361]: "7"
            - generic [ref=e362]: "8"
            - generic [ref=e363]: "9"
            - generic [ref=e364]: "10"
            - generic [ref=e365]: "11"
            - generic [ref=e366]: "12"
            - generic [ref=e367]: "13"
            - generic [ref=e368]: "14"
            - generic [ref=e369]: "15"
            - generic [ref=e370]: "16"
            - generic [ref=e371]: "17"
            - generic [ref=e372]: "18"
            - generic [ref=e373]: "19"
            - generic [ref=e374]: "20"
            - generic [ref=e375]: "21"
            - generic [ref=e376]: "22"
            - generic [ref=e377]: "23"
            - generic [ref=e378]: "24"
            - generic [ref=e379]: "25"
            - generic [ref=e380]: "26"
            - generic [ref=e381]: "27"
            - generic [ref=e382]: "28"
            - generic [ref=e383]: "29"
            - generic [ref=e384]: "30"
            - generic [ref=e385]: "31"
          - generic [ref=e386]: 0 j travaillés
        - button "Septembre 2026 — 0 jour(s) travaillé(s)" [ref=e387] [cursor=pointer]:
          - generic [ref=e388]: Septembre 2026
          - generic [ref=e389]:
            - generic [ref=e390]: L
            - generic [ref=e391]: M
            - generic [ref=e392]: M
            - generic [ref=e393]: J
            - generic [ref=e394]: V
            - generic [ref=e395]: S
            - generic [ref=e396]: D
          - generic [ref=e397]:
            - generic [ref=e399]: "1"
            - generic [ref=e400]: "2"
            - generic [ref=e401]: "3"
            - generic [ref=e402]: "4"
            - generic [ref=e403]: "5"
            - generic [ref=e404]: "6"
            - generic [ref=e405]: "7"
            - generic [ref=e406]: "8"
            - generic [ref=e407]: "9"
            - generic [ref=e408]: "10"
            - generic [ref=e409]: "11"
            - generic [ref=e410]: "12"
            - generic [ref=e411]: "13"
            - generic [ref=e412]: "14"
            - generic [ref=e413]: "15"
            - generic [ref=e414]: "16"
            - generic [ref=e415]: "17"
            - generic [ref=e416]: "18"
            - generic [ref=e417]: "19"
            - generic [ref=e418]: "20"
            - generic [ref=e419]: "21"
            - generic [ref=e420]: "22"
            - generic [ref=e421]: "23"
            - generic [ref=e422]: "24"
            - generic [ref=e423]: "25"
            - generic [ref=e424]: "26"
            - generic [ref=e425]: "27"
            - generic [ref=e426]: "28"
            - generic [ref=e427]: "29"
            - generic [ref=e428]: "30"
          - generic [ref=e429]: 0 j travaillés
        - button "Octobre 2026 — 0 jour(s) travaillé(s)" [ref=e430] [cursor=pointer]:
          - generic [ref=e431]: Octobre 2026
          - generic [ref=e432]:
            - generic [ref=e433]: L
            - generic [ref=e434]: M
            - generic [ref=e435]: M
            - generic [ref=e436]: J
            - generic [ref=e437]: V
            - generic [ref=e438]: S
            - generic [ref=e439]: D
          - generic [ref=e440]:
            - generic [ref=e444]: "1"
            - generic [ref=e445]: "2"
            - generic [ref=e446]: "3"
            - generic [ref=e447]: "4"
            - generic [ref=e448]: "5"
            - generic [ref=e449]: "6"
            - generic [ref=e450]: "7"
            - generic [ref=e451]: "8"
            - generic [ref=e452]: "9"
            - generic [ref=e453]: "10"
            - generic [ref=e454]: "11"
            - generic [ref=e455]: "12"
            - generic [ref=e456]: "13"
            - generic [ref=e457]: "14"
            - generic [ref=e458]: "15"
            - generic [ref=e459]: "16"
            - generic [ref=e460]: "17"
            - generic [ref=e461]: "18"
            - generic [ref=e462]: "19"
            - generic [ref=e463]: "20"
            - generic [ref=e464]: "21"
            - generic [ref=e465]: "22"
            - generic [ref=e466]: "23"
            - generic [ref=e467]: "24"
            - generic [ref=e468]: "25"
            - generic [ref=e469]: "26"
            - generic [ref=e470]: "27"
            - generic [ref=e471]: "28"
            - generic [ref=e472]: "29"
            - generic [ref=e473]: "30"
            - generic [ref=e474]: "31"
          - generic [ref=e475]: 0 j travaillés
        - button "Novembre 2026 — 0 jour(s) travaillé(s)" [ref=e476] [cursor=pointer]:
          - generic [ref=e477]: Novembre 2026
          - generic [ref=e478]:
            - generic [ref=e479]: L
            - generic [ref=e480]: M
            - generic [ref=e481]: M
            - generic [ref=e482]: J
            - generic [ref=e483]: V
            - generic [ref=e484]: S
            - generic [ref=e485]: D
          - generic [ref=e486]:
            - generic [ref=e493]: "1"
            - generic [ref=e494]: "2"
            - generic [ref=e495]: "3"
            - generic [ref=e496]: "4"
            - generic [ref=e497]: "5"
            - generic [ref=e498]: "6"
            - generic [ref=e499]: "7"
            - generic [ref=e500]: "8"
            - generic [ref=e501]: "9"
            - generic [ref=e502]: "10"
            - generic [ref=e503]: "11"
            - generic [ref=e504]: "12"
            - generic [ref=e505]: "13"
            - generic [ref=e506]: "14"
            - generic [ref=e507]: "15"
            - generic [ref=e508]: "16"
            - generic [ref=e509]: "17"
            - generic [ref=e510]: "18"
            - generic [ref=e511]: "19"
            - generic [ref=e512]: "20"
            - generic [ref=e513]: "21"
            - generic [ref=e514]: "22"
            - generic [ref=e515]: "23"
            - generic [ref=e516]: "24"
            - generic [ref=e517]: "25"
            - generic [ref=e518]: "26"
            - generic [ref=e519]: "27"
            - generic [ref=e520]: "28"
            - generic [ref=e521]: "29"
            - generic [ref=e522]: "30"
          - generic [ref=e523]: 0 j travaillés
        - button "Décembre 2026 — 0 jour(s) travaillé(s)" [ref=e524] [cursor=pointer]:
          - generic [ref=e525]: Décembre 2026
          - generic [ref=e526]:
            - generic [ref=e527]: L
            - generic [ref=e528]: M
            - generic [ref=e529]: M
            - generic [ref=e530]: J
            - generic [ref=e531]: V
            - generic [ref=e532]: S
            - generic [ref=e533]: D
          - generic [ref=e534]:
            - generic [ref=e536]: "1"
            - generic [ref=e537]: "2"
            - generic [ref=e538]: "3"
            - generic [ref=e539]: "4"
            - generic [ref=e540]: "5"
            - generic [ref=e541]: "6"
            - generic [ref=e542]: "7"
            - generic [ref=e543]: "8"
            - generic [ref=e544]: "9"
            - generic [ref=e545]: "10"
            - generic [ref=e546]: "11"
            - generic [ref=e547]: "12"
            - generic [ref=e548]: "13"
            - generic [ref=e549]: "14"
            - generic [ref=e550]: "15"
            - generic [ref=e551]: "16"
            - generic [ref=e552]: "17"
            - generic [ref=e553]: "18"
            - generic [ref=e554]: "19"
            - generic [ref=e555]: "20"
            - generic [ref=e556]: "21"
            - generic [ref=e557]: "22"
            - generic [ref=e558]: "23"
            - generic [ref=e559]: "24"
            - generic [ref=e560]: "25"
            - generic [ref=e561]: "26"
            - generic [ref=e562]: "27"
            - generic [ref=e563]: "28"
            - generic [ref=e564]: "29"
            - generic [ref=e565]: "30"
            - generic [ref=e566]: "31"
          - generic [ref=e567]: 0 j travaillés
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