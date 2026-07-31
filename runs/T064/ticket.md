# T064 — Add 12-month annual calendar dashboard to the home page

**Source**: GitHub Issue #127

## Description

## Objective

Replace the current home-page overview with a true annual calendar dashboard showing all twelve months of the selected year at once.

## Context

Issue #120 introduced a global CRA overview, but the expected result is not a list of CRA periods or calendar records. The home page must provide an immediate visual overview of the whole year, month by month.

## Requirements

- Display January through December for the selected year as 12 compact monthly calendar cards.
- Use a responsive grid:
  - desktop: several months per row so the full year is visible at a glance;
  - tablet/mobile: reduce the number of columns while keeping every month accessible.
- Show the days of each month using a Monday-first calendar layout.
- Highlight worked days using the same visual meaning as the detailed CRA calendar.
- Visually distinguish at least:
  - worked days;
  - non-worked days;
  - weekends;
  - today, when viewing the current year.
- Display useful monthly totals on each card, including at least the number of worked days.
- Allow navigation to the previous and next year and provide a quick action to return to the current year.
- Clicking a month opens the detailed CRA calendar/editor positioned on that month.
- Keep CRA creation behind the existing `New CRA` action; opening the home page must not create a CRA.
- Keep the design compact, visual, modern, and consistent with the left sidebar.

## Acceptance criteria

- The root/home route displays all 12 months of one year.
- No month is missing, including months without CRA data.
- Worked days already recorded in Timizer are highlighted in the correct month and on the correct date.
- Each month displays its worked-day total.
- Changing the displayed year updates all 12 calendars.
- Clicking a month opens its detailed calendar.
- The annual view remains readable and usable on desktop, tablet, and mobile.
- Refreshing the home page preserves or predictably restores the displayed year.
- The page does not behave as a CRA creation screen.

## Relationship to previous work

This ticket clarifies and completes #120. The requested global view is an annual 12-month calendar dashboard, not only a list of existing CRA periods.
