## Objective

Introduce a dedicated backend PDF data model that represents everything required to render a CRA PDF (page 1 summary, page 2 day-by-day details, provider signature, empty client signature) without depending on persistence entities. No rendering, endpoint or UI is produced by this ticket.

## Included

- New Java package `com.timizerlike.cra.pdf.model` under `backend/src/main/java/com/timizerlike/cra/pdf/model/`.
- New immutable `record CraPdfDocument` containing the two-page structure:
  - `CraPdfSummary page1` (page 1 summary block).
  - `List<CraPdfDayEntry> page2Days` (page 2 day-by-day details).
  - `CraPdfSignatures signatures` (provider + reserved client signature block).
- New `record CraPdfSummary` with the page 1 fields:
  - `YearMonth period`.
  - `CraPdfParty provider` (identity + company + address).
  - `CraPdfParty client` (identity + address + contact).
  - `int totalWorkedDays` (aggregate for the period, expressed in whole days; may be a `BigDecimal totalWorkedDays` if the coder judges half-days are already in scope — see hypothesis below).
- New `record CraPdfParty` with:
  - `String name`.
  - `String company` (nullable for client).
  - `String address`.
  - `CraPdfContact contact` (nullable for provider).
- New `record CraPdfContact` with `String name` and `String email`.
- New `record CraPdfDayEntry` for page 2, one per calendar day of the period:
  - `LocalDate date`.
  - `DayOfWeek dayOfWeek`.
  - `CraPdfDayType type` (enum: `WORKED_FULL`, `WORKED_HALF`, `WEEKEND`, `HOLIDAY`, `NOT_WORKED`) — semantics only, no persistence coupling.
  - `BigDecimal workedFraction` (0, 0.5, 1) so the renderer can display the daily value directly.
  - `String comment` (nullable, reserved for later; empty string acceptable if the coder prefers non-null strings).
- New `record CraPdfSignatures` with:
  - `CraPdfProviderSignature provider` (name, signedAt as `LocalDate`, optional `String signatureImageRef` — nullable, resolves to the asset reference already discussed for T027 but only as a plain string here).
  - `CraPdfClientSignature client` — reserved empty block: `String clientRepresentativeName` (nullable/empty), `LocalDate signedAt` (nullable), `String signatureImageRef` (nullable). All fields must accept null values so the MVP can render an empty signature area.
- New unit test class `backend/src/test/java/com/timizerlike/cra/pdf/model/CraPdfDocumentTest.java` covering:
  - Constructing a valid `CraPdfDocument` from representative fixtures.
  - Verifying page 1 summary carries period, provider, client, and total worked days.
  - Verifying page 2 exposes the expected list of `CraPdfDayEntry` with correct dates and `workedFraction` values.
  - Verifying `CraPdfSignatures` accepts null client fields (empty client signature block).
- No changes to `CraMonthlyReport`, `CraDefaultsProperties`, `CraCreationService`, `application.yml`, or any other production class. The new model lives side by side with the existing entities.
- Package-info file `backend/src/main/java/com/timizerlike/cra/pdf/model/package-info.java` with a one-line javadoc stating the package hosts PDF-rendering data records only.

Hypothesis to make explicit in the code review: half-day support (`workedFraction = 0.5`) is included because the ticket says "day-by-day work details" and the product scope already mentions half-days elsewhere. If a Coder concludes half-days are strictly out of scope for T015, `workedFraction` may be dropped and `type` reduced to `WORKED`, `WEEKEND`, `HOLIDAY`, `NOT_WORKED`; the shape of the model must still cover the five acceptance criteria.

## Excluded

- Any PDF rendering logic (no PDFBox/iText/OpenPDF integration, no template).
- Any REST endpoint or controller for downloading the PDF (T017).
- Any frontend change or download button (T024).
- Client signature capture flow (fields are reserved as empty placeholders only).
- Expenses / réintégration frais.
- Persistence changes: no JPA entity, no repository, no migration.
- Mapping code from `CraMonthlyReport` (or future `CraDayEntry`) into `CraPdfDocument` — the mapper belongs to T016.
- Configuration additions in `application.yml` or `CraDefaultsProperties`.
- Provider signature asset storage (T027).

## Acceptance criteria

- The package `com.timizerlike.cra.pdf.model` exists under `backend/src/main/java/`.
- A top-level type `CraPdfDocument` exists and aggregates a summary block, a day-by-day list, and a signature block.
- Page 1 summary contains, at minimum: period, provider identity, provider company, provider address, client identity, client address, client contact, and total worked days.
- Page 2 details contain a list where each entry carries a date, a day-of-week or equivalent, a day type, and the worked fraction (or an equivalent day-level indicator).
- Provider signature block exposes provider name, signature date, and an optional signature image reference field.
- Client signature block exists and its fields (name, date, image reference) all accept null/empty values so the MVP can render an unsigned area.
- The new unit test `CraPdfDocumentTest` passes with `mvn -f backend/pom.xml test`.
- Running `mvn -f backend/pom.xml test` still executes the existing tests (`CraCreationServiceTest`, `CraCreationServiceOverrideIT`, `CraCreationServiceSpringIT`) and they all pass — no existing production class was modified.
- No new dependency is added to `backend/pom.xml`.
- No file is created outside `backend/src/main/java/com/timizerlike/cra/pdf/model/` and `backend/src/test/java/com/timizerlike/cra/pdf/model/`.
