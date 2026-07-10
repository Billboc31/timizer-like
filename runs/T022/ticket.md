# T022 — Create CRA total summary panel

**Source**: GitHub Issue #22

## Description

## Context

The user needs to see the monthly worked-day total before validating the CRA.

## Goal

Display a CRA summary panel in the frontend.

## Description

Add a summary panel showing the selected period, CRA status, total worked days, provider, provider company, and client.

The total must update when day values change.

## Out of Scope

- Calendar grid creation
- PDF rendering
- Backend total calculation implementation
- Client signature
- Expenses details

## Acceptance Criteria

- Summary panel displays the selected period
- Summary panel displays CRA status
- Summary panel displays total worked days
- Summary panel displays provider and client information
- Total updates after a day value change
- Loading and error states are handled
