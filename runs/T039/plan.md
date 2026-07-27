## Objective
Redesign `CraHistory` to deliver a polished, business-oriented view of past CRAs: one card/row per month sorted newest-first, with visible status badges, worked-day totals, validation dates, and a conditional PDF action, plus proper empty, loading, and error states that work on all screen sizes.

## Included

**`frontend/src/api/types.ts`**
- Add `validationDate?: string | null` to `CraSummaryDto` (field is returned by the backend and already consumed by the component, but missing from the type).

**`frontend/src/components/CraHistory/CraHistory.tsx`**
- Sort the `cras` array by year desc, then month desc before rendering.
- Replace the raw `<table>` with a `<ul role="list">` of `<li>` cards for responsive layout. Each card displays:
  - Period: "Month YYYY" (e.g. "July 2026")
  - Total worked days
  - Status badge (`DRAFT` vs `VALIDATED`) with distinct visual treatment
  - Validation date when `status === 'VALIDATED'` and `validationDate` is set; otherwise "—"
  - "Open" action (always visible)
  - "Download PDF" action only when `status === 'VALIDATED'`
- Replace bare `<p>Loading...</p>` with a loading skeleton (3 placeholder cards using CSS animation).
- Replace bare `<p>` error with a styled error banner (`role="alert"`, icon, retry guidance).
- Add a styled empty state (icon + descriptive message) when the list is empty.
- Ensure all interactive elements have visible focus styles and meaningful `aria-label` attributes (include period in button labels, e.g. `aria-label="Download PDF for July 2026"`).

**`frontend/src/components/CraHistory/CraHistory.css`**
- Full rewrite of the stylesheet to implement the card layout.
- Card: white background, border, border-radius, subtle shadow, flex row on desktop, stacked on mobile (`max-width: 640px` breakpoint).
- Status badge: pill shape; yellow/amber for `DRAFT`, green for `VALIDATED`.
- Loading skeleton: gray animated shimmer blocks matching card dimensions.
- Empty state: centered column, muted icon placeholder, secondary-text message.
- Error banner: red-tinted background, bold message, no overflow on narrow viewports.
- All touch targets ≥ 44 px tall.
- No horizontal overflow at any viewport width.

**`frontend/src/components/CraHistory/CraHistory.test.tsx`**
- Update existing tests to match new markup (query by role/label, not CSS class).
- Add tests for:
  - newest-to-oldest sort order
  - VALIDATED badge and PDF button presence
  - DRAFT badge and absent PDF button
  - empty state message rendered when `listCras` returns `[]`
  - loading state rendered before the promise resolves
  - error state rendered when `listCras` rejects
  - `aria-label` content on Open and Download buttons

## Excluded

- Pagination (data volume does not require it per the ticket).
- Backend changes or API contract modifications.
- CRA deletion feature.
- Changes to any component other than `CraHistory` (no refactor of `App.tsx`, `CraSummaryPanel`, etc.).
- Introducing an external component library or icon package.

## Acceptance criteria

- CRA cards appear ordered from the most recent period to the oldest.
- Each card shows: period label, total worked days, status badge, validation date (or "—"), and an Open button.
- Download PDF button is present for `VALIDATED` entries and absent for `DRAFT` entries.
- `DRAFT` and `VALIDATED` badges are visually distinguishable by colour alone and by text.
- At viewport width 375 px, no horizontal scrollbar appears and all content remains readable.
- The loading skeleton renders while the `listCras` promise is pending.
- An error banner with `role="alert"` renders when `listCras` rejects.
- An empty-state message renders when `listCras` resolves with an empty array.
- Open and Download PDF buttons have `aria-label` values that include the CRA period (verifiable via axe or manual screen-reader test).
- All existing and new `CraHistory.test.tsx` tests pass (`npm test -- --testPathPattern CraHistory`).
