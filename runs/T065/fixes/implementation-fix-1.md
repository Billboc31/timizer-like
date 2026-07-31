# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T065/reviews/implementation-review.md
- generated at: 2026-07-31T16:55:31Z

---

I now have everything I need. Writing the review.

---

## Review — T065 : Add consultant and client signature boxes to each monthly CRA PDF section

### Files changed

- `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java` — full implementation
- `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java` — updated and new tests

---

### 1. Correctness relative to ticket requirements

| Requirement | Status | Note |
|---|---|---|
| Two signature boxes after monthly entries and total | ✅ | `drawMonthlySignatureBoxes` called in per-month loop after total row |
| "Signature du prestataire" — nom, date, blank rect | ✅ | Left box: underlined nom, underlined date, 66pt rect |
| "Signature du client" — nom, date, blank rect + "Bon pour validation des temps" | ✅ | Right box: italic validation wording, underlined nom/date, 66pt rect |
| Boxes side by side | ✅ | Same Y, two columns `(tableWidth - 12) / 2` each |
| Never split across pages | ✅ | Page-break guard: `if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN)` before drawing |
| **Month unambiguous if block moves to new page** | ❌ | **See blocking issue below** |
| Repeat for every month in multi-month CRA | ✅ | Loop over `LinkedHashMap<YearMonth, List<...>>` |
| Overview page and digital signatures (page 1/2) preserved | ✅ | `renderCoverPage` and `renderPage1` are unchanged |
| Grayscale A4 readable | ✅ | Black lines and text only in signature boxes |
| Existing calculations unchanged | ✅ | No change to model or service layer |

---

### 2. Blocking issue

**Acceptance criterion violated**: *"The associated month remains unambiguous if the signature block moves to a new page."*

When the signature block is pushed to a new page (lines 473–480), the code opens a blank page and draws the signature boxes with no month label or continuation note:

```java
if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN) {
    cs.close();
    cs = null;
    PDPage sigPage = new PDPage(PDRectangle.A4);
    pdf.addPage(sigPage);
    cs = new PDPageContentStream(pdf, sigPage);
    y = PAGE_TOP;          // no heading, no continuation text
}
y = drawMonthlySignatureBoxes(cs, y, tableWidth, providerName, clientName);
```

For a multi-month CRA where one month's table fills the page, the signature block for that month lands on the next page with no visual link to its month. The plan explicitly required: *"add a continuation note or re-draw the month heading on the new page for clarity."* Neither was done.

**Required fix**: before calling `drawMonthlySignatureBoxes` on the new page, draw the month heading (or at minimum a continuation label such as `"Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG)`). Example:

```java
if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN) {
    // ... open new page, y = PAGE_TOP ...
    drawText(cs, bold, 11f, MARGIN, y, "Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG));
    y -= 18f;
}
```

---

### 3. Minor observations (non-blocking)

**a. `signatureBlockDoesNotSplitAcrossPages` test is thin**

The test uses `monthFixture(february, 11)` — a 28-day February. With this size the table is unlikely to actually trigger the page-break guard for the signature block, so the test validates the happy path but not the guard itself. It would be more meaningful to use a fixture that forces the table to end near the page bottom (e.g., a full 31-day month with every day as a row).

**b. `twoMonthFixture` uses only 1 day per month**

This is a thin fixture for the multi-month test. Functionally correct, but a slightly denser fixture would increase confidence.

**c. Nom label with empty name**

When `providerName` or `clientName` is `""`, the label renders as `"Nom : "` followed by a trailing underline. Functionally acceptable, no crash, but the underline width (`leftNomWidth + 3f` to `leftX + boxWidth`) may be slightly longer than intended. No action required unless the UI allows zero-length names.

---

### 4. Scope compliance

Strictly scoped to `CraPdfGenerator.java` and `CraPdfGeneratorTest.java`. No model, service, or frontend changes. No unrelated refactors.

---

### 5. Security

No security concerns. No user input reaches the PDF rendering path without passing through validated model objects.

---

### Conclusion

The implementation is solid overall: correct layout, correct loop, correct page-break guard, good test coverage for most cases. The single blocking gap is the missing month label when the signature block spills to a new page — an explicit acceptance criterion from the ticket and a requirement stated in the plan.

IMPLEMENTATION_FIX_REQUIRED
