All done. Here's what was changed:

---

## Files created

**Backend — new package `com.timizerlike.backend.provider`**

- `backend/src/main/java/com/timizerlike/backend/provider/ProviderSettings.java`
  — JPA entity, singleton id=1; fields: firstName, lastName, company (@NotBlank), address, email (@Email), phone (nullable)

- `backend/src/main/java/com/timizerlike/backend/provider/ProviderSettingsRepository.java`
  — `JpaRepository<ProviderSettings, Long>`

- `backend/src/main/java/com/timizerlike/backend/provider/ProviderSettingsDto.java`
  — Record DTO (GET response / PUT request body): firstName, lastName, company, address, email, phone

- `backend/src/main/java/com/timizerlike/backend/provider/ProviderSettingsService.java`
  — `getSettings()` seeds from `CraDefaultsProperties` on first access; `updateSettings(dto)` validates and persists

- `backend/src/main/java/com/timizerlike/backend/provider/web/ProviderSettingsController.java`
  — `GET /api/provider-settings` → 200; `PUT /api/provider-settings` → 200 / 400 on validation failure

- `backend/src/test/java/com/timizerlike/backend/provider/ProviderSettingsServiceTest.java`
  — 6 tests: seed on first access, return existing row, persist/return on update, reject blank firstName/lastName/company

- `backend/src/test/java/com/timizerlike/backend/provider/ProviderSettingsControllerTest.java`
  — 3 tests: GET 200, PUT 200, PUT 400 on blank firstName

**Frontend — new component `ProviderSettingsForm`**

- `frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.tsx`
  — Fetches on mount, validates required fields on submit, handles loading/saving/success/error states, cancel restores previous values

- `frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.css`
  — BEM classes using project CSS tokens

- `frontend/src/components/ProviderSettingsForm/ProviderSettingsForm.test.tsx`
  — 8 tests: loading indicator, pre-filled form, required-field errors, save call, saving state, success message, error banner, cancel

---

## Files modified

**Backend**

- `backend/src/main/java/com/timizerlike/cra/TimizerLikeApplication.java`
  — Extended `@EntityScan` and `@EnableJpaRepositories` to include `com.timizerlike.backend.provider`

- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`
  — Added 3 nullable snapshot fields: `providerAddress`, `providerEmail`, `providerPhone` (columns + getters); constructor extended from 10 to 13 params

- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraCreationService.java`
  — Injected `ProviderSettingsService`; `buildReport()` now snapshots current provider settings (address, email, phone) at CRA creation time

- `backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java`
  — Provider party now uses snapshotted `providerAddress` and `providerEmail` from the CRA record

- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraCreationServiceTest.java`
  — Updated for `ProviderSettingsService` dependency; constructor/PROVIDER_SETTINGS constant added

- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportPersistenceTest.java`
  — Constructor calls updated from 10 to 13 params

- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java`
  — Constructor calls updated from 10 to 13 params

- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportTest.java`
  — Constructor calls updated from 10 to 13 params (3 call sites)

- `backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java`
  — Fixed pre-existing compile error: `CraDetailsDto` called with 8 args instead of 14

**Frontend**

- `frontend/src/api/types.ts`
  — Added `ProviderSettingsDto` interface

- `frontend/src/api/httpClient.ts`
  — Added `apiPut<T>` function (PUT method, same pattern as `apiPost`)

- `frontend/src/api/craClient.ts`
  — Added `getProviderSettings()` and `updateProviderSettings()` exports

- `frontend/src/api/__tests__/craClient.test.ts`
  — Added 4 tests for `getProviderSettings` and `updateProviderSettings`

- `frontend/src/components/AppShell/AppShell.tsx`
  — Exported `AppView` type; added `settings` view with nav button and page title

- `frontend/src/App.tsx`
  — Replaced local `View` type with imported `AppView`; renders `<ProviderSettingsForm />` for the settings view

---

## Verifications

- Backend: 125 tests, BUILD SUCCESS (9 new tests in provider package + 1 pre-existing fix)
- Frontend: 132 tests pass across 13 test files (8 new ProviderSettingsForm tests + 4 new craClient tests)
- 2 pre-existing failures unrelated to T049: `CraHistory.axe.test.tsx` and `CraMonthSelector.axe.test.tsx` import `../../api/cra` which does not exist — confirmed pre-existing (failures reproduced on stashed branch)

---

## Known limits

- Provider settings are a singleton (id=1). No multi-tenant support — out of scope.
- `ProviderSettings` table is created by Hibernate `ddl-auto:update` on first boot; no migration script.
- PDF generation uses snapshotted address/email from the CRA record, but `providerPhone` is not yet rendered in the PDF (no PDF field for it in existing layout).
