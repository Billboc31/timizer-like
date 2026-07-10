# T019 — Create CRA month selector

**Source**: GitHub Issue #19

## Description

## Context

The user needs to create or open one CRA per month.

## Goal

Create a frontend month selection component.

## Description

Add a UI component that lets the user select a month and year, then create or open the corresponding CRA.

The component must clearly display the selected reporting period.

## Out of Scope

- Calendar day grid
- CRA history page
- PDF download
- Backend API implementation
- Client signature

## Acceptance Criteria

- User can select a month
- User can select a year
- User can open an existing CRA for the selected period
- User can create a CRA for the selected period when none exists
- Selected period is displayed clearly
- UI handles loading and error states
