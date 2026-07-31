# T065 — Add consultant and client signature boxes to each monthly CRA PDF section

**Source**: GitHub Issue #128

## Description

## Objective

Add two handwritten signature areas to every detailed monthly section of the CRA PDF: one for the consultant/provider and one for the client.

## Context

Issue #117 added or requested a client signature block at the end of the PDF. The required layout is different: when the PDF renders the detailed view of a month, that monthly section must contain both signature boxes so each month can be validated by both parties.

## Requirements

- Add two signature boxes to the detailed section for every month included in the CRA PDF.
- Place the boxes after the month's detailed entries and monthly totals.
- Provide one box for:
  - `Signature du prestataire` (or `Signature du consultant`, following the application's existing terminology);
  - name;
  - date;
  - handwritten signature space.
- Provide one box for:
  - `Signature du client`;
  - name;
  - date;
  - handwritten signature space;
  - validation wording such as `Bon pour validation des temps`.
- Present both boxes side by side when the printable width permits, with a clear and balanced layout.
- Keep both boxes together. They must not be split across pages or overlap monthly details.
- If the remaining space is insufficient, move the complete signature block to the next page while keeping it visibly associated with the relevant month.
- Repeat the two-box block for every detailed month in a multi-month PDF.
- Preserve the existing annual/period overview page and the detailed monthly content.
- Ensure the result remains readable when printed in grayscale on A4.

## Acceptance criteria

- Every detailed month contains exactly two clearly labelled signature boxes.
- The prestataire/consultant and client boxes both provide name, date, and sufficient handwritten signature space.
- The client box includes the validation wording.
- A multi-month CRA repeats the two signature boxes for each month.
- Signature boxes never overlap content and never split across pages.
- The associated month remains unambiguous if the signature block moves to a new page.
- Short and long months generate valid A4 PDFs without clipping or overflow.
- Existing CRA calculations and detailed entries are unchanged.

## Relationship to previous work

This ticket clarifies and extends #117: a single client signature at the end of the complete PDF is not sufficient.
