## Objective

Add a backend Java service that turns a `CraPdfDocument` (the data model introduced in T015) into a two-page A4 PDF. Page 1 renders the CRA summary and signature blocks; page 2 renders one row per calendar day of the period.

## Included

### Assumptions

- The rendering library is **Apache PDFBox 3.x**. Rationale: Apache-2.0 license, mature, provides both drawing (`PDPageContentStream`) and text extraction (`PDFTextStripper`) needed for tests. If the reviewer prefers OpenPDF or another engine, only the generator implementation changes; the API surface stays identical.
- CRA data is provided in-memory as `com.timizerlike.cra.pdf.model.CraPdfDocument` (T015). This ticket does not build the mapping from persisted CRA + related entities to that record — that mapping is either already covered by earlier tickets or belongs to the API layer (T017).
- All labels use French wording aligned with the existing Timizer export (e.g. "Compte-Rendu d'Activité", "Total jours travaillés", "Signature prestataire", "Signature client").
- A calendar month has at most 31 day rows; the page-2 layout is sized so all rows fit on a single page (≈18pt per row after headers). No pagination overflow is expected within this ticket.

### Dependency

- `backend/pom.xml`: add
  ```xml
  <dependency>
      <groupId>org.apache.pdfbox</groupId>
      <artifactId>pdfbox</artifactId>
      <version>3.0.3</version>
  </dependency>
  ```
  (test scope not required — reused by tests for extraction).

### Generator class

- New file `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`.
- Plain POJO (no Spring annotation) to avoid touching `com.timizer.backend.TimizerBackendApplication` component scan — T009 uses `com.timizer.*`, T015 uses `com.timizerlike.*`, and the generator sits in the T015 package tree.
- Public method:
  ```java
  public byte[] generate(CraPdfDocument document)
  ```
  returns the encoded PDF bytes. Throws `IllegalStateException` wrapping any `IOException` from PDFBox.
- Internally: create `PDDocument`, add page 1 (`PDPage(PDRectangle.A4)`), render summary via a `PDPageContentStream`, add page 2, render day table, then `save` to a `ByteArrayOutputStream` and return `toByteArray()`.
- Small private helpers inside the class only: `formatPeriod(YearMonth)` → `MM/yyyy`, `formatDay(LocalDate, DayOfWeek)` → short French label + `dd/MM/yyyy`, `formatFraction(BigDecimal)`, `formatDayType(CraPdfDayType)` mapping enum values to human labels (`WORKED_FULL` → "Travaillé", `WORKED_HALF` → "Demi-journée", `WEEKEND` → "Week-end", `HOLIDAY` → "Férié", `NOT_WORKED` → "Non travaillé"). No new public utility classes.

### Page 1 layout (summary + signatures)

Rendered top-to-bottom on a single A4 portrait page. Each block starts on a new baseline; margins ≈40pt.

- Title header: "Compte-Rendu d'Activité" + `formatPeriod(summary.period())`.
- Provider block, labelled "Prestataire": `provider.name()`, `provider.company()`, `provider.address()`, then contact `contact.name()` / `contact.email()` if present.
- Client block, labelled "Client": `client.name()`, `client.company()`, `client.address()`, then contact.
- Totals block: label "Total jours travaillés" + `formatFraction(totalWorkedDays)`.
- Expenses placeholder block: static line "Frais : —" (details out of scope; the ticket only requires the placeholder).
- Provider signature block, labelled "Signature prestataire":
  - `signatures.provider().name()`.
  - `signatures.provider().signedAt()` formatted `dd/MM/yyyy`.
  - If `signatureImageRef` is non-null: draw a framed rectangle (≈120×60pt) with the ref value written inside as a placeholder. Do **not** load the asset from disk — that is T027.
- Client signature block, labelled "Signature client": empty framed rectangle (≈120×60pt) with no text inside, regardless of whether `signatures.client()` is null or populated. This is the "empty client signature area" required by the acceptance criteria.

### Page 2 layout (day details)

