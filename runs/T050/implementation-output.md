Implementation is complete. Here's a summary of what was done:

---

## Changes Summary

### Backend — New files

| File | Purpose |
|---|---|
| `com/timizerlike/backend/settings/ClientSettings.java` | JPA entity (singleton id=1), 5 fields |
| `ClientSettingsRepository.java` | `JpaRepository<ClientSettings, Long>` |
| `ClientSettingsDto.java` | Record with `@NotBlank` / `@Email` validation |
| `ClientSettingsService.java` | `get()` (seeds from YAML on first access), `update()` |
| `ClientSettingsController.java` | `GET /api/settings/client`, `PUT /api/settings/client` |
| `ClientSettingsControllerTest.java` | 4 tests: GET returns seeded values; PUT persists; invalid email → 400; blank field → 400 |
| `MonthlyCraCreationServiceClientSettingsTest.java` | New CRA uses current settings; snapshot preserved after settings change |

### Backend — Modified files

| File | Change |
|---|---|
| `TimizerLikeApplication.java` | Extended `@EntityScan` and `@EnableJpaRepositories` to include settings package |
| `MonthlyCraReport.java` | Added nullable `clientAddress` and `clientContactRole` columns + constructor args + getters/setters |
| `CraDetailsDto.java` | Added `clientAddress` and `clientContactRole` fields |
| `CraDetailsMapper.java` | Maps new fields from entity to DTO |
| `CraDayUpdateService.java` | Maps new fields in `buildDto()` |
| `MonthlyCraCreationService.java` | Now uses `ClientSettingsService.get()` for all client fields; `CraDefaultsProperties` retained for provider fields only |
| 7 broken test files | Fixed stale 8-arg and 10-arg `MonthlyCraReport`/`CraDetailsDto` constructors |

### Frontend — New files

| File | Purpose |
|---|---|
| `src/types/settings.ts` | `ClientSettingsDto` interface |
| `src/api/settingsClient.ts` | `getClientSettings()` / `updateClientSettings()` |
| `src/components/ClientSettingsForm/ClientSettingsForm.tsx` | Controlled form with client-side required + email validation |
| `ClientSettingsForm.css` | Form styles |
| `ClientSettingsForm.test.tsx` | 4 tests: pre-fills values; blocks blank save; blocks invalid email; valid submit calls API |

### Frontend — Modified files

| File | Change |
|---|---|
| `src/api/httpClient.ts` | Added `apiPut<T>()` |
| `src/components/AppShell/AppShell.tsx` | Added `'settings'` to view type; "Settings" nav button |
| `src/App.tsx` | Settings view renders `ClientSettingsForm`; loads settings on first visit |

**Test results:** 122/122 backend tests pass; 4/4 new frontend tests pass (2 pre-existing failures from unrelated broken imports remain).
