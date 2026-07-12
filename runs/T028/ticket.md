# T028 — Add backend integration tests for CRA APIs

**Source**: GitHub Issue #28

## Description

## Context

The core CRA backend APIs must be reliable because they drive the monthly reporting workflow.

## Goal

Add backend integration tests for the CRA API flow.

## Description

Create integration tests covering the main backend workflow: create a monthly CRA, retrieve it, update day values, calculate totals, validate it, list it in history, and download its PDF.

Tests must use the local test configuration and must not require external services.

## Out of Scope

- Frontend tests
- Client signature tests
- Pixel-perfect PDF comparison
- Load testing
- Authentication tests

## Acceptance Criteria

- Test covers CRA creation
- Test covers day value update
- Test covers total calculation after updates
- Test covers CRA validation
- Test covers CRA history listing
- Test covers PDF download response
- Tests run without external services
