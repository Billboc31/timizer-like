# T017 — Create CRA PDF download API

**Source**: GitHub Issue #17

## Description

## Context

The user must be able to download the generated CRA PDF after validation.

## Goal

Expose a backend API endpoint for CRA PDF download.

## Description

Add an API endpoint that returns the generated PDF file for a CRA.

The endpoint must return a meaningful filename containing provider company, client name, and period.

Only validated CRA records should be downloadable as official PDFs.

## Out of Scope

- PDF rendering implementation
- Frontend download button
- Client signature
- Email sending
- Batch exports

## Acceptance Criteria

- API returns a PDF response for a validated CRA
- API response uses a PDF content type
- Download filename includes the CRA period
- Non-existing CRA returns a clear not found response
- Non-validated CRA download is rejected or clearly handled
- Existing tests still pass
