# T040 — Fix frontend runtime errors, React warnings, and failed API interactions

**Source**: GitHub Issue #72

## Description

## Context
The Timizer-like frontend is currently buggy and may expose runtime errors, React warnings, or broken API interactions.

## Goal
Eliminate all reproducible frontend errors in the main CRA workflows.

## Description
Run the application and exercise month selection, CRA creation and loading, day status changes, validation, history, and PDF download. Investigate and fix all reproducible JavaScript exceptions, React warnings, invalid state transitions, malformed requests, stale state issues, and unhandled API failures.

Do not hide errors by removing logging or suppressing warnings. Fix their underlying cause and add a regression test for each significant defect.

## Out of Scope
- Purely cosmetic redesign work.
- New business features.
- Suppressing warnings without resolving them.

## Acceptance Criteria
- [ ] Main CRA flows complete without uncaught frontend exceptions.
- [ ] Browser console contains no React warnings during normal use.
- [ ] Failed requests are handled without breaking the page.
- [ ] State remains consistent after rapid or repeated user interactions.
- [ ] Significant fixed defects have regression tests.
- [ ] Existing automated tests pass.
- [ ] A short list of fixed defects is included in the pull request description.
