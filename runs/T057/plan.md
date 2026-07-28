Now I have everything I need to write the plan. Let me produce it.

---

## Objective

Replace the basic flat-text table in `renderPage2()` of `CraPdfGenerator.java` with a visually polished layout: styled header with background, alternating rows, distinct visual treatment per day type, a prominent total row, the covered period displayed above the table, and multi-page support.

## Included

### `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`

- Add `PDType1Font italic` field (`Standard14Fonts.FontName.HELVETICA_OBLIQUE`) for secondary day rows.
- Add `drawFilledRect(cs, x, y, width, height, Color)` helper using `setNonStrokingColor` + `addRect` + `fill`.
- Add `drawHorizontalLine(cs, x1, x2, y, Color)` helper using `moveTo` / `lineTo` / `stroke`.
- Add `drawColoredText(cs, font, size, x, y, text, Color)` helper wrapping `setNonStrokingColor` + `beginText`.
- Rewrite `renderPage2()`:
  - Below the "Détail journalier" title, draw a period line using `DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH)` (e.g. "Période : Mars 2026").
  - Extract a `drawTableHeader(cs, y)` method: fills header row background (dark slate `#2D3748`), draws bold white column labels "Date", "Valeur", "Note".
  - Implement a paginated row loop: track current `y`; when `y < MARGIN + TOTAL_ROW_HEIGHT + MIN_BOTTOM_MARGIN`, close the content stream, add a new `PDPage`, open a new stream, reset `y`, call `drawTableHeader` again.
  - For each `CraPdfDayEntry`:
    - `WORKED_FULL`: white background, regular font, black text, fraction displayed as "1".
    - `WORKED_HALF`: pale amber background (`#FFFBEB`), regular font, fraction displayed as "½".
    - `WEEKEND`: light gray background (`#E2E8F0`), italic font, muted text color (`#718096`).
    - `NOT_WORKED` / `HOLIDAY`: very light gray background (`#F1F5F9`), italic font, muted text color.
    - Alternate every two worked rows with a slightly tinted background (`#F7FAFC`) for readability.
    - Draw a hairline separator (`#CBD5E0`) between every row using `drawHorizontalLine`.
  - After the last row, draw a total row: accent background (`#DBEAFE`), bold font, right-aligned total label "Total" and the `totalWorkedDays` value.
- Define new layout constants:
  - `PAGE2_COL_DATE_X = MARGIN`, `PAGE2_COL_DATE_WIDTH = 130f`
  - `PAGE2_COL_VALEUR_X = MARGIN + 140f`, `PAGE2_COL_VALEUR_WIDTH = 110f`
  - `PAGE2_COL_NOTE_X = MARGIN + 260f`
  - `PAGE2_ROW_HEIGHT = 16f`, `PAGE2_HEADER_HEIGHT = 20f`
  - `PAGE2_MIN_BOTTOM_Y = MARGIN + 25f`
- The `PDDocument` must be passed into `renderPage2()` so it can call `pdf.addPage()` for overflow pages; update the signature and the call site in `generate()`.

### `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java`

Keep the two existing tests; add three new ones:

- `displaysMonthPeriodAboveTable()`: period string appears in page-2 text (e.g. "mars 2026").
- `rendersAllDaysOf28DayMonth()`: fixture for February 2026 (28 days); all 28 dates appear in extracted page text; page count ≥ 2.
- `rendersAllDaysOf30DayMonth()`: fixture for April 2026 (30 days); verify 30 date strings and total row text.
- `rendersAllDaysOf31DayMonthAcrossPages()`: fixture for July 2026 (31 days) including at least one half-day entry; assert all 31 dates present; assert "Total" appears; assert page count is correct (≥ 2 if overflow, 2 otherwise).

Each fixture populates every day of the month using `YearMonth.of(year, month).atDay(d)` in a loop, assigning `WORKED_FULL` for weekdays, `WEEKEND` for Saturday/Sunday, and one `WORKED_HALF` on a midweek day.

## Excluded

- Page 1 redesign (summary, parties, signatures).
- Changes to worked-day calculation logic (`CraPdfDownloadService.resolveDayType`).
- Data model changes (all `CraPdfDayEntry` / `CraPdfDocument` records stay as is).
- Replacing PDFBox with another library.
- Hourly time tracking.
- Holiday auto-detection (the existing `HOLIDAY` type is passed in from the service layer unchanged).
- Frontend changes.

## Acceptance criteria

- The PDF page 2 shows the covered period (e.g. "mars 2026") above the worked-days table.
- Every day of the covered month appears with its date, abbreviated weekday, and worked value.
- `WORKED_FULL` rows use black text on a white/light-tinted background.
- `WORKED_HALF` rows are visually distinct from full-day rows (different background or label).
- `WEEKEND` and `NOT_WORKED` rows render in muted/italic style, clearly secondary.
- A total row appears at the bottom of the table with bold styling and an accent background.
- A table header row appears at the top of every page (when the table spans multiple pages).
- All three new `CraPdfGeneratorTest` cases (`28`, `30`, `31` day months) pass.
- Existing tests `generatesTwoPagePdfWithSummaryAndDayDetails` and `tolerantToNullProviderContactAndEmptyDayList` continue to pass.
- `./mvnw test` passes with no compilation errors.
