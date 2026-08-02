# T074 — Remove the obsolete inline CRA detail panel from History

**Source**: GitHub Issue #149

## Description

## Objective

Remove the obsolete inline `Détail CRA` panel from the History page now that CRA records open in the shared modal.

## Current problem

After opening or selecting a CRA from History, an old or duplicated `Détail CRA` section still remains rendered inside/below the History page. This creates a strange empty or stale window and duplicates the modal experience introduced by #143.

## Requirements

- Remove the legacy inline CRA-detail container from the History page.
- Remove associated headings, empty placeholders, borders, reserved spacing, and stale selected-detail content.
- A History row/card click must open only the shared CRA modal.
- Closing the modal must return to a clean History list with no residual detail panel.
- Remove obsolete state, effects, props, event handlers, and CSS used only by the inline detail rendering.
- Preserve History filters, sorting, pagination, selected year/period, and scroll position.
- Ensure no duplicate CRA API request is triggered by both the modal and the removed inline panel.
- Ensure selecting several CRA records successively never leaves the previous detail visible.
- Keep deep-link and browser back/forward behavior defined by #143.

## Acceptance criteria

- The History page never renders an inline or below-list `Détail CRA` window.
- Clicking a CRA opens exactly one detail UI: the shared modal.
- Closing the modal shows only the History page and restores the triggering row focus.
- No blank space or container remains where the old detail panel was.
- No stale detail appears after selecting or closing another CRA.
- History filtering, sorting, pagination, and scrolling remain unchanged.
- Network/integration tests confirm that opening a record does not cause duplicate detail fetches.
- Obsolete inline-detail code and styling are removed rather than merely hidden.

## Relationship to existing work

This is a cleanup/fix following #143 and must use the same shared modal enhanced by the full-action modal ticket.
