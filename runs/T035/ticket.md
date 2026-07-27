# T035 — Redesign the application shell and navigation

**Source**: GitHub Issue #67

## Description

## Context
The application needs a coherent structure before individual screens can look professional.

## Goal
Provide a polished, responsive application shell with clear navigation and consistent page layout.

## Description
Create or refactor the main application layout to include a branded header or sidebar, clear navigation to the current CRA and CRA history, a constrained content area, page titles, and a predictable mobile layout.

The active route must be visually identifiable. Navigation must remain usable on narrow screens and must not hide primary actions.

## Out of Scope
- Redesigning the calendar content itself.
- Changing backend APIs.
- Adding authentication.

## Acceptance Criteria
- [ ] All existing screens render inside the shared application shell.
- [ ] Current CRA and history navigation are clearly accessible.
- [ ] The active navigation item is visually distinct.
- [ ] Layout works at desktop, tablet, and mobile widths.
- [ ] No horizontal scrolling occurs at 320 px width.
- [ ] Page titles and main actions use consistent placement.
- [ ] Navigation is keyboard accessible.
