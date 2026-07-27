# T034 — Introduce a professional frontend design system

**Source**: GitHub Issue #66

## Description

## Context
The current interface lacks consistent visual rules, making the application look unfinished and difficult to maintain.

## Goal
Create a reusable design foundation for a clean, professional business application.

## Description
Define and implement shared design tokens for typography, spacing, border radius, shadows, colours, borders, focus states, and responsive breakpoints. Add reusable base styles for page backgrounds, cards, buttons, inputs, badges, tables, dialogs, and empty states.

Use CSS variables or the styling mechanism already present in the project. Avoid introducing a large UI framework unless the repository already uses one.

## Out of Scope
- Rebuilding individual business screens.
- Changing application behaviour.
- Replacing the React stack.

## Acceptance Criteria
- [ ] Shared design tokens are defined in one central location.
- [ ] Typography and spacing scales are consistent.
- [ ] Primary, secondary, destructive, and disabled button styles exist.
- [ ] Form fields have default, hover, focus, disabled, and error states.
- [ ] Cards, badges, tables, and dialogs have reusable styles.
- [ ] Focus indicators remain visible and accessible.
- [ ] Existing screens still compile after the design system is introduced.
