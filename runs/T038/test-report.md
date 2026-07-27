# Test Report — T038

## Commands executed

```bash
cd frontend && npm test -- --run --reporter=verbose
```

Result: **63 passed, 0 failed** (6 test files, 569ms)

---

## Acceptance criteria

### 1. The total number of worked days is prominent and correctly formatted — PASS

`CraSummaryPanel.tsx:44` renders `cra.totalWorkedDays` inside a `<strong>` with class `cra-summary-panel__hero-value`.
`CraSummaryPanel.css:36-40` sets `font-size: 2.5rem; font-weight: 700` on that element.
Test `displays total worked days` confirms the value is rendered at `data-testid="summary-total"`.

Note: no explicit number formatting (e.g. `toFixed`) is applied. The value is rendered as-is from the API. This is acceptable given the API contract was kept out of scope and the type is numeric.

### 2. Draft and validated statuses are visually distinct — PASS

`CraSummaryPanel.css:64-72` defines two badge variants:
- `--draft`: amber background `#fef3c7`, dark amber text `#92400e`
- `--validated`: green background `#d1fae5`, dark green text `#065f46`

`CraSummaryPanel.tsx:51` dynamically applies `cra-summary-panel__badge--${statusKey}` based on `cra.status.toLowerCase()`.

Two dedicated tests (`applies draft badge class for DRAFT status`, `applies validated badge class for VALIDATED status`) verify the correct class is applied.

### 3. The validation action is clearly identified as the primary action — PASS

`CraValidation.tsx:54` renders a full-width blue button (`cra-validation__button`).
`CraValidation.css:5-17` sets `display: block; width: 100%; min-height: 44px; background-color: #2563eb; font-weight: 600`.
This visually separates the primary CTA from the informational summary panel.

### 4. Validation requires an explicit confirmation — PASS

`CraValidation.tsx:58` uses a native `<dialog>` element. Clicking "Valider le CRA" calls `showModal()` which opens a blocking modal requiring the user to click "Confirmer" before `validateCra` is called.
Test `clicking validate button shows confirmation UI` verifies the dialog becomes visible.
Test `clicking annuler hides confirmation and does not call validateCra` verifies the cancel path.
The dialog includes a warning text (`cra-validation__warning`) explaining the action is irreversible and the CRA becomes read-only.

### 5. The panel is responsive and remains readable on mobile — PASS

`CraSummaryPanel.css:110-114`: `@media (max-width: 480px)` collapses the meta grid from 2 columns to 1.
`CraValidation.css:99-113`: `@media (max-width: 480px)` sets dialog `max-width: 95vw`, stacks action buttons vertically, and makes each button `width: 100%`.

### 6. Disabled and loading states are visually clear — PASS

`CraValidation.css:68-72`: `opacity: 0.6; cursor: not-allowed` on `:disabled` for both confirm and cancel buttons.
`CraValidation.tsx:69-74`: the confirm button label changes to `"Validation…"` while `uiState === 'loading'`, and both confirm and cancel buttons have `disabled={uiState === 'loading'}`.
Test `disables confirmer and annuler while request is in-flight` verifies both buttons are disabled during the API call.

### 7. Validation failures preserve the current screen data and show an actionable error — PASS

`CraValidation.tsx:42-49`: on catch, `setError(msg)` stores the error message and `setUiState('confirming')` re-enables buttons — the dialog is not closed, `onValidated` is not called, and no navigation occurs.
The error is rendered inside the dialog as `<p role="alert">` (`cra-validation__error`), with a user-friendly fallback message for unknown errors.
Test `displays error inside dialog and re-enables action buttons on API error` verifies this path end-to-end.

---

## Regressions

None observed. The full test suite (63 tests across 6 files) passes without modification. All pre-existing `data-testid` attributes were preserved.

---

## Blocking issues

None.

---

## Verdict

**PASS** — all 7 acceptance criteria are satisfied. The implementation is correct and the test suite is green.
