# T060 — Add compact monthly calendar overview to CRA PDF cover page

**Source**: GitHub Issue #118

## Description

## Objective

Redesign the first page of the CRA PDF as a visual period overview using compact monthly calendars that highlight worked days.

## Context

The CRA PDF should provide an immediate, readable summary before the detailed daily content. For a CRA spanning one or several months, the first page must show each covered month as a small calendar.

## Requirements

- Add a dedicated cover/summary page before the detailed CRA pages.
- Display the CRA period and its main totals, including at least:
  - Start and end dates
  - Total worked days
  - Total declared duration when available
- Render every month intersecting the selected CRA period as a compact calendar card.
- Highlight worked days clearly and consistently.
- Visually distinguish days outside the CRA period when the first or last month is partial.
- Use a compact grid capable of displaying several months on one A4 page.
- Keep the design modern, clean, and readable at print size.
- Ensure the result remains understandable when printed in grayscale.
- Continue the detailed CRA content after this overview page.

## Design expectations

- Small calendar cards with a visible month/year heading.
- Monday-first week layout.
- Clear legend for worked and non-worked days.
- Balanced spacing and typography; avoid a spreadsheet-like appearance.

## Acceptance criteria

- The first PDF page is a visual summary page.
- Every month included in the CRA period appears exactly once.
- All worked days represented in the detailed CRA are highlighted in the overview.
- Partial months do not visually imply work outside the selected period.
- The layout remains readable for periods covering up to 12 months.
- The output is valid A4 and does not overlap, clip, or overflow.
- Existing detailed CRA pages remain available after the cover page.

## Dependencies

- Compatible with the client signature section introduced separately.

## Out of scope

- Editing CRA entries directly from the PDF.
- Interactive PDF controls.
- Digital signature support.
