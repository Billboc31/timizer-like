# T021 — Create calendar day click cycle

**Source**: GitHub Issue #21

## Description

## Context

The user wants a fast interaction to mark worked days directly from the calendar.

## Goal

Implement click cycling for CRA day work values.

## Description

Add frontend behavior allowing the user to click a day cell to cycle its work value.

The MVP cycle must support 0, 1, 0.5, then back to 0.

Each change must be persisted through the backend API.

Validated CRA records must display as locked and must not allow value changes.

## Out of Scope

- Calendar layout creation
- Backend day update API implementation
- Notes editing
- PDF generation
- Client signature

## Acceptance Criteria

- Clicking a day changes 0 to 1
- Clicking a day changes 1 to 0.5
- Clicking a day changes 0.5 to 0
- Updated value is persisted through the API
- UI reflects saving and error states
- Validated CRA days cannot be changed
