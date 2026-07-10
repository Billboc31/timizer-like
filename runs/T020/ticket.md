# T020 — Create CRA calendar grid

**Source**: GitHub Issue #20

## Description

## Context

The main user workflow is clicking days in a calendar to mark worked time.

## Goal

Create the frontend calendar grid for a monthly CRA.

## Description

Add a calendar grid displaying all days of the selected CRA month.

Each day must show the day number, weekday, and current work value.

Weekends must be visually distinguishable from weekdays.

## Out of Scope

- Click cycling behavior
- Backend persistence
- Validation button
- PDF download
- CRA history

## Acceptance Criteria

- Calendar displays every day of the selected month
- Weekday labels are visible
- Current work value is visible for each day
- Weekends are visually distinguishable
- Calendar updates when a different CRA month is loaded
- Empty and loading states are handled
