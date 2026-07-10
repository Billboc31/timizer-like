# T005 — Create CRA DTOs

**Source**: GitHub Issue #8

## Description

## Context

The backend API needs stable request and response objects for CRA data.

## Goal

Create DTOs for monthly CRA operations.

## Description

Add DTOs representing monthly CRA summaries, detailed monthly CRA data, day entries, and create or update requests.

The DTOs must expose only data required by the MVP UI and PDF generation flow.

## Out of Scope

- REST controllers
- Persistence entities
- Frontend types
- PDF templates
- Client signature DTOs

## Acceptance Criteria

- DTO exists for CRA list summaries
- DTO exists for full CRA details
- DTO exists for day entries
- DTO exists for create or update requests
- DTOs include month, year, total worked days, status, and day values where appropriate
- Existing tests still pass
