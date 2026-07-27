# T043 — Perform responsive and accessibility QA on the complete frontend

**Source**: GitHub Issue #75

## Description

## Context
A professional interface must remain usable across screen sizes and for keyboard or assistive-technology users.

## Goal
Find and fix responsive layout defects and high-impact accessibility problems across the Timizer-like frontend.

## Description
Test every route at common desktop, tablet, and mobile widths, including 320 px. Verify keyboard navigation, focus order, visible focus indicators, labels, semantic headings, button names, dialog behaviour, contrast, and status announcements. Fix all blocker and major issues discovered during the review.

Use an automated accessibility checker where practical, but also perform keyboard-only manual verification.

## Out of Scope
- Formal third-party accessibility certification.
- Supporting obsolete browsers.
- Changing CRA business rules.

## Acceptance Criteria
- [ ] No screen has unintended horizontal scrolling at 320 px.
- [ ] Primary actions remain visible and usable on mobile.
- [ ] All interactive elements are reachable and operable by keyboard.
- [ ] Focus is managed correctly when dialogs open and close.
- [ ] Inputs and controls have accessible names.
- [ ] Automated checks report no critical accessibility violations.
- [ ] All blocker and major findings discovered by this ticket are fixed and documented.
