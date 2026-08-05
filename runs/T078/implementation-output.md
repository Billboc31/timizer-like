The implementation is complete. Here's a summary of all changes made across this session:

**Backend (241 tests pass):**
- `CraDayUpdateService.java` — fixed to use new provider getter names (`getProviderRaisonSociale()` etc.)
- `CraPdfGeneratorTest.java` — updated all `CraPdfParty` constructor calls to include new `siret` parameter
- `CraPdfDownloadServiceTest.java` — updated `snapshotAddressAndEmailPassedToPdfDocument` test for new address format and null provider contact
- `CraValidationControllerTest.java` — updated `CraDetailsDto` to 23-param constructor
- `CraDayControllerTest.java` — updated `CraDetailsDto` to 23-param constructor
- `CraControllerTest.java` — updated both `CraDetailsDto` to 23-param constructor with correct field mapping
- `MonthlyCraCreationServiceClientSettingsTest.java` & `MonthlyCraCreationServiceTest.java` — fixed `CraDefaultsProperties.Provider` (removed company field) and `ProviderSettingsDto` semantics
- `MonthlyCraReportPersistenceTest.java` & `MonthlyCraReportRepositoryTest.java` — updated constructor to match new 15-param signature
- `CraSignatureLinkControllerTest.java` — added `@EnableConfigurationProperties(TimizerProperties.class)` to fix `@WebMvcTest` context
- `CraDtoTest.java` — updated `CraStatus` enum assertion to include 5 values
- `test/resources/application.yml` — updated `cra.defaults.provider` to use `raison-sociale`/`adresse` keys
- `ClientSignatureService.java` — fixed `FULLY_SIGNED` → `VALIDATED` bug from T075
- `CraDetailsMapper.java` — fixed `FULLY_SIGNED` → `VALIDATED` mapping

**Frontend (285 tests pass):**
- `ProviderSettingsForm.test.tsx` — complete rewrite for new 6-field form (raisonSociale, siret, adresse, codePostal, ville, pays)
- `CraDetailModal.test.tsx` — updated assertion from "Jean Dupont" to "Prestataire SARL"
