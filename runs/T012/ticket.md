# T012 — Create CRA day update API

**Source**: GitHub Issue #12

## Description

## Context

The user must be able to click calendar days and persist work values.

## Goal

Expose a backend API for updating CRA day entries.

## Description

Add an API endpoint that updates the work value and optional note of a specific day entry in a CRA.

Only allowed work values are 0, 0.5, and 1.

Validated CRA records must not be editable unless the product scope later explicitly allows reopening.

## Out of Scope

- CRA creation
- CRA validation
- PDF generation
- Frontend calendar
- Client signature

## Acceptance Criteria

- API can update one day entry work value
- API can update one day entry note
- Invalid work values are rejected
- Updating a validated CRA is rejected
- API returns updated CRA details or updated day entry clearly
- Existing tests still pass
