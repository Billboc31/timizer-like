# T004 — Create CRA repository

**Source**: GitHub Issue #7

## Description

## Context

CRA records must be persisted and retrieved from SQLite.

## Goal

Create repository access for monthly CRA records.

## Description

Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.

The repository must support lookup by month and year.

## Out of Scope

- REST controllers
- Business services
- PDF generation
- Frontend code
- Authentication
- Client signature

## Acceptance Criteria

- CRA records can be saved
- CRA records can be retrieved by identifier
- CRA records can be retrieved by month and year
- CRA records can be listed for history display
- CRA records can be updated
- Existing tests still pass
