All 18 tests pass. Here is a summary of what was changed:

---

**Files modified:**

**`backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`**
- Added imports: `ArrayList`, `LinkedHashMap`
- Replaced `VALIDATION_BLOCK_HEIGHT = 160f` → `MONTHLY_SIGNATURE_BLOCK_HEIGHT = 155f`
- Rewrote `renderPage2()`: groups days by `YearMonth` (preserving order via `LinkedHashMap`), then for each month draws: heading `"Détail — <mois> <année>"`, table header, day rows (with existing pagination), per-month total row (sum of `workedFraction`), and signature boxes block — with a page-break guard before the sig block
- Added `drawMonthlySignatureBoxes()`: horizontal separator, two side-by-side boxes (`(tableWidth - 12) / 2` each) — left box "Signature du prestataire" with Nom+underline, Date+underline, blank rect; right box "Signature du client" with italic "Bon pour validation des temps", Nom+underline, Date+underline, blank rect
- Removed `drawClientValidationBlock()`

**`backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java`**
- Updated `clientValidationBlockAppearsOnShortCra`: removed old `"Nom du client"` / `"Date de validation"` assertions, added `"Signature du prestataire"` / `"Signature du client"`
- Updated `clientValidationBlockAppearsAfter31DayPeriod`: same update
- Added `signatureBoxesAppearForEachMonthInMultiMonthCra()`: verifies both month headings and ≥2 occurrences of each sig label on `twoMonthFixture`
- Added `signatureBlockDoesNotSplitAcrossPages()`: verifies both sig labels appear on the same page for a 28-day fixture
- Added `countOccurrences()` helper
