# T007 — Create CRA creation API

**Source**: GitHub Issue #10

## Description

## Context

The frontend must be able to create a monthly CRA for a selected month.

## Goal

Expose a backend API for creating a monthly CRA.

## Description

Add an API endpoint that creates a CRA for a given month and year.

The created CRA must initialize one day entry for every calendar day in the selected month.

Default values must be 0 for weekend days and 1 for weekdays unless another default rule is explicitly documented.

## Out of Scope

- Updating day values
- CRA validation
- PDF generation
- Frontend UI
- Authentication
- Client signature

## Acceptance Criteria

- API can create a CRA for a month and year
- Created CRA contains one entry per calendar day
- Default day values are applied consistently
- Duplicate CRA creation for the same month and year is rejected or returns the existing CRA clearly
- API returns the created CRA details
- Existing tests still pass
