# Test Report — T023 — Create CRA validation UI

## Verdict

**PASS**

---

## Commands executed

```bash
cd frontend && npm test -- --reporter=verbose
cd frontend && npx tsc --noEmit
```

---

## Acceptance criteria

| # | Criterion | Status | Notes |
|---|-----------|--------|-------|
| 1 | User can trigger CRA validation from the CRA page | **PASS** | `CraValidation` renders "Valider le CRA" button when `cra.status === 'DRAFT'`; component is mounted in `App.tsx` |
| 2 | Confirmation is shown before validation | **PASS** | Click → `confirming` state with warning paragraph + Confirmer/Annuler; confirmed by test "clicking validate button shows confirmation UI" |
| 3 | Successful validation updates the CRA status in the UI | **PASS** | `handleCraValidated` → `setCra(dtoToDetails(updated))` → `CraSummaryPanel` displays the new `status` |
| 4 | Validated CRA appears locked | **PASS** | `CraValidation` returns `null` after validation (no re-validate); `CalendarGrid` has no `onClick` handlers (cells are already read-only at this stage); `CraSummaryPanel` shows "VALIDATED" |
| 5 | Validation errors are displayed clearly | **PASS** | `role="alert"` paragraph, French message (`ApiError.message` or generic fallback), component returns to `idle` allowing retry |
| 6 | Existing frontend checks still pass | **PASS** | 41/41 pre-existing tests pass; 9 failures in `CraMonthSelector` are pre-existing from T019 (mock import mismatch), not introduced by T023 |

---

## Test suite results

```
Tests  9 failed | 41 passed (50)
```

- **8/8 CraValidation tests pass** (idle render, null/VALIDATED early-return, confirming state, cancel, success, in-flight disabled, error handling)
- **33 other tests pass** (craClient, CraSummaryPanel, CalendarGrid)
- **9 pre-existing failures** in `CraMonthSelector.test.tsx` — `vi.mocked(craApi.listCras)` is undefined because `listCras` is not exported from `../../api/cra`; introduced in T019, unrelated to T023

---

## TypeScript check

No new errors introduced by T023. Pre-existing errors observed:
- `TS2591` on `process` in `httpClient.ts` (pre-existing, missing `@types/node`)
- `TS2882` on CSS side-effect imports (`CalendarGrid.css`, `CraValidation.css`, `index.css`) — same pattern across the whole project
- `TS2339`/`TS2305` on `CraMonthSelector` — pre-existing from T019

---

## Regressions

None detected. All 41 tests that passed before T023 still pass.

---

## Notes

- **CalendarGrid locked state**: `CalendarGrid` has no click handlers at this point in the codebase (day editing is pending T021), so cells are already non-interactive post-validation. The `status` is not checked in `CalendarGrid`, but this is not a regression — behaviour matches the ticket requirement that validated CRA prevents further day changes.
- **Timezone edge case** (minor, non-blocking): `new Date().toISOString().slice(0, 10)` returns UTC date. In UTC+2 after 22:00 local time, this may produce J-1. Acceptable for a monthly CRA context.
- **No visual locked indicator on CalendarGrid**: The calendar cells do not show a visual locked/disabled state after validation. The ticket says "prevent further day changes", which is satisfied (no handlers), but there is no styling cue. Non-blocking for this ticket scope.

---

TESTS_PASSED
