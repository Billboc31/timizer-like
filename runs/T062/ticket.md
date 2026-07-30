# T062 — Replace New CRA home page with global calendar overview

**Source**: GitHub Issue #120

## Description

## Objective

Transform the application home page into a global overview of existing CRA calendars and remove `New CRA` as the home page concept.

## Context

CRA creation will become an explicit navigation action handled by a dedicated period-selection dialog. The landing page should instead help the user understand and access all CRA periods at a glance.

## Requirements

- Replace the current `New CRA` landing page with a global calendar overview.
- Remove the `New CRA` page title and any assumption that opening the application immediately starts CRA creation.
- Display existing CRA periods/calendars in a clear chronological overview.
- Allow the user to open an existing CRA from the overview.
- Clearly distinguish useful CRA states when those states already exist in the domain, such as draft, completed, validated, or exported.
- Provide a meaningful empty state with a call to action using the new `New CRA` navigation button.
- Preserve direct routing to the CRA calendar/editor for existing CRA records.

## UX expectations

- The overview must work as the application's main dashboard.
- The current or most recent periods should be easy to find.
- The screen should remain usable when many CRA periods exist.
- The design should be consistent with the planned left sidebar navigation.

## Acceptance criteria

- The root/home route renders the global CRA calendar overview.
- The page is no longer named or presented as `New CRA`.
- Existing CRA periods can be opened from the overview.
- The empty state directs the user toward the dedicated `New CRA` action.
- Refreshing the application does not unexpectedly start a new CRA.
- Existing CRA editing routes continue to work.

## Dependencies

- Depends on the dedicated `New CRA` period selection flow for new record creation.
- Must integrate with the left sidebar navigation.

## Out of scope

- Analytics or billing dashboards.
- Bulk CRA modification.
- Redesigning the CRA editor itself.
