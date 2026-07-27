# T041 — Add end-to-end tests for the complete monthly CRA workflow

**Source**: GitHub Issue #73

## Description

## Context
The application's main workflow currently lacks a browser-level safety net, allowing regressions to reach the user.

## Goal
Automatically verify the complete CRA workflow from opening a month through PDF download.

## Description
Introduce or extend the existing end-to-end test setup using the browser testing framework already present in the repository, or Playwright if no framework exists. Cover the critical happy path and key failure cases.

The suite must verify selecting a month, loading or creating its CRA, setting a full day, setting a half-day, resetting a day, checking the total, validating the CRA, finding it in history, and initiating PDF download.

## Out of Scope
- Exhaustive visual regression testing.
- Client-side signature functionality.
- Performance load testing.

## Acceptance Criteria
- [ ] A test covers the complete monthly CRA happy path.
- [ ] Day values 0, 0.5, and 1 are exercised.
- [ ] The displayed monthly total is asserted.
- [ ] CRA validation and resulting status are asserted.
- [ ] The validated CRA appears in history.
- [ ] PDF download action is tested without relying on manual interaction.
- [ ] At least one API failure scenario is covered.
- [ ] Tests run reliably from a documented local command.
