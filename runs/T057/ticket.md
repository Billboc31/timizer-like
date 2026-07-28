# T057 — Redesign the PDF worked-days table with a polished monthly layout

**Source**: GitHub Issue #102

## Description

## Context
The downloaded CRA PDF includes daily worked values, but the current table is visually basic and does not match the desired professional quality.

## Goal
Create a clean, readable, and visually polished table showing the worked days for the covered month.

## Description
Redesign the daily-details section of the generated PDF. Present each calendar day with its date, localized weekday, and worked value. Use a professional table layout with a clear header, balanced column widths, subtle row separators or alternating row treatment, readable typography, and a visually distinct monthly total row.

Weekends and non-worked days should remain legible but visually secondary. Full days and half-days must be immediately understandable. Keep the table compact enough to paginate cleanly without cramped text or orphaned headers.

The table must use the exact CRA snapshot and the explicit covered period.

## Out of Scope
- Changing worked-day calculation rules.
- Adding hourly time tracking.
- Replacing the PDF generation library unless technically required.

## Acceptance Criteria
- [ ] The PDF displays the covered period above the worked-days table.
- [ ] Every day of the month is listed with date, weekday, and worked value.
- [ ] Full days, half-days, non-worked days, and weekends are easy to distinguish.
- [ ] The table header is visually clear and repeated when the table spans pages if supported.
- [ ] A prominent total row displays the monthly worked-day total.
- [ ] Long months paginate without clipped rows, overlapping text, or isolated headers.
- [ ] The visual style matches the modern light application identity.
- [ ] PDF tests verify a 28-day, 30-day, and 31-day month including half-days and page breaks.
