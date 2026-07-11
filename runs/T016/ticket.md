# T016 — Create CRA PDF generator

**Source**: GitHub Issue #16

## Description

## Context

The MVP must generate a PDF similar to the current Timizer CRA export.

## Goal

Generate a two-page CRA PDF from CRA data.

## Description

Add backend PDF generation for a validated CRA.

The PDF must contain a first page with period, provider, provider company, client, contact, total worked days, expenses placeholder, provider signature, and empty client signature area.

The PDF must contain a second page with day-by-day work details showing day label, work value, and note.

## Out of Scope

- Client signature workflow
- Exact pixel-perfect Timizer clone
- Expenses details
- Frontend UI
- Email sending

## Acceptance Criteria

- A two-page PDF can be generated for a CRA
- Page 1 contains summary information
- Page 1 contains provider signature information
- Page 1 contains an empty client signature area
- Page 2 contains one row per calendar day
- The total worked days appears in the PDF
- Existing tests still pass
