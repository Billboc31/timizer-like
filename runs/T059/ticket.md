# T059 — Add client signature section to CRA PDF

**Source**: GitHub Issue #117

## Description

## Objective

Add a dedicated client validation and signature section to every generated CRA PDF.

## Context

The current CRA PDF does not provide any area for client approval or signature. The document must be printable and usable as a formal timesheet validation document.

## Requirements

- Add a signature block at the end of the CRA PDF.
- Include the following fields:
  - Client name
  - Validation date
  - Signature
  - Text: `Bon pour validation des temps`
- Reserve enough blank space for a handwritten signature after printing.
- Keep the block together on one page and prevent it from overlapping the CRA content.
- When the last content page does not have enough room, render the signature block on a new page.
- Preserve the existing A4 layout and PDF generation workflow.

## Acceptance criteria

- Every generated CRA PDF contains the client signature block.
- The signature block is readable and correctly aligned on A4.
- The block never overlaps or splits across pages.
- Long and short CRA periods both generate a valid PDF.
- Existing CRA data remains unchanged.

## Out of scope

- Electronic signature provider integration.
- Storing a signature image in Timizer.
- Sending the CRA to the client by email.
