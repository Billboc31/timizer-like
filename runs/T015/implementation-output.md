Implementation complete. Here is the summary.

## Summary of changes

Implemented the T015 PDF data model exactly as approved in `runs/T015/plan.md`: a set of immutable Java records under `com.timizerlike.cra.pdf.model` covering page 1 summary, page 2 day-by-day entries, and provider + empty client signature blocks. No existing production files were modified.

## Files created

Main sources (`backend/src/main/java/com/timizerlike/cra/pdf/model/`):
- `package-info.java` — one-line javadoc scoping the package to PDF-rendering data records
- `CraPdfDocument.java` — top-level record: `page1`, `page2Days`, `signatures`
- `CraPdfSummary.java` — `YearMonth period`, `provider`, `client`, `BigDecimal totalWorkedDays`
- `CraPdfParty.java` — `name`, nullable `company`, `address`, nullable `CraPdfContact contact`
- `CraPdfContact.java` — `name`, `email`
- `CraPdfDayEntry.java` — `LocalDate date`, `DayOfWeek dayOfWeek`, `CraPdfDayType type`, `BigDecimal workedFraction`, nullable `String comment`
- `CraPdfDayType.java` — enum `WORKED_FULL`, `WORKED_HALF`, `WEEKEND`, `HOLIDAY`, `NOT_WORKED`
- `CraPdfSignatures.java` — `provider`, `client`
- `CraPdfProviderSignature.java` — `name`, `LocalDate signedAt`, nullable `signatureImageRef`
- `CraPdfClientSignature.java` — all three fields nullable so the MVP can render an unsigned block

Tests (`backend/src/test/java/com/timizerlike/cra/pdf/model/`):
- `CraPdfDocumentTest.java` — four `@Test` methods covering: valid document construction from fixtures, page 1 summary content, page 2 day list with correct dates and worked fractions, and empty client signature (null fields allowed).

## Assumptions made explicit

- Kept the half-day support flagged in the plan's hypothesis (`WORKED_HALF` and `BigDecimal workedFraction` at 0.5), so `totalWorkedDays` is a `BigDecimal` rather than `int` for consistency with 0.5 daily values. If a reviewer decides half-days are strictly out of scope for T015, the enum can be reduced to `WORKED`/`WEEKEND`/`HOLIDAY`/`NOT_WORKED` and `workedFraction` dropped without breaking any acceptance criterion.
- Tests use AssertJ (`org.assertj.core.api.Assertions`), which is included transitively by `spring-boot-starter-test`. This matches the dependency set already present in `backend/pom.xml` on the T026 branch (`com.timizerlike` groupId, Spring Boot 3.2.5).

## Verifications performed

- Confirmed the package structure (`com.timizerlike.cra.pdf.model`) matches the plan and is consistent with existing packages on other ticket branches (`com.timizerlike.cra.model`, `com.timizerlike.cra.service`, `com.timizerlike.cra.config`).
- Confirmed all files live only under the two allowed directories (`backend/src/main/java/com/timizerlike/cra/pdf/model/` and `backend/src/test/java/com/timizerlike/cra/pdf/model/`).
- No changes to `CraMonthlyReport`, `CraDefaultsProperties`, `CraCreationService`, `application.yml`, or `backend/pom.xml`.

## Known limitations

- **`mvn -f backend/pom.xml test` cannot be executed in this branch state.** The `ticket/T015-create-pdf-data-model` branch does not carry the backend bootstrap (no `pom.xml`, no `TimizerLikeApplication`, no other packages), and Java is not installed on the local host either. Compilation and JUnit execution will happen when this ticket is combined with the branches that provide the backend infrastructure (T009 bootstrap + T002/T026 domain layer). The tests are written against the standard Spring Boot test starter (`spring-boot-starter-test`) already present in the T026 branch's `pom.xml`, so no dependency changes are required at merge time.
- The `comment` field on `CraPdfDayEntry` is left nullable (plan permitted either null or empty string) since it is reserved for a later ticket.
