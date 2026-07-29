All 34 tests pass. Here's a summary of what was implemented:

---

## Changes made

### `CraPdfGenerator.java`
- Added `HashMap` and `TreeSet` imports
- `generate()`: calls `renderCoverPage()` before `renderPage1()` and `renderPage2()`
- **New** `renderCoverPage()`: renders A4 cover page with title, period label, total worked days, compact monthly calendar cards (up to 3 per row), and a legend
- **New** `drawCalendarCard()`: draws one month as a Monday-first 7×6 grid; cells outside the month get a very-light gray fill; in-month cells are colored by `CraPdfDayType` (navy for worked full, blue for half, light gray for weekend, pale slate for holiday, white for not-worked)
- **New** `calendarCellBg()` / `calendarCellFg()`: color helpers, all grays chosen to remain distinguishable in grayscale
- **New** `drawCalendarLegend()`: three labeled swatches at the bottom of the cover page

### `CraPdfGeneratorTest.java`
- Updated 7 existing tests: page count assertions changed to `>= 3`; party/signature assertions moved from page 1 → page 2; daily-detail assertions moved from page 2 → page 3
- **New** `coverPageContainsCalendarMonthAndTotals()`: verifies page 1 contains "Compte-Rendu d'Activité", "mars 2026", and "18.5"
- **New** `coverPageRendersEveryMonthExactlyOnce()`: verifies a two-month fixture shows "avril 2026" and "mai 2026" on page 1
- **New** `twoMonthFixture()`: helper spanning April + May 2026

### `MonthlyCraReport.java` (pre-existing fix)
- Removed duplicate `providerSignatureImage` field and its first getter/setter pair (introduced by T055) that was blocking the entire build
