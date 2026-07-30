---

## Test Report — T062 / Replace New CRA home page with global calendar overview

### Execution summary

| Check | Result |
|---|---|
| Unit / component tests (Vitest) | ✅ 278 passed, 0 failed (30 test files) |
| TypeScript compilation (`tsc --noEmit`) | ❌ Fails — see issues below |

---

### Acceptance criteria

#### AC1 — The root/home route renders the global CRA calendar overview
**PASS.** `App.tsx:45` initialises `view` to `'overview'`. The `CraOverview` component is rendered at `App.tsx:129-133`. On first load the user sees the CRA overview list, not the old selector form.

#### AC2 — The page is no longer named or presented as `New CRA`
**PASS.** `AppShell.tsx:14` maps `'overview'` to page title `'Mes CRA'`. The root view has no "New CRA" heading or creation form. "New CRA" remains only as a nav button (acting as the dedicated creation CTA, which is correct per the ticket spec).

#### AC3 — Existing CRA periods can be opened from the overview
**PASS with UX observation.** `CraOverview.tsx:121-145` renders each CRA as a clickable button labelled `Ouvrir le CRA de <period>`. Clicking calls `onOpen(cra)` → `App.tsx:131` → `handleOpen(cra)` (fetches details by id) + `setView('selector')`.

Observation: after clicking, the user lands on `view='selector'`, which shows `CraMonthSelector` above the loaded `CalendarGrid`. The month selector is not synced to the opened CRA's period, so the selector always shows the current month while the CRA calendar shows the opened period below it. The CRA IS displayed, but the selector widget above it is redundant and potentially confusing. This is a UX inconsistency, not an AC failure, but worth noting for a follow-up.

#### AC4 — The empty state directs the user toward the dedicated `New CRA` action
**PASS.** `CraOverview.tsx:105-116` renders an empty state with the message "Aucun CRA trouvé" and a "Nouveau CRA" button that calls `onNewCra()` → `setView('selector')`.

#### AC5 — Refreshing the application does not unexpectedly start a new CRA
**PASS.** Default view is `'overview'` (`App.tsx:45`). No `createCra` is called on mount. Refreshing loads the overview, not the creation flow.

#### AC6 — Existing CRA editing routes continue to work
**PASS.** The app uses state-based navigation. Existing paths to the selector and calendar editor are preserved and unchanged. `CraMonthSelector` still handles open-or-create, `CalendarGrid`/`CraSummaryPanel` still render CRA details.

---

### Issues found

#### Blocking — TypeScript compilation failure

`tsc --noEmit` fails with errors. Vitest uses esbuild for transpilation (no type checking), so all 278 tests pass despite these errors. Two categories:

**Introduced by T062:**

- `src/App.test.tsx:21,51` — `DETAILS` and `HISTORY_DETAILS` test fixtures are missing the `clientRepresentativeName` field required by `CraDetailsDto`. These fixture objects were written in the new test file but do not match the full interface.

**Pre-existing (not introduced by T062, present on base branch):**

- `src/types/cra.ts:30` — `CraDetailsDto` attempts to extend `CraSummaryDto` but `CraSummaryDto` is only re-exported (not locally imported), making it out of scope for `extends`.
- `src/types/cra.ts:33,43` — `clientSignatureDate` declared twice with conflicting optionality.
- Multiple test fixtures across `CraHistory`, `CraMonthSelector`, `CalendarGrid`, `CraValidation`, `CraSignatureActions` tests missing `clientSignatureDate` / `clientRepresentativeName`.
- `CraValidation.tsx` / `CraValidation.test.tsx` — references missing `validateCra` export.
- `ProviderSignatureBox.tsx` — references non-existent `providerSignatureImageUrl` property.

The pre-existing errors are out of T062's scope but the new test file (`App.test.tsx`) must be corrected.

#### Non-blocking — No dedicated `CraOverview` unit tests

`CraOverview.tsx` has no `.test.tsx` file. The component's rendering, empty-state, loading skeleton, error state, and status badge logic are only exercised indirectly through `App.test.tsx`. This is an observation for test coverage, not an AC failure.

---

### Verdict

**Implementation partially accepted** — the six acceptance criteria are behaviourally satisfied. One blocking issue must be fixed before the ticket can be closed: the `App.test.tsx` test fixtures introduced by T062 do not satisfy the `CraDetailsDto` type contract (`clientRepresentativeName` missing). TypeScript compilation must be clean on T062-owned files.

The pre-existing TypeScript errors should be tracked separately.
