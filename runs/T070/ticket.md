# T070 — Fix annual calendar card overlap and responsive resizing

**Source**: GitHub Issue #141

## Description

## Objective

Fix overlapping month cards and improve the responsive behavior of the annual calendar dashboard.

## Current problems

- Some monthly calendars overlap neighbouring cards when the pointer hovers over them.
- The annual calendar grid does not resize cleanly when the viewport width changes.
- Intermediate window sizes produce cramped, clipped, or visually unstable layouts.

## Requirements

### Hover behavior

- Remove or adjust hover transforms that make a calendar card overlap adjacent cards.
- If visual elevation or scaling is retained, reserve enough grid space and use controlled stacking without covering readable content or controls.
- Hovering one month must not move other cards or cause layout shift.
- Keep the focused/hovered month visually identifiable without obscuring neighbouring months.

### Responsive layout

- Use a stable responsive grid with explicit breakpoints or fluid columns.
- Ensure month cards have a usable minimum width and never overflow their grid cells.
- Support at least:
  - wide desktop;
  - standard desktop/laptop;
  - tablet;
  - mobile.
- Reflow calendars naturally when resizing the browser.
- Avoid horizontal page scrolling.
- Keep month names, weekday headers, days, worked-day markers, and totals readable.
- Handle rapid resize and device-orientation changes without stale dimensions.
- Ensure empty months and months with six calendar rows have the same stable card behavior.

## Acceptance criteria

- Hovering a calendar never covers or overlaps another calendar.
- Hover and keyboard focus do not cause layout shifts.
- All 12 months remain readable across supported viewport widths.
- Resizing the browser reflows the grid without clipping, overlap, or horizontal scrolling.
- Month cards do not escape their container.
- Mobile layout remains usable without requiring pinch zoom.
- Keyboard focus styling provides the same information as hover.
- Visual regression tests cover representative desktop, tablet, and mobile widths.
