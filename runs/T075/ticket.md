# T075 — Optimize CRA PDF pagination and remove the redundant signature page

**Source**: GitHub Issue #150

## Description

## Objective

Optimize CRA PDF pagination by removing the obsolete final signature-only page and placing the monthly calendar table together with the following monthly detail content whenever both fit on one A4 page.

## Current problems

- The PDF contains an extra final page with a signature box that is now redundant.
- The compact calendar/table and the content currently starting on page 2 are separated even when they can fit together.
- The resulting PDF wastes space and appears unnecessarily long.

## Requirements

### Remove the redundant final page

- Identify the legacy signature-only block/page introduced before the per-month two-signature layout.
- Remove the obsolete final signature page and its forced page break.
- Keep the consultant and client signature blocks required for each detailed month by #128 and #131.
- Do not remove actual stored signatures, signer identities, timestamps, or pending-signature states from the correct monthly sections.
- Ensure no blank trailing page remains after PDF generation.

### Combine calendar and monthly detail content

- Place the monthly calendar/table and the first related detailed section on the same page when their measured content fits within the printable A4 area.
- Remove unconditional page breaks between the overview/calendar table and page-2 content.
- Use content-aware pagination rather than fixed page numbers or hard-coded breaks.
- Keep logical blocks together:
  - calendar/table header and its rows;
  - monthly totals;
  - signature blocks;
  - headings with the content they introduce.
- When content does not fit, move the complete next block to a new page without overlap or clipping.
- Maintain printable margins, headers, footers, and page numbering.
- Preserve grayscale readability and the existing visual design.

## Expected layout

For a normal one-month CRA whose content fits:

```text
Page 1
- CRA header and period summary
- monthly calendar/table with worked days
- detailed monthly entries/totals
- consultant and client signature blocks when space permits
```

Additional pages should be created only when actual measured content requires them.

## Acceptance criteria

- The obsolete final signature-only page no longer exists.
- No blank or nearly empty trailing page is generated.
- Required consultant and client signatures still appear in the correct monthly section.
- For a standard one-month CRA that fits, the calendar/table and former page-2 content render together.
- Longer months and multi-month CRA files paginate without overlap, clipping, split rows, or missing content.
- Signature blocks are never split across pages.
- Page numbering reflects the final actual page count.
- Tests cover:
  - a short one-month CRA;
  - a full one-month CRA;
  - a multi-month CRA;
  - signed and unsigned states;
  - content just below and just above a page-break threshold.
- PDF visual regression snapshots confirm there is no redundant page and that all required content remains readable.

## Relationship to existing work

This ticket corrects the layout produced by #118, #128, and #131. It removes only the obsolete global signature page; it must preserve the current per-month two-party signature workflow.
