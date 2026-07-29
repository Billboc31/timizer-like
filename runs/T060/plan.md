Now I have full context. Writing the plan.

## Objective

Insert a visual calendar cover page as the first PDF page of every CRA export, showing each covered month as a compact Monday-first calendar grid with worked days highlighted, followed by period totals — while leaving the existing party/signature page and daily-detail pages intact.

## Included

### `CraPdfGenerator.java`

**New private method `renderCoverPage(PDDocument pdf, CraPdfDocument document)`:**
- Added as the first call inside `generate()`, before the existing `renderPage1()` and `renderPage2()` calls.
- Header block: title "Compte-Rendu d'Activité", period range derived from `document.page1().period()` (first and last day of the YearMonth), total worked days from `document.page1().totalWorkedDays()`.
- Builds a `Map<LocalDate, CraPdfDayType>` from `document.page2Days()` for O(1) cell lookups.
- Extracts the set of distinct `YearMonth` values from the day entries; falls back to `document.page1().period()` if the list is empty.
- For each month, renders a compact calendar card using `drawCalendarCard()`.
- Layout: cards arranged in up to 3 columns; rows added as needed. Card dimensions target ~160 pt wide × ~115 pt tall to fit 12 months on one A4 page.
- Small legend at bottom of cover page: worked-full swatch, worked-half swatch, non-worked swatch.

**New private method `drawCalendarCard(PDPageContentStream cs, YearMonth month, Map<LocalDate, CraPdfDayType> dayTypes, float x, float y, float cardWidth, float cardHeight)`:**
- Draws card background with thin border.
- Month/year heading: French long format (e.g., "mars 2026") in bold 9 pt.
- Day-of-week column headers: "L M M J V S D" in 7 pt.
- Grid cells: 7 columns × up to 6 rows. First grid day is the Monday on or before the 1st of the month.
- Cells before day 1 and after the last day of the month are drawn empty (light-gray fill, no number) to signal they are outside the CRA period.
- Cell fill colours by `CraPdfDayType`:
  - `WORKED_FULL`: navy fill (`#2D3748`), white day-number text.
  - `WORKED_HALF`: medium-blue fill (`#4A90D9`), white text.
  - `WEEKEND`: light gray (`#E2E8F0`), gray text.
  - `HOLIDAY`: pale slate (`#EDF2F7`), gray italic text.
  - `NOT_WORKED`: white, gray text.
  - Outside-month padding: very-light gray (`#F7FAFC`), no text.
- All fills chosen to remain distinguishable in grayscale (progressively lighter grays, with worked days being the darkest).

**`generate()` change (one line):**
```java
// Before: renderPage1(pdf, document); renderPage2(pdf, document);
// After:
renderCoverPage(pdf, document);
renderPage1(pdf, document);
renderPage2(pdf, document);
```

No other changes to `renderPage1()`, `renderPage2()`, or any helper methods.

---

### `CraPdfGeneratorTest.java`

Update all assertions that reference a fixed page number, since every page shifts by one:

| Old assertion | New assertion |
|---|---|
| Page count == 2 (two tests) | Page count >= 3 |
| `extractPage(loaded, 1)` for party/signature content | `extractPage(loaded, 2)` |
| `extractPage(loaded, 2)` for daily-detail content | `extractPage(loaded, 3)` |

New test `coverPageContainsCalendarMonthAndTotals()`:
- Uses `fullFixture()` (March 2026, 18.5 days).
- Asserts `extractPage(loaded, 1)` contains `"mars 2026"`, `"18.5"`, and `"Compte-Rendu d'Activité"`.

New test `coverPageRendersEveryMonthExactlyOnce()`:
- Uses a fixture spanning two months (e.g., April and May 2026 day entries, same `CraPdfSummary.period` = April).
- Asserts page 1 text contains both `"avril 2026"` and `"mai 2026"` (French month names).
- This validates the month-grouping path even though the domain currently produces single-month CRAs.

## Excluded

- Changes to `CraPdfDownloadService`, `CraPdfDocument`, `CraPdfSummary`, or any other model class — all data required by the cover page is already present.
- Changes to `MonthlyCraReport` or any JPA entity.
- Changes to `CraPdfDownloadController`.
- Support for interactive PDF controls or digital signatures.
- Editing CRA entries from the PDF.
- Any layout change to the existing party/signature page or daily-detail pages.
- Internationalisation of month labels beyond French (already used via `Locale.FRENCH`).

## Acceptance criteria

1. `CraPdfGeneratorTest` passes with zero failures; the two "page count == 2" assertions are updated to ">= 3".
2. For any generated PDF, `PDDocument.getNumberOfPages()` is at least 3 (cover + party/sig + at least one detail page).
3. `extractPage(loaded, 1)` for a March 2026 fixture contains the string `"mars 2026"` and the total worked days value.
4. `extractPage(loaded, 2)` for the same fixture still contains `"Signature prestataire"`, provider name, and signature date.
5. `extractPage(loaded, 3)` (or later pages) still contains all individual day dates in `dd/MM/yyyy` format and the `"Total"` row.
6. Generating a fixture with entries spanning two distinct `YearMonth` values produces a cover page (page 1) whose extracted text contains both French month names.
7. Generating with an empty day list (`List.of()`) does not throw; the cover page still renders the month from `CraPdfSummary.period()`.
8. The generated PDF bytes parse without error via `Loader.loadPDF()`.
