Now I have everything I need. The current code:
- **Page 2**: summary with party info + embedded digital signatures (`drawProviderSignatureBlock`, `drawClientSignatureBlock`)  
- **Page 3+**: flat table for ALL months combined, then a single `drawClientValidationBlock()` at the end (one box, blank handwritten area)

The ticket requires: per-month side-by-side blank signature boxes (prestataire + client) at the end of each monthly section in the detail pages, repeating for every month. The existing page-2 digital signature blocks stay unchanged.

## Objective

Replace the single end-of-document `drawClientValidationBlock()` with a two-box side-by-side signature block (prestataire + client with "Bon pour validation des temps") appended after each monthly detail section in `CraPdfGenerator.renderPage2()`. The block repeats for every month in a multi-month PDF and must never split across pages.

## Included

**`CraPdfGenerator.java`**

- Add constant `MONTHLY_SIGNATURE_BLOCK_HEIGHT = 155f` (replaces `VALIDATION_BLOCK_HEIGHT = 160f`).
- Refactor `renderPage2()`:
  - Group `page2Days` by `YearMonth` (preserving insertion order via `LinkedHashMap<YearMonth, List<CraPdfDayEntry>>`).
  - For each month group, render in sequence:
    1. Month section heading (e.g. `"Détail — janvier 2026"`) — reusing the existing "Détail journalier" + period heading pattern, scoped to the month.
    2. Table header (`drawTableHeader`).
    3. Day rows with existing pagination logic.
    4. Total row for that month (sum the entries in the group, not the global summary total).
    5. Monthly signature boxes block (see below), kept on one page.
  - Remove the call to `drawClientValidationBlock()` at the end.
- Add `drawMonthlySignatureBoxes(PDPageContentStream cs, float y, String providerName, String clientName)`:
  - Draws a horizontal separator line.
  - Two boxes side by side within the printable width (`(usableWidth - gap) / 2` each, ~247pt).
  - **Left box** — "Signature du prestataire": label, "Nom : [providerName]" + underline, "Date :" + underline, blank signature rectangle (~66pt tall).
  - **Right box** — "Signature du client": label, italic sub-label "Bon pour validation des temps", "Nom : [clientName]" + underline, "Date :" + underline, blank signature rectangle.
  - Returns `y` after the block.
- Before drawing the monthly signature block, check `y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN`; if so, open a new page and reset `y` to `PAGE_TOP`, then draw the block, preserving association with the month (month label is already visible above the table on the previous page — add a continuation note or re-draw the month heading on the new page for clarity).
- Remove `drawClientValidationBlock()` (the method is fully replaced).
- Keep `SIGNATURE_BOX_WIDTH`, `SIGNATURE_BOX_HEIGHT` and all page-2 signature methods (`drawProviderSignatureBlock`, `drawClientSignatureBlock`) untouched.

**`CraPdfGeneratorTest.java`**

- Update `clientValidationBlockAppearsOnShortCra`: assert "Bon pour validation des temps", "Signature du prestataire", "Signature du client" appear in the full text.
- Update `clientNameIsPreFilledInValidationBlock`: assert "Bob Buyer" still appears alongside the new client box label.
- Update `clientValidationBlockAppearsAfter31DayPeriod`: assert new labels appear in the full text.
- Add `signatureBoxesAppearForEachMonthInMultiMonthCra()`: use `twoMonthFixture()`, assert both "avril 2026" and "mai 2026" section headings appear and "Signature du prestataire" + "Signature du client" appear (at least twice each, or assert text appears in two separate page extracts).
- Add `signatureBlockDoesNotSplitAcrossPages()`: use a 28-day month fixture where the table fills nearly one page; assert "Signature du prestataire" and "Signature du client" appear on the same page (same `extractPage` call returns both).
- Remove or update any test that specifically looks for the old "Nom du client :" / "Date de validation :" wording if those labels are not kept in the new layout.

## Excluded

- Changes to `CraPdfDocument`, `CraPdfSummary`, or any other model record.
- Changes to `CraPdfDownloadService` — the flat `page2Days` list is sufficient; grouping happens inside the generator.
- Frontend code — PDF generation is entirely server-side.
- Page 1 (cover calendar) and page 2 (summary + digital signatures) — preserved as-is.
- Embedding captured digital signatures in the per-month boxes (those remain on page 2; the new boxes are blank handwritten areas).
- Any change to validation status, routing, or API contracts.

## Acceptance criteria

- Every monthly section in the detail pages ends with exactly two clearly labelled side-by-side boxes: "Signature du prestataire" (left) and "Signature du client" (right).
- The client box contains the text "Bon pour validation des temps".
- Both boxes contain a "Nom" field, a "Date" field, and a blank signature rectangle of sufficient height.
- A two-month fixture (`twoMonthFixture`) produces two distinct signature-block occurrences, one per month.
- The signature block for a given month is never split: both boxes appear on the same page, verified by a test that extracts a single page and checks for both labels simultaneously.
- `mvn test -pl backend` passes with all updated and new tests green.
- The existing cover page and summary page content (including embedded digital signatures) are unchanged, confirmed by existing tests that inspect pages 1 and 2.
- PDFs generated from 28-, 30-, and 31-day month fixtures are valid A4 documents with no clipping or overflow.
