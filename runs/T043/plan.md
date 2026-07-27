# Plan — T043: Responsive and Accessibility QA

## Objective

Audit and fix responsive layout defects and high-impact accessibility problems across all five frontend components and both application views (selector, history), so that the interface is usable at 320 px and operable by keyboard and assistive-technology users.

## Included

### 1. Install automated accessibility tooling

- Add `jest-axe` (and its `@types/jest-axe`) as dev dependencies in `frontend/package.json`.
- Configure the import in `frontend/src/setupTests.ts` (`import 'jest-axe/extend-expect'`).

### 2. Write axe-based unit tests (one per component)

For each of the five components, add an axe test inside its existing `__tests__` folder (or create the folder if absent):

- `CalendarGrid` — render a representative month, assert `toHaveNoViolations()`.
- `CraHistory` — render a list of CRAs, assert `toHaveNoViolations()`.
- `CraMonthSelector` — render the selector, assert `toHaveNoViolations()`.
- `CraSummaryPanel` — render a sample summary, assert `toHaveNoViolations()`.
- `CraValidation` — render the confirmation dialog (open state), assert `toHaveNoViolations()`.

### 3. Fix issues found by automated checks

Resolve every critical or serious axe violation across components before marking this ticket complete. Likely candidates given the current codebase:

- **Missing `<dialog>` role on `CraValidation`** — wrap the overlay in `<dialog>` (or add `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing to the dialog title).
- **Focus trap in `CraValidation`** — on open, move focus to the first focusable element inside the dialog; on close, return focus to the trigger button. Implement with a `useEffect` + `ref` on the dialog container.
- **Visible focus indicators** — audit `App.css`, `CalendarGrid.css`, `CraHistory.css`, `CraMonthSelector.css` for `outline: none` / `outline: 0` rules that suppress the default focus ring; remove or replace them with a visible custom indicator (≥ 2px offset outline).
- **Button accessible names** — ensure every `<button>` that contains only an icon or a short symbol has an `aria-label`. Specifically audit the download action in `CraHistory` and navigation buttons in `CraMonthSelector`.
- **Heading hierarchy** — verify the page has exactly one `<h1>` and that subsequent headings (`<h2>`, `<h3>`) nest in order across both views. Fix any skipped or duplicate heading levels.
- **`<table>` in `CraHistory`** — confirm `<th>` elements carry `scope="col"` (or `scope="row"`) and that the table has a `<caption>` or is labelled with `aria-label`.

### 4. Responsive layout audit and fixes

For each component, verify at 320 px, 768 px, and 1280 px viewport widths (manual + browser devtools):

- **`CalendarGrid`** — the grid must not cause horizontal overflow at 320 px. If it does, switch from a fixed-width layout to `width: 100%; overflow-x: auto` on the grid container, or collapse to a single-column day list below a configurable breakpoint.
- **`CraHistory`** — the table must not overflow horizontally at 320 px. Wrap `<table>` in a `div` with `overflow-x: auto` if not already present.
- **`CraMonthSelector`** — month/year picker controls must stack vertically (column flex) below 480 px.
- **`CraSummaryPanel`** — definition list must remain readable at 320 px (single-column if needed).
- **`CraValidation`** — modal must be bounded to `min(90vw, 480px)` and must not overflow at 320 px.

Apply fixes in each component's CSS file (`.css` module co-located with the component). Use relative units (`rem`, `%`) and `max-width` rather than fixed pixel widths.

### 5. Keyboard navigation verification

Manual keyboard-only walkthrough of both views:

- Tab through `CraMonthSelector` controls; verify month/year selects and the "Create CRA" button are all reachable.
- Tab through `CalendarGrid`; verify day cells that are interactive (toggled worked/absent) are focusable and activatable with Space/Enter.
- Tab into `CraHistory`; verify the download button for each row is reachable.
- Open `CraValidation` dialog from a keyboard action; verify focus moves inside; Tab cycles only within the dialog; Escape closes it and returns focus to the trigger.

Fix any element that is not reachable or operable: add `tabIndex={0}` + `onKeyDown` handler as needed, or convert non-button interactive `<div>` elements to `<button>`.

### 6. Contrast audit

Use browser DevTools' contrast checker or the axe browser extension to verify text contrast ≥ 4.5:1 (normal text) and ≥ 3:1 (large text / UI components). Fix any failing colour pairs in `index.css` or component CSS files.

### 7. Status announcements

Verify that asynchronous operations (CRA save, CRA load, error states) produce `role="alert"` or `aria-live` announcements that are already present in the code. Confirm no announcement is suppressed by a missing container or a race condition.

### 8. Document findings

Create `runs/T043/fixes/findings.md` listing every issue found, its severity, the file changed, and the fix applied.

## Excluded

- Formal WCAG 2.2 Level AA certification by a third party.
- Support for obsolete browsers (IE, legacy Edge).
- Changing CRA business rules (worked-day calculation, validation workflow).
- Adding a routing library or changing the single-page navigation model.
- New features or UI redesign beyond what is required to fix identified defects.
- AAA contrast requirements.

## Acceptance criteria

- `npm test` (Vitest) passes with no failures, including the five new axe-based tests, each asserting `toHaveNoViolations()`.
- No horizontal scroll bar appears at 320 px viewport width on either the selector view or the history view (verified in browser devtools device emulation).
- All interactive elements (selects, buttons, day cells, download links, dialog actions) are reachable by pressing Tab and activatable with Enter or Space — verified by a keyboard-only walkthrough with mouse disconnected.
- `CraValidation` dialog traps focus while open; pressing Escape closes the dialog and returns focus to the element that triggered it.
- Every `<button>` has a non-empty accessible name (verifiable via axe or browser accessibility tree).
- The page heading hierarchy has no skipped levels and exactly one `<h1>` (verifiable via axe `heading-order` rule).
- All text elements pass a 4.5:1 contrast ratio (verifiable via axe `color-contrast` rule with no critical violations).
- `runs/T043/fixes/findings.md` exists and lists all issues found, their severity, affected files, and applied fixes.
