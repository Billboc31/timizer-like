# Plan — T078: Replace provider profile fields and include them in CRA PDFs

## Objective

Replace the current provider identity model (firstName, lastName, company, email, phone) with six legal company fields (raisonSociale, SIRET, adresse, codePostal, ville, pays), expose them as editable inputs in Settings, snapshot them in new CRA records, and render them in generated CRA PDFs.

## Included

### Backend — ProviderSettings entity & DTO

**`backend/src/main/java/com/timizerlike/backend/provider/ProviderSettings.java`**
- Remove fields: `firstName`, `lastName`, `email`, `phone`.
- Add fields: `raisonSociale` (`@NotBlank`, `@Column(name="raison_sociale")`), `siret` (`@Pattern(regexp="\\d{14}")`, nullable), `adresse` (nullable), `codePostal` (nullable), `ville` (nullable), `pays` (nullable).
- All new columns: `nullable=true` in `@Column` to allow Hibernate `ddl-auto: update` to add them to the existing SQLite table without error.

**`backend/src/main/java/com/timizerlike/backend/provider/ProviderSettingsDto.java`**
- Replace the record fields to mirror the new entity: `raisonSociale` (required String), `siret`, `adresse`, `codePostal`, `ville`, `pays` (all `String`, nullable).

**`backend/src/main/java/com/timizerlike/backend/provider/ProviderSettingsService.java`**
- Update `getSettings()` default seeding to use `raisonSociale`, `adresse`; remove references to `firstName`/`lastName`/`email`/`phone`.
- Update `updateSettings()` mapping to use new fields.

### Backend — Application defaults

**`backend/src/main/java/com/timizerlike/cra/config/CraDefaultsProperties.java`**
- Update inner `Provider` record: replace `name`, `company`, `address` with `raisonSociale`, `adresse` (other new fields default to null and need no config key).

**`backend/src/main/resources/application.yml`**
- Under `cra.defaults.provider`: remove `name`, replace `company` → `raisonSociale`, rename `address` → `adresse`.

### Backend — CRA snapshot (MonthlyCraReport)

**`backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`**
- Remove mapped fields: `providerFirstName`, `providerLastName`, `providerEmail`, `providerPhone`. Drop their `@Column` and `@NotBlank`/`@Email` annotations. The underlying DB columns remain (SQLite does not drop columns on schema update — this is safe).
- Add new fields: `providerRaisonSociale` (`provider_raison_sociale`, nullable=true), `providerSiret` (`provider_siret`), `providerAdresse` (`provider_adresse`), `providerCodePostal` (`provider_code_postal`), `providerVille` (`provider_ville`), `providerPays` (`provider_pays`). All nullable in `@Column` for migration safety (existing rows will have NULL; new CRAs will populate them).
- Keep `providerCompany`, `providerAddress` columns unmapped (or remove mapping) — no active reference in code.
- Keep `providerSignerName`, `providerSignatureImage`, `providerSignedAt`, `providerSignatureDate` unchanged (set by the signing flow, unrelated to ProviderSettings fields).

**`backend/src/main/java/com/timizer/backend/cra/MonthlyCraCreationService.java`**
- In `buildReport()`: replace old field mapping (firstName+lastName→providerFirstName/LastName, email, phone) with new field mapping (raisonSociale→providerRaisonSociale, siret, adresse, codePostal, ville, pays).

### Backend — PDF document model & generation

**`backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfParty.java`**
- Add `siret` field (String, nullable) to the record: `CraPdfParty(String name, String siret, String company, String address, CraPdfContact contact)`. The client party passes `null` for siret; only the provider party uses it.

**`backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java`**
- In `toDocument()`, update provider party construction:
  - `name` = `providerRaisonSociale`
  - `siret` = `providerSiret`
  - `company` = `null` (raison sociale is already in name)
  - `address` = formatted string: `providerAdresse` + `, ` + `providerCodePostal` + ` ` + `providerVille` + `, ` + `providerPays` (skip null parts gracefully)
  - `contact` = `null` (email/phone removed)
- Update client party construction to pass `siret = null` to match new record signature.

**`backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`**
- Update provider identity/header block rendering:
  - Render `name` (raisonSociale) as the primary label.
  - If `siret` is non-null, render a labeled line: `"SIRET : " + siret`.
  - Render `address` as-is (already a formatted multi-part string); use text wrapping to stay within A4 column bounds.
  - Remove rendering of `company` and `contact` for the provider block.
- Ensure text wrapping is applied so long raisonSociale or address values do not overflow the A4 layout.

### Frontend — TypeScript types

**`frontend/src/api/types.ts`**
- `ProviderSettingsDto`: replace `firstName`, `lastName`, `email`, `phone` with `raisonSociale: string`, `siret?: string | null`, `adresse?: string | null`, `codePostal?: string | null`, `ville?: string | null`, `pays?: string | null`.
- `CraDetailsDto`: replace `providerFirstName`, `providerLastName`, `providerCompany` with `providerRaisonSociale`, `providerSiret`, `providerAdresse`, `providerCodePostal`, `providerVille`, `providerPays` (all optional/nullable). Keep `providerSignatureDate`, `providerSignatureImage`, `providerSignerName`.

### Frontend — Settings form

**`frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.tsx`**
- Replace inputs for firstName, lastName, company, email, phone with: raisonSociale (required), siret, adresse, codePostal, ville, pays.
- Validation: raisonSociale is required; siret, if provided, must match `/^\d{14}$/`; codePostal has no strict format constraint (non-French addresses supported).
- Update form state initialisation from loaded settings; update cancel/reset logic.

**`frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.css`**
- Adjust layout if needed to accommodate 6 fields cleanly.

### Frontend — CRA display components

- Grep for `providerFirstName`, `providerLastName`, `providerCompany` across `frontend/src/`. Update every rendering site to use the new field names (`providerRaisonSociale`, etc.). Obsolete fields must not appear in any UI.

## Excluded

- Any change to the client identity model (clientFirstName, clientLastName, clientCompany, clientContactEmail, etc.).
- Signing flow changes: providerSignerName, providerSignatureImage, providerSignedAt remain unchanged.
- Explicit SQL migration scripts: Hibernate `ddl-auto: update` handles column additions; old DB columns are left unmapped but not deleted.
- Changes to any CRA workflow (status transitions, validation, history).
- PDF layout redesign beyond adapting the provider identity block to new fields.
- i18n or label internationalisation beyond using French field names already conventional in the domain.
- Country-specific postal code format validation.

## Acceptance criteria

- The Settings form shows exactly six provider fields (raison sociale, SIRET, adresse, code postal, ville, pays) and no longer shows firstName, lastName, email, or phone.
- Raison sociale is required; submitting without it shows a validation error.
- SIRET, if entered, is rejected unless it is exactly 14 digits.
- Saved values are restored correctly when the Settings page is reopened after a page refresh.
- The application starts without error on an existing database (no startup exception from missing or incompatible columns).
- New CRAs created after migration carry the new provider fields in their snapshot.
- Generated CRA PDFs display raison sociale, SIRET (if set), and the full address; they do not display firstName, lastName, email, or phone.
- The PDF remains correctly laid out (no text overflow beyond A4 margins) when raison sociale or address values are long.
- When any of the optional address fields (adresse, codePostal, ville, pays) are missing, the PDF address line omits the missing parts without showing stray separators.
- No component in the frontend references or renders `providerFirstName`, `providerLastName`, or `providerCompany`.
