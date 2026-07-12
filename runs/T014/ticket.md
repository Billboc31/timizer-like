# T014 — Create CRA history API

**Source**: GitHub Issue #14

## Description

## Context

The application must store CRA records and allow the user to access previous months.

## Goal

Expose a backend API for listing CRA history.

## Description

Add an API endpoint that returns existing CRA records as a chronological history list.

Each item must include the period, status, total worked days, validation date when available, and enough information for the frontend to open or download the CRA.

## Out of Scope

- CRA creation
- CRA edition
- PDF generation
- Frontend history page
- Client signature

## Acceptance Criteria

- API returns a list of CRA summaries
- CRA summaries include month and year
- CRA summaries include status
- CRA summaries include total worked days
- CRA summaries are ordered consistently
- Existing tests still pass
