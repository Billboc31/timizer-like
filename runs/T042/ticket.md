# T042 — Add frontend component tests for calendar and validation interactions

**Source**: GitHub Issue #74

## Description

## Context
The most important user interactions need fast automated tests in addition to browser-level end-to-end coverage.

## Goal
Protect calendar state transitions, totals, validation controls, and error feedback with focused component tests.

## Description
Use the frontend test stack already configured in the repository. Add tests for the monthly calendar, CRA summary, validation confirmation, history rendering, and shared feedback components. Mock API boundaries rather than testing implementation details.

## Out of Scope
- Duplicating the full end-to-end suite.
- Snapshot-only tests with no behavioural assertions.
- Backend tests.

## Acceptance Criteria
- [ ] Calendar clicks correctly cycle through 0, 1, 0.5, and back to 0 according to the implemented product rule.
- [ ] Displayed totals update correctly after day changes.
- [ ] Loading and disabled states prevent duplicate actions.
- [ ] Validation confirmation can be accepted and cancelled.
- [ ] API errors produce visible, actionable feedback.
- [ ] History empty and populated states are tested.
- [ ] Tests pass from the standard frontend test command.
