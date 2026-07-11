# T003 — Create CRA day entry entity

**Source**: GitHub Issue #6

## Description

## Context

A monthly CRA is composed of one entry per calendar day.

## Goal

Create the backend domain model for daily CRA work entries.

## Description

Add a CRA day entry entity linked to a monthly CRA.

Each entry must represent a calendar date, a work value, and an optional note.

Allowed work values for the MVP are 0, 0.5, and 1.

## Out of Scope

- Monthly CRA entity creation
- REST API
- Calendar UI
- PDF generation
- Expenses
- Client signature

## Acceptance Criteria

- CRA day entry entity exists
- Each day entry is linked to one monthly CRA
- Work value supports 0, 0.5, and 1
- Notes can be empty
- Invalid work values are rejected or prevented
- Existing tests still pass
