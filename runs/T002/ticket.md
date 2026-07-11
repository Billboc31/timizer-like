# T002 — Create CRA monthly report entity

**Source**: GitHub Issue #5

## Description

## Context

The application must store one activity report per month.

## Goal

Create the backend domain model for a monthly CRA.

## Description

Add a CRA monthly report entity representing one reporting period.

The entity must include the month, year, provider identity, provider company, client identity, client contact information, validation status, provider signature date, and timestamps.

A given month and year must not allow duplicate CRA records for the same personal usage context.

## Out of Scope

- Day entries
- Repository methods
- REST API
- PDF generation
- Frontend code
- Client signature

## Acceptance Criteria

- CRA monthly report entity exists
- Month and year are represented explicitly
- Provider and client metadata can be stored
- Validation status can be stored
- Duplicate monthly CRA records are prevented or clearly constrained
- Existing tests still pass
