# T033 — Audit the current frontend UI and produce a prioritized defect list

**Source**: GitHub Issue #65

## Description

## Context
The current application UI is visually inconsistent and contains functional bugs. Before redesigning individual screens, the existing frontend must be reviewed systematically.

## Goal
Create a clear, prioritized inventory of visual defects, interaction bugs, broken states, and console/runtime errors in the current React application.

## Description
Run the application locally and inspect every available user flow and route. Record issues affecting layout, navigation, calendar interactions, CRA validation, history, PDF download, responsiveness, loading states, and error handling.

Create a Markdown report in the repository containing:
- affected route or component;
- reproducible steps;
- expected behaviour;
- actual behaviour;
- severity: blocker, major, minor, cosmetic;
- screenshot reference when useful;
- suggested follow-up ticket title.

Also capture all browser console errors, React warnings, failed network requests, and obvious accessibility violations.

## Out of Scope
- Implementing fixes.
- Redesigning components.
- Backend refactoring unrelated to visible frontend errors.

## Acceptance Criteria
- [ ] Every existing frontend route has been inspected.
- [ ] All reproducible UI and functional defects are documented.
- [ ] Browser console and network errors are included.
- [ ] Findings are prioritized by severity.
- [ ] The report is committed to the repository.
- [ ] No application behaviour is changed by this ticket.
