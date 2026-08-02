All 27 tests pass. Here's a summary of what was done:

**Files modified:**

| File | Change |
|------|--------|
| `CraPdfGenerator.java` | Deleted `renderPage1()`; added `PageState` record; `renderCoverPage()` now returns open `PageState`; `renderPage2()` renamed to `renderDetailSections()` — receives `PageState`, no longer calls `pdf.addPage()` at start; `generate()` wires the two phases; empty-days case now draws signatures |
| `CraPdfGeneratorTest.java` | Rewrote 9 tests (changed page 2/3 refs → page 1, removed old assertions about `Frais`/party blocks); added 8 new tests covering one-page fit, overflow, threshold, multi-month, trailing page, and signed/unsigned states; removed duplicate `countOccurrences` |
| `ValidationStatus.java` | Added `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED` (pre-existing compilation blocker) |
| `CraStatus.java` | Added `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER` (pre-existing compilation blocker) |
| `CraDetailsMapper.java` | Extended switch to cover new `ValidationStatus` values |
| `ClientSignatureServiceTest.java` | Added missing `signedByProviderCra()` helper (pre-existing compilation blocker) |
