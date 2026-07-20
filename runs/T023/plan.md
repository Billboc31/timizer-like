The plan is written to `runs/T023/plan.md`. Here's a summary of what it covers:

**Objective**: Add an inline validation workflow to the CRA detail view using the existing `validateCra` API.

**Key changes across 6 files:**
- **`App.tsx`** — add `openedCra` state to switch between the selector and `CraPage`
- **`CraPage/CraPage.tsx`** (new) — loads CRA via `getCra()`, shows validate button for DRAFT, inline confirmation panel ("Confirm / Cancel"), calls `validateCra`, shows validated badge on success, inline error on failure
- **`CraPage/CraPage.css`** (new) — styles for badge, confirm panel, error
- **`CraPage/CraPage.test.tsx`** (new) — 8 test cases covering all acceptance-criteria branches
- **`CalendarGrid.tsx`** — add optional `locked` prop that adds `calendar-grid--locked` CSS class
- **`CalendarGrid.css`** — add locked style (dimming + `pointer-events: none`)

**Notable assumptions**: `providerSignatureDate` defaults to today's date (no date picker); CalendarGrid remains read-only so "locked" is visual only.
