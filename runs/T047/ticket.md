# T047 — Redesign CRA month and year selection with a modern period navigator

**Source**: GitHub Issue #92

## Description

## Context
The current month and year selectors look basic and weaken the perceived quality of the primary CRA screen.

## Goal
Replace the basic selectors with a polished, intuitive period navigation component.

## Description
Create a reusable CRA period navigator displaying the selected month and year prominently. Provide previous-month and next-month controls and a compact way to jump directly to another month and year. The component must clearly indicate the current selected period and remain easy to use on mobile.

Avoid exposing two plain browser select elements as the main page heading. Native controls may still be used inside an accessible popover or dialog where appropriate.

## Out of Scope
- Changing the one-CRA-per-month rule.
- Loading several months simultaneously.
- Backend date-model changes unless a contract defect is discovered.

## Acceptance Criteria
- [ ] The selected month and year are presented as a prominent period heading.
- [ ] Previous and next month controls work across year boundaries.
- [ ] Users can jump directly to a chosen month and year.
- [ ] The component has clear hover, focus, disabled, and loading states.
- [ ] Keyboard and touch interactions are supported.
- [ ] The navigator works at 320 px without overflow.
- [ ] Changing periods never displays stale data from the previous CRA.
- [ ] Component tests cover month changes and year boundaries.
