# T048 — Modernize page titles, section headings, and content hierarchy

**Source**: GitHub Issue #93

## Description

## Context
The current page titles and section headings are visually basic and do not establish a clear hierarchy across the application.

## Goal
Create a consistent, modern heading system that makes every screen easier to scan and feel more polished.

## Description
Refactor page headers and section headings across the current CRA, history, settings, and signature views. Each page header should support a clear title, optional descriptive subtitle, contextual status, and aligned primary actions. Section headings should use consistent spacing, typography, and optional supporting text.

Remove duplicated, oversized, weakly styled, or technically worded headings. Keep user-facing terminology concise and business-oriented.

## Out of Scope
- Changing navigation structure.
- Rewriting backend error messages.
- Adding new business features.

## Acceptance Criteria
- [ ] All pages use a shared page-header pattern.
- [ ] Heading levels are semantically correct and visually consistent.
- [ ] Main titles, subtitles, statuses, and actions have a clear hierarchy.
- [ ] Spacing above and below headings is consistent.
- [ ] No page relies on plain unstyled text as its primary title.
- [ ] Mobile layouts preserve title readability and action access.
- [ ] Heading and page-header components have focused tests where behaviour exists.
