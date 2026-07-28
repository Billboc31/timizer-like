---

## Test Report — T058

**Verdict: PASS — all 8 acceptance criteria satisfied.**

### Commands run

| Command | Result |
|---|---|
| `cd frontend && npm test` | 135 tests passed, 2 pre-existing failures (T043) |
| `npx vitest run src/components/ProviderSignatureBox` | **17/17 tests passed** |
| `cd backend && mvn test` | **118/118 tests passed** |

### Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| AC1 | Clearly bordered rectangle in CRA UI | **PASS** — solid/dashed CSS border, `min-height: 120px` |
| AC2 | Empty state invites provider to sign | **PASS** — "Cliquez pour signer" text, `role="button"`, aria-label |
| AC3 | Signed state shows signature, name, date | **PASS** — image, `providerFirstName + providerLastName`, `dd/MM/yyyy` date |
| AC4 | Aspect ratio preserved, inside box with padding | **PASS** — `object-fit: contain` in UI; `Math.min(availW/imgW, availH/imgH)` scale + 8pt padding in PDF |
| AC5 | Works desktop/mobile, supports touch | **PASS** — `@media (max-width: 480px)` breakpoint; `onClick` is universal for touch; keyboard (Enter/Space) tested |
| AC6 | PDF uses matching rectangular block | **PASS** — `drawRectangle` 180×80pt with label, image, name, date |
| AC7 | Future client block can align with same dimensions | **PASS** — `drawClientSignatureBlock` uses identical constants (`SIGNATURE_BOX_WIDTH/HEIGHT`) |
| AC8 | Tests cover empty and signed states | **PASS** — 15 unit + 2 axe tests (UI), 4 PDF tests (backend) |

### Regressions

None introduced by T058. The 2 failing test files (`CraHistory.axe`, `CraMonthSelector.axe`) are pre-existing from T043 commit `6eedbba8` and do not touch T058 code.

Report written to `runs/T058/tests/test-report.md`.
