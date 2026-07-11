# T013 — Create CRA validation API

**Source**: GitHub Issue #13

## Description

## Context

The user must validate a monthly CRA before generating the official PDF.

## Goal

Expose a backend API for validating a CRA.

## Description

Add an API endpoint that marks a CRA as validated.

Validation must store the validation date and provider signature date.

After validation, the CRA must be considered locked for day-entry modifications.

## Out of Scope

- PDF generation
- Client signature
- Reopening a validated CRA
- Frontend confirmation UI
- Authentication

## Acceptance Criteria

- API can validate an existing CRA
- Validation stores a validation timestamp or date
- Provider signature date is stored
- Validated CRA records cannot be edited through day update API
- API returns the validated CRA details
- Existing tests still pass
