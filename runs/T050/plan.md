## Objective
Add a persistent `ClientSettings` singleton (backend entity + REST API) and a frontend settings form so users can view and edit client organisation and contact details. New CRAs copy the current settings at creation time; already-validated CRAs keep their captured values unchanged.

## Included

### Backend — new `settings` package (`com.timizerlike.backend.settings`)

- **`ClientSettings.java`** — JPA entity, singleton (id = 1), fields: `clientCompany` (NOT NULL), `clientAddress` (NOT NULL), `contactFullName` (NOT NULL), `contactRole` (NOT NULL), `contactEmail` (NOT NULL, `@Email`). Seeded from `CraDefaultsProperties` on first access if the row does not exist.
- **`ClientSettingsRepository.java`** — `JpaRepository<ClientSettings, Long>`.
- **`ClientSettingsDto.java`** — request/response record mirroring the five fields with Bean Validation annotations.
- **`ClientSettingsService.java`** — `get()` (seed if absent), `update(dto)` (validate, save, return updated dto).
- **`ClientSettingsController.java`** — `GET /api/settings/client` and `PUT /api/settings/client` (returns 200 with body).

### Backend — `MonthlyCraReport` model extension

- Add `client_address` (String, nullable for existing rows) and `client_contact_role` (String, nullable for existing rows) columns to `MonthlyCraReport`. Hibernate `ddl-auto: update` will apply the new columns on startup; no manual migration script needed for SQLite.
- Update `CraDetailsDto` to expose `clientAddress` and `clientContactRole`.

### Backend — CRA creation wiring

- **`MonthlyCraCreationService.java`** — replace reads from `CraDefaultsProperties` for client fields with `ClientSettingsService.get()`. Map `contactFullName` → split into `clientFirstName` / `clientLastName` (reuse the existing `splitName()` helper). Populate the two new CRA fields (`clientAddress`, `clientContactRole`) from settings.

### Backend — tests

- `ClientSettingsControllerTest` (Spring MVC or `@SpringBootTest`): GET returns defaults on first call; PUT persists; PUT with invalid email returns 400; PUT with blank required field returns 400.
- `MonthlyCraCreationServiceTest`: creating a CRA after `PUT /api/settings/client` uses the updated values; a previously created and validated CRA retains original client fields when settings are changed afterwards.

### Frontend

- **`src/api/clientSettingsClient.ts`** — `getClientSettings(): Promise<ClientSettingsDto>` and `updateClientSettings(dto): Promise<ClientSettingsDto>` hitting the new endpoints.
- **`src/types/settings.ts`** — `ClientSettingsDto` TypeScript interface (five fields).
- **`src/components/ClientSettingsForm/ClientSettingsForm.tsx`** + **`ClientSettingsForm.css`** — controlled form with fields for all five settings; client-side required + email-format validation; save button; success/error feedback.
- **`src/App.tsx`** — add `'settings'` to the `view` union type; load settings on mount for the form; add a settings link in `AppShell` header to switch to the settings view.
- **Frontend test** (`ClientSettingsForm.test.tsx`): renders pre-loaded values; blocks save on blank required field; blocks save on invalid email; calls `updateClientSettings` with correct payload on valid submit.

## Excluded

- Managing multiple clients or missions.
- CRM or external contact import.
- Updating provider (consultant) settings — only client/contact side.
- Rendering `clientAddress` or `clientContactRole` in the PDF (PDF layout changes are a separate ticket).
- Retroactively updating existing CRA rows when settings change.

## Acceptance criteria

- `GET /api/settings/client` returns the five client fields; on first call after a clean DB, values are seeded from `CraDefaultsProperties` (not empty/null).
- `PUT /api/settings/client` with valid payload returns 200 and persists; confirmed by a subsequent GET after application restart.
- `PUT /api/settings/client` with a missing required field or invalid email returns 400.
- Creating a new CRA after a `PUT` produces a CRA whose `clientCompany`, `clientAddress`, `clientFirstName`/`clientLastName`, `clientContactRole`, and `clientContactEmail` match the updated settings.
- A CRA that was created before a settings change (and validated) still returns its original client fields via `GET /api/cras/{id}` after the settings are updated.
- The settings form in the UI pre-fills with current values; saving triggers `PUT` and shows confirmation; saving with a blank required field or malformed email shows an inline error without calling the API.
- All new backend tests pass (`mvn test`); all new frontend tests pass (`npm test`).
