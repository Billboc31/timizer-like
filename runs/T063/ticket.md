# T063 — Move application navigation to a responsive left sidebar

**Source**: GitHub Issue #121

## Description

## Objective

Replace the current top navigation with a modern, persistent left sidebar that becomes the primary application navigation.

## Context

The application navigation should support the new global CRA overview and the dedicated `New CRA` action while leaving more horizontal structure and clearer hierarchy for future features.

## Requirements

- Replace the current top navigation bar with a vertical sidebar on the left.
- Move all existing navigation destinations and actions into the sidebar.
- Include a prominent `New CRA` action that can open the CRA period-selection dialog.
- Include navigation to the global CRA overview/home page.
- Clearly indicate the active route.
- Keep the sidebar visible on desktop while the main content scrolls independently where appropriate.
- Provide a responsive mobile/tablet behavior, such as a collapsible drawer.
- Preserve access to account, settings, logout, and other existing navigation actions.
- Ensure the sidebar does not cover or shrink the main content beyond usable dimensions.
- Use semantic controls, keyboard navigation, visible focus states, and accessible labels.

## Design expectations

- Modern and compact visual design.
- Clear hierarchy between the primary creation action and navigation links.
- Consistent icon and label alignment.
- Optional collapsed desktop mode is acceptable but not required.

## Acceptance criteria

- The top navigation is replaced by a left sidebar on desktop.
- All previously accessible navigation actions remain available.
- The current page is visually identifiable in the sidebar.
- The `New CRA` action is available from the sidebar.
- The layout works on common desktop, tablet, and mobile viewport sizes.
- Keyboard-only users can access every sidebar action.
- Existing routes and deep links continue to work.

## Dependencies

- Must support the new CRA period-selection dialog.
- Must link to the global CRA calendar overview.

## Out of scope

- Redesigning the content of every application page.
- User-configurable sidebar ordering.
- Role-based menu customization.