Rendered on a second A4 portrait page.

- Column headers: "Jour", "Valeur", "Note".
- One row per entry in `document.page2Days()`, iterated in list order:
  - Jour column: `formatDay(entry.date(), entry.dayOfWeek())`.
  - Valeur column: `formatFraction(entry.workedFraction()) + " " + formatDayType(entry.type())`.
  - Note column: `entry.comment()` or empty string when null.
- Row height and font size chosen so 31 rows + header fit inside A4 minus margins (approximately 18pt row height at 10pt font).

### Tests

- New file `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java` (JUnit 5).
- Build one shared `CraPdfDocument` fixture with:
  - Period `YearMonth.of(2026, 3)`.
  - Provider and client each populated with name, company, address, contact.
  - `totalWorkedDays = new BigDecimal("18.5")`.
  - `page2Days` containing at least one entry of each `CraPdfDayType`, comments set on some and null on others.
  - `signatures.provider()` populated with name, `signedAt`, and a non-null `signatureImageRef`.
  - `signatures.client()` set to `null`.
- Assertions using PDFBox `Loader.loadPDF(bytes)` and `PDFTextStripper`:
  - `generate(document)` returns a non-empty `byte[]`.
  - Loaded document has exactly 2 pages.
  - Page-1 text contains `"03/2026"`, provider name, provider company, client name, client company, the totalWorkedDays value, "Frais", "Signature prestataire", provider signature name, and "Signature client".
  - Page-2 text contains, for every fixture day, the `dd/MM/yyyy` date and any non-null comment.
  - Extra: null-safety — a second test passes a `CraPdfDocument` with a null provider `contact` and an empty `page2Days` list, and asserts the generator still returns a 2-page PDF (page 2 shows only the header row).

### Documentation

- `backend/README.md`: add a short paragraph naming the new PDFBox dependency, pointing at `com.timizerlike.cra.pdf.CraPdfGenerator.generate` as the entry point, and noting that the class is a plain POJO callable from any future controller/service.

## Excluded

- HTTP endpoint or controller exposing the PDF — belongs to T017.
- Frontend download UI — belongs to T024.
- Client signature capture, storage, or validation workflow.
- Loading and embedding the real provider signature image bytes from `signatureImageRef` — belongs to T027; this ticket only renders a labelled placeholder rectangle.
- Expenses line-item computation, aggregation, or rendering beyond the placeholder label.
- Pixel-perfect visual replication of the historical Timizer export — layout must be legible and complete, not identical.
- Email sending or file persistence.
- Any change to `CraPdfDocument` and its sibling records (owned by T015).
- Localisation beyond the French labels currently used by Timizer.
- Introducing Spring beans, dependency injection wiring, or changes to `TimizerBackendApplication` scan paths.
- Bumping Spring Boot, Java, or Maven wrapper versions.

## Acceptance criteria

- `backend/pom.xml` declares an Apache PDFBox 3.x dependency and `./mvnw -f backend/pom.xml -q -DskipTests package` succeeds.
- `com.timizerlike.cra.pdf.CraPdfGenerator` exists with public method `byte[] generate(CraPdfDocument document)` and returns a non-empty byte array for a valid input.
- Loading the returned bytes with PDFBox produces a document with exactly 2 pages.
- Extracted text from page 1 contains: the formatted period (`MM/yyyy`), the provider name and company, the client name and company, the total worked days value, the expenses placeholder label ("Frais"), the provider signature name and date, and a "Signature client" label marking the empty client signature area.
- Extracted text from page 2 contains one line per `CraPdfDayEntry` in `document.page2Days()`, each carrying the formatted date, the work value + day-type label, and the comment when non-null.
- `CraPdfGeneratorTest` passes, including the null-safety case (null client signature, null provider contact, empty day list).
- Existing `CraPdfDocumentTest` still passes.
- `./mvnw -f backend/pom.xml test` is green.
- No changes outside `backend/pom.xml`, `backend/README.md`, `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`, and `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java`.
