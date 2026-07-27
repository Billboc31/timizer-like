# T036 — Redesign the monthly CRA calendar for clarity and fast entry

**Source**: GitHub Issue #68

## Description

## Context
The monthly calendar is the application's primary workflow and must be immediately understandable and pleasant to use.

## Goal
Create a polished calendar that clearly communicates worked days, half-days, non-worked days, weekends, and the selected month.

## Description
Refactor the monthly CRA calendar presentation while preserving the existing click cycle. Each day must have clear visual states for 0, 0.5, and 1 day. Weekends and days outside the selected month must be visually differentiated. Add a compact legend and visible interaction feedback.

Ensure day cells remain usable with mouse, keyboard, and touch input.

## Out of Scope
- Changing CRA business rules.
- Adding arbitrary hourly time entry.
- Backend changes unless required to fix an identified contract defect.

## Acceptance Criteria
- [ ] Worked, half-day, and non-worked states are visually unambiguous.
- [ ] One click and two-click behaviour remains correct.
- [ ] The current month and year are prominently displayed.
- [ ] Weekends are visually differentiated without appearing disabled unless they are actually disabled.
- [ ] A legend explains all day states.
- [ ] Day cells have hover, focus, pressed, and disabled states.
- [ ] Calendar is usable on mobile without clipped days or horizontal overflow.
- [ ] Keyboard activation works with Enter and Space.
