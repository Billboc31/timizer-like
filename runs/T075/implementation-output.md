All 27 tests pass and the commit is clean. Here's a summary of what changed:

**`CraPdfGenerator.java`**
- Added `private record PageState(PDPage page, PDPageContentStream cs, float y)` to carry an open content stream between rendering phases
- `generate()` rewritten: opens `PDDocument` manually, chains `renderCoverPage` → `renderDetailSections`, closes the final CS in a `finally` block
- `renderCoverPage()` now opens the content stream without closing it and returns a `PageState` with the y-position below the calendar legend
- `renderPage1()` deleted (the obsolete global summary/signature page)
- `renderPage2()` renamed to `renderDetailSections(PDDocument, CraPdfDocument, PageState)` — consumes the incoming state instead of creating a new page, tracks `currentPage` through overflow, returns final `PageState`

**`CraPdfGeneratorTest.java`**
- Fixed all page references: `extractPage(loaded, 2)` → page 1 or `extractAllPages`, `extractPage(loaded, 3)` → page 1
- Removed assertions on `renderPage1` content (Frais, Provider SARL, Acme Corp)
- `tolerantToNullProviderContactAndEmptyDayList`: `>= 3` → `>= 1`, page 3 → page 1
- All fixtures that test signature block rendering now include at least one day entry (so the month loop executes and draws the blocks)
- `providerOnlyFixture()` and `bothSignaturesFixture()` updated to include one day entry
- Removed duplicate `countOccurrences` method
- Added 8 new tests: threshold tests (13 rows = 1 page, 14 = 2), no-trailing-blank-page, short CRA fits on 1 page, calendar+detail on same page, multi-month without clipping, signatures on single page, signed/unsigned state
