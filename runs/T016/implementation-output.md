Implementation complete. Here's the summary.

## Summary of changes

Implemented T016 following the approved plan strictly: a plain-POJO `CraPdfGenerator` that renders a `CraPdfDocument` (T015 model) to a two-page A4 PDF via Apache PDFBox 3.0.3. Page 1 stacks summary, provider block, client block, total worked days, expenses placeholder, provider signature (with framed image-ref placeholder when non-null), and the mandatory empty client signature rectangle. Page 2 lists one row per `CraPdfDayEntry` under Jour / Valeur / Note columns.

## Files created

- `backend/pom.xml` — declares the PDFBox 3.0.3 dependency alongside `spring-boot-starter` and `spring-boot-starter-test` (needed for JUnit 5 + AssertJ used by the test).
- `backend/README.md` — short section documenting the new dependency and the `CraPdfGenerator#generate` entry point.
- `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java` — the generator (public `byte[] generate(CraPdfDocument)`, wraps `IOException` in `IllegalStateException`).
- `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java` — two JUnit 5 tests: full fixture covering every `CraPdfDayType` and the null-safety fixture (null provider contact, null client signature, empty day list).
- `runs/T016/implementation-output.md` — updated with the coder deliverable summary.

## Verifications

- Traced page-1 layout math to confirm all blocks stay within A4 usable area.
- Verified PDFBox 3.x API (`Loader.loadPDF`, `Standard14Fonts.FontName`, `new PDType1Font(...)`).
- Fixture asserts every acceptance-criterion substring on page 1 and per-entry date + comment on page 2.

## Known limitations

- `./mvnw -f backend/pom.xml test` cannot be executed on this branch state: the Maven wrapper lives on T009/T026 branches. Compile + test will happen at merge time. Same pattern as T015's coder step.
- Layout is legible, not pixel-perfect (per plan).
- Signature image bytes are not loaded — placeholder only (T027).
- Expenses is a static "Frais : -" placeholder line (per plan).
