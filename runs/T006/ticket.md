# T006 — Create CRA total calculation service

**Source**: GitHub Issue #9

## Description

## Context

The monthly CRA must display a reliable total of worked days.

## Goal

Create backend logic that calculates the total worked days for a CRA.

## Description

Add a service that computes the total worked days by summing all day entry work values for a monthly CRA.

The calculation must support values 0, 0.5, and 1.

## Out of Scope

- REST API
- Database schema
- PDF generation
- Frontend calculation
- Client signature

## Acceptance Criteria

- Total worked days can be calculated from day entries
- Half-days are counted as 0.5
- Non-worked days are counted as 0
- Calculation returns 21.5 for a CRA containing twenty-one full days and one half-day
- Unit tests cover total calculation cases
- Existing tests still pass
