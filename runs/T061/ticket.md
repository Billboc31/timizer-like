# T061 — Add New CRA period selection dialog

**Source**: GitHub Issue #119

## Description

## Objective

Provide a dedicated `New CRA` action in the application navigation that opens a dialog for selecting the CRA period before entering the calendar.

## Context

CRA creation is currently tied too closely to the landing page. Creating a CRA should become an explicit action available from anywhere in the application.

## Requirements

- Add a visible `New CRA` button/action to the main navigation.
- On click, open a modal dialog without navigating away from the current page.
- Let the user select:
  - Start date
  - End date
- Validate that:
  - Both dates are provided.
  - The end date is not before the start date.
- After confirmation, navigate to the CRA calendar/editor.
- Open the calendar positioned on the selected period rather than the current month.
- Make the selected period available to the CRA creation flow without requiring the user to select it again.
- Closing or cancelling the dialog must not create or modify a CRA.

## UX expectations

- The period selection should be quick and understandable.
- Default values may use the current month, while remaining editable.
- Validation errors must be shown inside the dialog.
- Keyboard and focus behavior should be accessible.

## Acceptance criteria

- `New CRA` is accessible from the navigation on every authenticated application page.
- Clicking it opens the period selection dialog.
- Invalid ranges cannot be submitted.
- Confirming a valid range opens the CRA calendar on the selected start month and period.
- Cancelling leaves the current page and data unchanged.
- The flow works for periods spanning multiple months.

## Dependencies

- The navigation placement must be compatible with the planned left sidebar.

## Out of scope

- Saving reusable period presets.
- Automatically generating recurring CRA records.
- Changing CRA business validation rules.
