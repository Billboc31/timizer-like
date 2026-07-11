# T015 — Create PDF data model

**Source**: GitHub Issue #15

## Description

## Context

PDF generation requires a clean representation of CRA data independent from persistence entities.

## Goal

Create a backend model dedicated to CRA PDF rendering.

## Description

Add a PDF data model containing all information required to render the CRA PDF.

The model must include period, provider identity, provider company address, client identity, client address, client contact, total worked days, day-by-day work details, provider signature information, and empty client signature fields for the MVP.

## Out of Scope

- Actual PDF rendering
- REST download endpoint
- Frontend download button
- Client signature capture
- Expenses management

## Acceptance Criteria

- PDF data model exists
- PDF data model contains page 1 summary information
- PDF data model contains page 2 day-by-day details
- PDF data model contains provider signature fields
- PDF data model reserves empty client signature fields
- Existing tests still pass
