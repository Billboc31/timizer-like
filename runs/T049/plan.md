# Plan — T049: Add editable provider profile settings

## Objective

Add a persistent `ProviderSettings` entity with a read/update REST API and a frontend settings form, so the user can manage provider identity and company information from the application. When a new CRA is created it snapshots the current provider settings, preserving historical validated CRAs even if settings change later.

## Included

### Backend

**New entity — `ProviderSettings` (singleton, always id = 1)**
- Package: `com.timizerlike.backend.provider`
- File: `ProviderSettings.java`
- Fields: `id` (Long, PK), `firstName` (@NotBlank), `lastName` (@NotBlank), `company` (@NotBlank), `address` (nullable), `email` (nullable, @Email if non-null), `phone` (nullable)
- On first access, seeded from existing `CraDefaultsProperties.provider()` values so existing deployments keep their current provider name and company.

**New repository**
- `ProviderSettingsRepository.java` — `JpaRepository<ProviderSettings, Long>`

**New DTO**
- `ProviderSettingsDto.java` — record: `firstName`, `lastName`, `company`, `address`, `email`, `phone`
- Serves both as the GET response and the PUT request body.

**New service — `ProviderSettingsService.java`**
- `getSettings()`: find by id = 1; if absent, create from `CraDefaultsProperties` defaults, save, return dto
- `updateSettings(ProviderSettingsDto)`: validate non-blank required fields, persist, return dto

**New controller — `web/ProviderSettingsController.java`**
- `GET /api/provider-settings` → 200 `ProviderSettingsDto`
- `PUT /api/provider-settings` → 200 `ProviderSettingsDto`; 400 on validation failure

**Modified — `MonthlyCraReport.java`**
(`com.timizer.backend.cra`)
- Add three nullable columns: `providerAddress`, `providerEmail`, `providerPhone`
- Add getters; extend the package-private constructor to accept the three new fields
- Hibernate `ddl-auto: update` applies new nullable columns automatically — no manual migration needed

**Modified — `MonthlyCraCreationService.java`**
(`com.timizer.backend.cra`)
- Inject `ProviderSettingsService`; remove `CraDefaultsProperties` provider dependency (keep client dependency)
- In `buildReport()`: read `ProviderSettingsService.getSettings()`; pass `firstName`, `lastName`, `company`, `address`, `email`, `phone` directly into the updated `MonthlyCraReport` constructor
- Remove the `splitName()` helper call for provider (settings store first and last name separately)

**Modified — `CraPdfDownloadService.java`**
(`com.timizerlike.cra.service`)
- In `toDocument()`: update provider `CraPdfParty` construction from `new CraPdfParty(name, company, null, null)` to `new CraPdfParty(name, company, cra.getProviderAddress(), new CraPdfContact(null, cra.getProviderEmail()))`

**New backend tests**
- `ProviderSettingsServiceTest.java`
  - `getSettings_createsDefaultsOnFirstAccess()`
  - `getSettings_returnsExistingRow()`
  - `updateSettings_persistsAndReturnsDto()`
  - `updateSettings_rejectsBlankFirstName()`
  - `updateSettings_rejectsBlankLastName()`
  - `updateSettings_rejectsBlankCompany()`
- `ProviderSettingsControllerTest.java` (MockMvc)
  - GET returns 200 with all fields
  - PUT with valid body returns 200
  - PUT with blank firstName returns 400

**Modified backend tests**
- `MonthlyCraCreationServiceTest.java` (wherever it exists) — mock `ProviderSettingsService` instead of `CraDefaultsProperties` for provider fields; assert new CRA entity carries the correct `providerAddress`, `providerEmail`, `providerPhone` snapshot values

### Frontend

**Modified — `frontend/src/api/types.ts`**
- Add `ProviderSettingsDto` interface: `firstName: string; lastName: string; company: string; address?: string; email?: string; phone?: string`

**Modified — `frontend/src/api/craClient.ts`**
- Add `getProviderSettings(): Promise<ProviderSettingsDto>`
- Add `updateProviderSettings(data: ProviderSettingsDto): Promise<ProviderSettingsDto>`

**New component — `ProviderSettingsForm`**
- `frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.tsx`
  - Fetches current settings on mount; shows loading indicator during fetch
  - Required fields: First name, Last name, Company — inline validation errors on submit if blank
  - Optional fields: Address, Email, Phone
  - Submit calls `updateProviderSettings`; shows loading state during save, inline success message on success, error banner on failure
  - Cancel button restores form to last-saved values without a network request
- `frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.module.css` — scoped styles for the form

**Modified — `frontend/src/App.tsx`**
- Add `'settings'` to the `View` type
- Add a settings navigation entry reachable from the existing header/nav area
- Render `<ProviderSettingsForm>` when the active view is `'settings'`

**New frontend tests**
- `frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.test.tsx`
  - Renders form pre-filled with values returned by `getProviderSettings`
  - Shows loading indicator while fetching initial data
  - Displays required-field error messages on submit with blank firstName / lastName / company
  - Calls `updateProviderSettings` with form values on valid submit
  - Shows loading state during save
  - Shows success message after successful save
  - Shows error banner when `updateProviderSettings` rejects
  - Cancel restores original values without calling the API

**Modified frontend tests**
- `frontend/src/api/__tests__/craClient.test.ts` — add coverage for `getProviderSettings` and `updateProviderSettings` (happy path + network error)

## Excluded

- Client settings (client name, company, address, contact information — separate ticket)
- Multiple provider accounts, authentication, role management, legal company verification
- Phone field in PDF output — `CraPdfContact` currently holds `name` and `email` only; extending the PDF model for phone is out of scope
- `CraCreationService` in `com.timizerlike.cra.service` — appears to be unused dead code alongside the real `MonthlyCraCreationService`; no changes required
- Flyway / Liquibase database migrations — project uses Hibernate `ddl-auto: update` and that remains unchanged
- Provider signature image management

## Acceptance criteria

- `GET /api/provider-settings` returns 200 with provider fields; on a fresh database the values match the existing `CraDefaultsProperties` defaults
- `PUT /api/provider-settings` with a valid body returns 200 and the updated values persist after a full backend restart
- `PUT /api/provider-settings` with a blank `firstName`, `lastName`, or `company` returns 400
- A new CRA created after updating settings carries the updated values in its `providerFirstName`, `providerLastName`, `providerCompany`, `providerAddress`, `providerEmail`, `providerPhone` columns
- A CRA created before settings were changed retains its original provider snapshot — asserted by a test that updates settings, creates a new CRA, and verifies the old CRA entity is unchanged
- `GET /api/cras/{id}/pdf` for a VALIDATED CRA renders the provider name, company, address, and email from the per-CRA snapshot, not from the current settings; previously null address and email now appear in the PDF when set
- The frontend settings screen is reachable from the main navigation; the form loads current values, validates required fields on submit, shows save/loading/success/error states
- All new and modified tests pass: `ProviderSettingsServiceTest`, `ProviderSettingsControllerTest`, `MonthlyCraCreationServiceTest`, `ProviderSettingsForm.test.tsx`, `craClient.test.ts`
