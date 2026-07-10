# T011 — Create CRA retrieval API

**Source**: GitHub Issue #11

## Description

## Context

The frontend must load existing monthly CRA data for display and editing.

## Goal

Expose backend APIs for retrieving CRA records.

## Description

Add API endpoints to retrieve a CRA by identifier and to retrieve a CRA by month and year.

The response must include monthly metadata, status, total worked days, and day entries.

## Out of Scope

- CRA creation
- Day update endpoint
- PDF generation
- Frontend UI
- Authentication
- Client signature

## Acceptance Criteria

- API can retrieve a CRA by identifier
- API can retrieve a CRA by month and year
- API response includes all day entries
- API response includes total worked days
- Missing CRA records return a clear not found response
- Existing tests still pass
