All tests pass (288/288). Here is the test report.

---

## Test Report — T061: New CRA Period Selection Dialog

### Test run

```
Test Files  32 passed (32)
     Tests  288 passed (288)
  Duration  1.61s
```

---

### Acceptance Criteria

#### AC1 — `New CRA` is accessible from the navigation on every authenticated application page

**PASS**

`AppShell.tsx:27-34` renders a "New CRA" `<button>` inside `<nav aria-label="Main navigation">`. `AppShell` wraps every view (`selector`, `history`, `settings`, `history-detail`), so the button is always present for authenticated users.

---

#### AC2 — Clicking it opens the period selection dialog

**PASS**

`onClick={onNewCra}` → `handleNewCraOpen()` (App.tsx:124-127) → `setNewCraDialogOpen(true)` → `<NewCraDialog open={true}>`. The dialog uses a native `<dialog>` with `showModal()` (NewCraDialog.tsx:32). No page navigation occurs.

---

#### AC3 — Invalid ranges cannot be submitted

**PASS**

`handleSubmit` (NewCraDialog.tsx:40-53) enforces two rules before firing `onConfirm`:
- Both fields must be non-empty → error "Les deux dates sont requises."
- `endDate < startDate` → error "La date de fin ne peut pas être antérieure à la date de début."

Errors are displayed via `role="alert"` inline in the dialog. The three relevant unit tests pass (`empty start`, `empty end`, `end before start`).

---

#### AC4 — Confirming a valid range opens the CRA calendar on the selected start month and period

**PARTIAL PASS**

The flow correctly extracts year/month from `startDate` (App.tsx:135-137, timezone-safe `'T00:00:00'` append), finds or creates a CRA for that month, then calls `handleOpen()` to load it. The `CalendarGrid` renders the loaded CRA, which carries the correct `year` and `month` — so the calendar opens on the right month. ✓

The end date of the period is preserved in `selectedPeriod` state (App.tsx:58, set at lines 147 and 156), but **no component reads `selectedPeriod`**. The state is dead code in the current implementation. The calendar does not visually highlight or bound the full selected period. This is a gap against "opened on the selected start month **and period**."

This is likely intentional (CRAs are per-month objects; multi-month rendering is not yet built), but the stored state is unused and the period end is invisible after confirmation.

---

#### AC5 — Cancelling leaves the current page and data unchanged

**PASS**

`handleNewCraCancel` (App.tsx:129-132) only closes the dialog and clears `newCraError`. No view transition, no API call, no CRA created. ESC key fires the native `cancel` event, mapped to the same handler via `onCancel={handleCancel}` (NewCraDialog.tsx:88). Both cases covered by unit tests.

---

#### AC6 — The flow works for periods spanning multiple months

**PARTIAL PASS**

The dialog imposes no restriction on date range length — a range from `2026-01-01` to `2026-06-30` is accepted and confirmed. However, only a single CRA is created for the start month. The end date is stored but not used. The multi-month period is therefore accepted without error, but only the start month is acted upon.

This is consistent with "Automatically generating recurring CRA records" being out of scope, but the criterion as written implies the flow should behave correctly for multi-month selections beyond just not crashing.

---

### Additional observations

| # | Severity | Description |
|---|----------|-------------|
| 1 | Minor | `selectedPeriod` is set but never consumed. It is dead state that could mislead future developers into thinking the period is already wired downstream. |
| 2 | Minor | The "New CRA" nav button shows `aria-current="page"` when `activeView === 'selector'` — this triggers even when the user navigated to the selector by other means, not via the dialog. Not a regression but semantically imprecise. |
| 3 | Info | Focus is correctly returned to the "New CRA" button on dialog close (App.tsx:115-122) and Tab trapping is implemented. Axe test passes. |
| 4 | Info | The dialog stays open on API error (App.tsx:161-163), allowing the user to retry. Correct UX. |

---

### Summary

| Criterion | Status |
|-----------|--------|
| New CRA accessible from navigation everywhere | **PASS** |
| Click opens period selection dialog | **PASS** |
| Invalid ranges blocked | **PASS** |
| Confirm opens calendar on start month | **PASS** |
| Confirm exposes full selected period to flow | **FAIL** — `selectedPeriod` stored but unused |
| Cancel leaves page unchanged | **PASS** |
| Multi-month periods handled | **PARTIAL** — accepted, start-month CRA created, end date ignored |

**Overall: CONDITIONAL PASS.** The core flow is functional and all tests pass. One gap is blocking against the letter of AC4: the stored `selectedPeriod` is not consumed, so the period end date has no effect after confirmation. This should be explicitly acknowledged — either by wiring `selectedPeriod` into downstream components, or by narrowing the acceptance criterion to "start month only" if multi-month display is deferred.
