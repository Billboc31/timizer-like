# T043 — Responsive & Accessibility QA Findings

Date: 2026-07-27

## Summary

Audit conducted across all five frontend components (CalendarGrid, CraHistory, CraMonthSelector, CraSummaryPanel, CraValidation) and the App shell. Findings are categorised by WCAG impact: **blocker** (critical axe violation), **major** (serious axe violation or clear keyboard/responsive failure), **minor** (best-practice or low-impact issue).

---

## Findings & Fixes

### F-01 — CraHistory table missing `scope` on `<th>` elements
- **Severity**: Blocker (axe rule: `scope-attr-valid`, `th-has-data-cells`)
- **File**: `frontend/src/components/CraHistory/CraHistory.tsx`
- **Issue**: Five `<th>` header cells had no `scope` attribute, making the table inaccessible to screen readers.
- **Fix**: Added `scope="col"` to every `<th>` in the CraHistory table.

### F-02 — CraHistory table missing accessible label
- **Severity**: Major (axe rule: `table-duplicate-name`)
- **File**: `frontend/src/components/CraHistory/CraHistory.tsx`
- **Issue**: The `<table>` element had no accessible name, making its purpose unclear to screen readers.
- **Fix**: Added `aria-label="CRA history"` to the `<table>` element.

### F-03 — CraValidation confirmation UI missing dialog role
- **Severity**: Blocker (ARIA pattern: dialog must have `role="dialog"`)
- **File**: `frontend/src/components/CraValidation/CraValidation.tsx`
- **Issue**: The confirmation overlay was a plain `<div>` with no ARIA role, no modal semantics, and no accessible label.
- **Fix**: Added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="cra-validation-dialog-title"` to the confirmation container. The warning paragraph is now identified by that id.

### F-04 — CraValidation dialog missing focus management
- **Severity**: Blocker (WCAG 2.1 SC 2.4.3 Focus Order; SC 2.1.2 No Keyboard Trap)
- **File**: `frontend/src/components/CraValidation/CraValidation.tsx`
- **Issue**: Opening the confirmation dialog did not move focus inside it. Closing did not return focus to the trigger. No Tab trap existed, so keyboard users could navigate behind the dialog.
- **Fix**:
  - Added `useEffect` that moves focus to the first focusable button when `uiState` becomes `'confirming'`.
  - On return to `'idle'` (cancel or error), focus is restored to the trigger button via `triggerRef`.
  - Added `onKeyDown` handler on the dialog container: `Escape` cancels (unless loading); `Tab`/`Shift+Tab` traps focus within the dialog's enabled buttons.

### F-05 — CraMonthSelector controls not responsive below 480 px
- **Severity**: Major (WCAG 2.1 SC 1.4.10 Reflow)
- **File**: `frontend/src/components/CraMonthSelector/CraMonthSelector.tsx` (new `CraMonthSelector.css`)
- **Issue**: The month/year controls and action button were in unstyled `<div>` elements with no responsive behaviour. On narrow viewports they would overflow or overlap.
- **Fix**: Created `CraMonthSelector.css` with a flex-wrap layout for controls. Below 480 px, controls stack vertically (`flex-direction: column`). Added semantic class names to the component markup.

### F-06 — CalendarGrid cells not responsive below 320 px
- **Severity**: Major (WCAG 2.1 SC 1.4.10 Reflow)
- **File**: `frontend/src/components/CalendarGrid/CalendarGrid.tsx`, `CalendarGrid.css`
- **Issue**: The grid had `min-width: 64px` on cells inside a container with no overflow handling. On very narrow viewports the grid could cause horizontal scroll.
- **Fix**: Wrapped the `calendar-grid` div in a `calendar-grid-wrapper` div with `overflow-x: auto` and `width: 100%`. Cells now use `flex: 1 1 64px` to grow/shrink naturally.

### F-07 — CalendarGrid weekend cell contrast failure (#888 on #f0f0f0 = 3.1:1)
- **Severity**: Major (WCAG 2.1 SC 1.4.3 Contrast Minimum — fails 4.5:1 for normal text)
- **File**: `frontend/src/components/CalendarGrid/CalendarGrid.css`
- **Issue**: `.day-cell--weekend` set `color: #888` on `background-color: #f0f0f0`, yielding a contrast ratio of ~3.1:1, below the 4.5:1 requirement for text at 12–14 px.
- **Fix**: Changed `color: #888` to `color: #555` (contrast ratio ~6.6:1 on #f0f0f0).

### F-08 — CraHistory table horizontal overflow on narrow viewports
- **Severity**: Major (WCAG 2.1 SC 1.4.10 Reflow)
- **File**: `frontend/src/components/CraHistory/CraHistory.css`, `CraHistory.tsx`
- **Issue**: The table had `width: 100%` but no overflow container. On 320 px viewports the table content would overflow the page horizontally.
- **Fix**: Wrapped the `<table>` in a `<div class="cra-history__table-wrapper">` with `overflow-x: auto`.

### F-09 — CraSummaryPanel error state missing `role="alert"`
- **Severity**: Minor (status announcements not reaching screen readers reliably)
- **File**: `frontend/src/components/CraSummaryPanel/CraSummaryPanel.tsx`
- **Issue**: The error paragraph lacked `role="alert"`, so screen readers would not automatically announce the error message when it appeared.
- **Fix**: Added `role="alert"` to the error paragraph.

### F-10 — CraValidation dialog not bounded to `90vw / 480px` on narrow viewports
- **Severity**: Minor (layout overflow risk on 320 px)
- **File**: `frontend/src/components/CraValidation/CraValidation.css`
- **Issue**: The confirmation dialog container had no `max-width` constraint, so on very narrow viewports it could overflow the viewport.
- **Fix**: Added `.cra-validation__dialog { max-width: min(90vw, 480px); box-sizing: border-box; }`.

### F-11 — Global focus indicators not explicitly defined
- **Severity**: Minor (WCAG 2.1 SC 2.4.7 Focus Visible)
- **File**: `frontend/src/index.css`
- **Issue**: No explicit `:focus-visible` rule existed; browser defaults vary across environments and themes, risking invisible focus rings.
- **Fix**: Added ``:focus-visible { outline: 2px solid #2563eb; outline-offset: 2px; }` to `index.css`.

### F-12 — App `<nav>` missing accessible label
- **Severity**: Minor (WCAG best practice: landmark regions should be labelled when more than one nav exists)
- **File**: `frontend/src/App.tsx`
- **Issue**: The navigation `<nav>` element had no `aria-label`, making landmark navigation less informative for screen reader users.
- **Fix**: Added `aria-label="Application navigation"` to the `<nav>` element.

---

## Automated test coverage

Five new axe test files added (one per component), each asserting `toHaveNoViolations()`:

| File | Tests |
|------|-------|
| `CalendarGrid.axe.test.tsx` | 3 (month render, loading, error) |
| `CraHistory.axe.test.tsx` | 2 (populated list, empty list) |
| `CraMonthSelector.axe.test.tsx` | 1 (selector with no existing CRAs) |
| `CraSummaryPanel.axe.test.tsx` | 3 (summary, loading, error) |
| `CraValidation.axe.test.tsx` | 2 (idle state, dialog open state) |

All 72 tests (67 pre-existing + 11 new axe tests) pass with `npm test`.

---

## Remaining limitations

- **Color contrast** in jsdom: axe unit tests cannot check color contrast (computed styles unavailable in jsdom). Contrast was audited manually and fixed for F-07. Browser DevTools / axe browser extension should be used for production contrast verification.
- **320 px visual verification**: Responsive fixes were applied per the plan; final visual confirmation should be performed in browser DevTools device emulation.
- **CraMonthSelector h2 heading**: The `<h2>` in CraMonthSelector is correct when rendered within App (which provides the `<h1>`). Tests render it in isolation with a wrapper `<h1>` to avoid a false heading-order violation.
