## Objective

Remove the obsolete summary/signature page (`renderPage1`) and merge calendar and daily-detail content into a single content-aware rendering flow so that a standard single-month CRA fits on one page, with overflow pages created only when measured content requires them.

## Included

### `CraPdfGenerator.java`

**1. Introduce `PageState` private record**

```java
private record PageState(PDPage page, PDPageContentStream cs, float y) {}
```

Carries an open content stream and the current y-coordinate between rendering phases.

**2. Delete `renderPage1()` (lines 242–277)**

This method creates the now-redundant summary/signature page (provider party block, client party block, expenses section, provider signature block, client signature block). Its signatures are already rendered per-month by `renderPage2`.

**3. Refactor `renderCoverPage()` → returns `PageState`**

- Remove the `try-with-resources` wrapper; do not close the content stream inside the method.
- After drawing the calendar cards and legend, return `new PageState(page, cs, y)` where `y` is the position immediately below the legend.
- The returned CS remains open for the subsequent detail flow.

**4. Rename `renderPage2()` → `renderDetailSections(PDDocument, CraPdfDocument, PageState)`**

- Remove the unconditional `pdf.addPage()` at the start; instead use the incoming `PageState`.
- Extract the page/cs/y from the incoming state into local variables.
- Existing intra-section page-overflow guards (for month header, rows, total row, provider signature, client signature) are kept unchanged.
- Return the final `PageState` so `generate()` can close it.

**5. Update `generate()`**

```java
public byte[] generate(CraPdfDocument document) {
    PDDocument pdf = new PDDocument();
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
        PageState state = renderCoverPage(pdf, document);
        try {
            state = renderDetailSections(pdf, document, state);
        } finally {
            state.cs().close();
        }
        pdf.save(out);
        return out.toByteArray();
    } catch (IOException e) {
        throw new IllegalStateException("Failed to generate CRA PDF", e);
    } finally {
        try { pdf.close(); } catch (IOException ignored) {}
    }
}
```

### `CraPdfGeneratorTest.java`

**Tests to delete or rewrite** (they assert on the now-removed page 2 summary page):

- `generatesTwoPagePdfWithSummaryAndDayDetails` — remove page-2 assertions about `"Frais"`, `"Provider SARL"`, `"Acme Corp"`, `"Corporate Client SA"`; rewrite to verify calendar + detail on page 1.
- `signedProviderBlockRendersNameAndDateInsideBox` — change `extractPage(loaded, 2)` → `extractPage(loaded, 1)` or `extractAllPages`.
- `signedProviderBlockRendersImageDataInsideBox` — same page-reference fix.
- `tolerantToNullProviderContactAndEmptyDayList` — remove assertion `getNumberOfPages() >= 3`; assert `>= 1` and verify "Détail journalier" on page 1.
- `displaysMonthPeriodAboveTable` — change `extractPage(loaded, 3)` → page 1.
- `generatesPdfWithPendingClientSignature` — fix page 2 → page 1.
- `generatesPdfWithBothSignatures` — fix page 2 → page 1.
- `providerNotSignedShowsPendingInProviderBlock` — fix page 2 → page 1.
- `bothSignedWithMinimalPngProducesValidPdf` — fix page 2 → page 1.

**New tests to add** (per ticket acceptance criteria):

| Test name | What it verifies |
|---|---|
| `shortOneMonthCraFitsOnOnePage` | 5-day month fixture → `getNumberOfPages() == 1` |
| `fullOneMonthCraRendersCalendarAndDetailOnSamePage` | full March 2026 (31 days) → page 1 contains both month name in calendar area and table rows; no duplicate blank trailing page |
| `multiMonthCraPaginatesWithoutClipping` | `twoMonthFixture()` → all days present in `extractAllPages`, page count >= 2, month names appear |
| `contentJustBelowThresholdFitsOnOnePage` | fixture whose total height is just under A4 printable area → `getNumberOfPages() == 1` |
| `contentJustAboveThresholdOverflowsToTwoPages` | fixture one row taller → `getNumberOfPages() == 2` |
| `noRedundantTrailingPage` | standard fixture → final page text is not blank (PDFTextStripper result for last page is not empty/whitespace) |
| `signatureBlocksAppearsOnSinglePage` | per-month signature blocks for a month that barely fits → "Signature prestataire" and "Signature client" on the same page number |
| `signedAndUnsignedStatesRenderCorrectly` | provider signed + client unsigned fixture → "En attente de signature" still present, provider name + date present |

## Excluded

- Any changes to `CraPdfDownloadService`, `CraPdfDownloadController`, `PublicCraPdfController`, or domain/model classes.
- Adding provider/client party block (company, address, contact) to the new combined page — this information was on the removed `renderPage1` only; the ticket does not specify where (or whether) it should appear in the new layout.
- Visual regression / snapshot testing infrastructure — the ticket mentions snapshots but building a new snapshot framework is out of scope; existing text-extraction assertions serve as regression guards.
- Page headers, footers, and page numbering decorations — the ticket states they must be maintained, but the current implementation does not render them; no change required.
- Any changes to calendar card rendering, legend, or color coding.
- Multi-month CRA spanning more than two months (no fixture exists; multi-month behaviour is already covered by the existing overflow guards in `renderDetailSections`).

## Acceptance criteria

- `renderPage1()` no longer exists in `CraPdfGenerator.java`.
- `generate()` calls only `renderCoverPage` and `renderDetailSections`; no intermediate `pdf.addPage()` between them.
- A fixture with 5 worked days in one month produces a PDF with exactly 1 page.
- A fixture with all 31 days of a month produces a PDF where page 1 contains the calendar month name and at least one table date row; total page count is >= 1 and final page is not blank.
- A two-month fixture produces a PDF whose `extractAllPages` text contains both month names and all their dates, with no missing or clipped rows.
- "Signature prestataire" and "Signature client" appear at least once per month in the full-text output (verified by `countOccurrences` >= number of months).
- For a two-month fixture, `countOccurrences(allText, "Signature prestataire") >= 2`.
- A fixture with a pending client signature still renders "En attente de signature".
- All existing tests that check `extractAllPages` assertions pass without modification.
- `./mvnw test -pl backend -Dtest=CraPdfGeneratorTest` exits 0.
