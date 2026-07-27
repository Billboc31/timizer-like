# T038 — Redesign the CRA summary and monthly validation panel

**Source**: GitHub Issue #70

## Description

## Context
The monthly total and validation action are central to the CRA workflow but currently lack visual hierarchy and clear status feedback.

## Goal
Create a professional summary panel that makes the CRA total, current status, and next action immediately understandable.

## Description
Refactor the CRA summary area to display the selected period, total worked days, draft or validated status, and the primary action. Clearly separate informational values from irreversible actions. Add a confirmation dialog before monthly validation and explain that validated CRA data may become read-only if this is the current business rule.

## Out of Scope
- Changing total calculation rules.
- Changing the validation API contract.
- Adding client signature functionality.

## Acceptance Criteria
- [ ] The total number of worked days is prominent and correctly formatted.
- [ ] Draft and validated statuses are visually distinct.
- [ ] The validation action is clearly identified as the primary action.
- [ ] Validation requires an explicit confirmation.
- [ ] The panel is responsive and remains readable on mobile.
- [ ] Disabled and loading states are visually clear.
- [ ] Validation failures preserve the current screen data and show an actionable error.
