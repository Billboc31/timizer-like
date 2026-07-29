I have everything needed. Here is the plan:

---

## Objective

Append a dedicated "Bon pour validation des temps" client validation block at the end of every generated CRA PDF, after the day detail table, designed for handwritten completion when printed.

## Included

**`CraPdfGenerator.java`** — the only file to modify:

- Add constant `VALIDATION_BLOCK_HEIGHT = 160f` (covers separator, heading, three labelled fields, blank signature box).

- Add private method `drawClientValidationBlock(PDPageContentStream cs, float y, CraPdfDocument document)`:
  - Draw a horizontal separator line at `y`.
  - Draw bold heading "Bon pour validation des temps" (12 pt) below the separator.
  - Draw field "Nom du client :" pre-filled with `document.page1().client().contact().name()` followed by an underline spanning the remaining width.
  - Draw field "Date de validation :" followed by a blank underline (same width convention).
  - Draw "Signature :" label followed by a blank rectangle (height ≈ 60 pt, width ≈ `pageWidth - 2 × MARGIN`) to reserve handwriting space.
  - Return the final `y` position after the block.

- In `renderPage2`, immediately after the total row is rendered (currently line 271):
  - Set `y = totalBottom` (the bottom of the total row).
  - Check `if (y - VALIDATION_BLOCK_HEIGHT < MARGIN)`: if true, close the current `cs`, null it, create a new `PDPage(PDRectangle.A4)`, add it to `pdf`, open a new `PDPageContentStream`, and reset `y = PAGE_TOP`.
  - Call `drawClientValidationBlock(cs, y, document)`.
  - Adjust the `finally` guard to close whichever `cs` is live at that point (already handled by the existing `if (cs != null)` pattern).

No changes to data models, frontend, or any other backend service.

## Excluded

- Embedding the existing electronic client signature image in this new block.
- Modifying Page 1 or the existing `drawProviderSignatureBlock` / `drawClientSignatureBlock` methods.
- Backend data model changes (`CraPdfDocument`, `CraPdfClientSignature`, etc.).
- Storing or processing data captured from the printed form.
- Any frontend changes.
- Sending the PDF by email or integrating an electronic signature provider.

## Acceptance criteria

- Every PDF generated via `GET /api/cras/{craId}/pdf` ends with the client validation block.
- The block contains, in order: a horizontal separator, the bold heading "Bon pour validation des temps", a "Nom du client" line pre-filled with the client representative name, a blank "Date de validation" line, and a blank signature rectangle of sufficient height for handwriting.
- The block is never split across pages: if the remaining space on the last table page is less than `VALIDATION_BLOCK_HEIGHT`, the block appears at the top of a new A4 page.
- A CRA covering a short period (1–5 days) and a full 31-day period both produce a valid, correctly paginated PDF.
- The Page 1 summary, provider signature block, and electronic client signature block are visually unchanged.
