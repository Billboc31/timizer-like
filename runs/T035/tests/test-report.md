Good — no `overflow` property anywhere. Now I have all I need to produce the report.

---

## Test Report — T035: Redesign the application shell and navigation

**Test date:** 2026-07-27  
**Branch:** `ticket/T035-redesign-the-application-shell-and-navigation`  
**Test suite:** 61/61 Vitest tests pass

---

### AC 1 — All existing screens render inside the shared application shell

**Status: PASS**

`App.tsx:36–47` wraps every component — both page views (`CraMonthSelector`, `CraHistory`) and all detail panels (`CraSummaryPanel`, `CalendarGrid`, `CraValidation`) — inside `<AppShell>`. No component renders outside the shell.

---

### AC 2 — Current CRA and history navigation are clearly accessible

**Status: PASS**

`AppShell.tsx:20–35` renders a `<nav aria-label="Main navigation">` in the header at all times, containing two always-visible buttons: "New CRA" and "History". Both navigate to their respective views.

---

### AC 3 — The active navigation item is visually distinct

**Status: PASS**

The active button receives `aria-current="page"` (e.g. `AppShell.tsx:23`). The CSS selector `.app-shell__nav-item[aria-current='page']` (`AppShell.css:40–43`) applies a white bottom-border underline (`border-bottom-color: currentColor`) and bold weight (`font-weight: 700`), making it visually distinct from the inactive button.

---

### AC 4 — Layout works at desktop, tablet, and mobile widths

**Status: PASS (code analysis — no browser verification)**

Two responsive breakpoints are implemented:
- `@media (max-width: 768px)` (`AppShell.css:68–76`): reduces header and main padding.
- `@media (max-width: 375px)` (`AppShell.css:78–86`): shrinks brand font and nav item padding.

The main content area uses `width: 100%; max-width: 1280px; margin: 0 auto` — fluid at all widths. The header uses `flex-wrap: wrap` so the brand and nav stack vertically on very narrow screens.

**Limitation:** Visual verification in a real browser was not performed. Structural code is correct.

---

### AC 5 — No horizontal scrolling at 320 px width

**Status: PARTIAL RISK**

The AppShell itself is correctly fluid: `box-sizing: border-box` globally (`index.css:19–23`), `width: 100%` on main, no fixed-width elements in the shell.

**Risk — CraHistory table:** `CraHistory.css:5–8` sets `width: 100%` on the table, which prevents deliberate oversizing, but the table has 5 columns including an "Actions" column with two buttons ("Open" + "Download PDF"). At 320px the available content width is ≈296px (after 0.75rem side padding). A table with action buttons in a flex row (`CraHistory.css:27–29`) may force the table wider than 296px, causing horizontal overflow. There is **no `overflow-x` guard** anywhere in the codebase (`grep` found zero matches).

**CalendarGrid** is safe: `flex-wrap: wrap` with `min-width: 64px` cells will reflow at any width.

**Recommendation:** Visually test the History view at 320px in a browser. If overflow occurs, add `overflow-x: auto` to `.cra-history` or reduce the Actions column to icon buttons at narrow widths.

---

### AC 6 — Page titles and main actions use consistent placement

**Status: PASS**

`AppShell.tsx:38` renders `<h2 className="app-shell__page-title">` at the top of `<main>` for every view ("New CRA" / "CRA History"). The page title position and styling (`AppShell.css:63–66`) is the same regardless of the active view. Main actions (`CraValidation`) follow as shell children in a fixed structural order.

---

### AC 7 — Navigation is keyboard accessible

**Status: PASS**

- Nav items are native `<button>` elements — Tab-focusable and Enter/Space-activatable by default.
- `<nav aria-label="Main navigation">` (`AppShell.tsx:20`) is a named landmark for screen readers.
- `aria-current="page"` on the active button communicates the current page to assistive technology.
- `:focus-visible` (`AppShell.css:49–52`) renders a 2px amber (`#f59e0b`) outline on keyboard focus, with good contrast against the blue (`#2563eb`) header.

---

### Regressions

None. 61/61 Vitest tests pass with no modifications. The jsdom navigation warning in test output is pre-existing and unrelated to this ticket.

---

### Summary

| Criterion | Status |
|-----------|--------|
| All screens inside shell | ✅ PASS |
| CRA and History navigation accessible | ✅ PASS |
| Active nav item visually distinct | ✅ PASS |
| Layout at desktop/tablet/mobile | ✅ PASS (code only) |
| No horizontal scroll at 320px | ⚠️ RISK — CraHistory table may overflow; needs browser verification |
| Consistent page title and action placement | ✅ PASS |
| Keyboard accessible navigation | ✅ PASS |

**Overall verdict: CONDITIONAL PASS.** Six of seven criteria pass cleanly. AC 5 cannot be fully confirmed without visual browser testing, specifically for the CraHistory table at 320px. This should be verified before closing the ticket. If the table overflows, it is a minor fix (add `overflow-x: auto` on the table container) that does not require re-opening the design.
