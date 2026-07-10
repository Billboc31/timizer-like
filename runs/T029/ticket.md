# T029 — Add frontend tests for CRA workflow

**Source**: GitHub Issue #29

## Description

## Context

The frontend workflow must remain stable because it is the main user interaction surface.

## Goal

Add frontend tests for the MVP CRA workflow.

## Description

Create frontend tests covering month selection, CRA loading, calendar display, day click cycling, total summary update, validation action visibility, and PDF download action visibility.

Tests may mock backend responses where appropriate.

## Out of Scope

- Backend integration tests
- End-to-end browser tests with real backend
- Client signature tests
- Visual regression tests
- Authentication tests

## Acceptance Criteria

- Test covers month selection display
- Test covers calendar day rendering
- Test covers click cycle behaviour
- Test covers total summary update
- Test covers validated CRA locked state
- Test covers PDF download button availability
- Tests run with the frontend test command
