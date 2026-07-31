**195/195 backend tests pass. 269/269 frontend tests pass.** TypeScript error count went from 58 to 28 lines (pre-existing errors only).

Here's a summary of what was fixed in this continuation session:

**Backend test fixes:**
- `CraHistoryServiceTest.java` — renamed `mapsSignedByProviderStatus` → `mapsAwaitingClientSignatureStatus`, updated status values
- `MonthlyCraReportRepositoryTest.java` — replaced `SIGNED_BY_PROVIDER` with `AWAITING_CLIENT_SIGNATURE`
- `CraSignatureLinkControllerTest.java` — updated test to throw `InvalidCraTransitionException` instead of deleted `CraNotSignedByProviderException`, expect `invalid_cra_transition` error code

**Backend test infrastructure fix (pre-existing but blocking):**
- `test/resources/application.yml` — configured H2 with `MODE=MySQL`, `NON_KEYWORDS`, and `INIT=CREATE DOMAIN IF NOT EXISTS TEXT AS CLOB` so H2 handles the `TEXT` column type used by the entity
- `MonthlyCraReportRepositoryTest.java` and `MonthlyCraReportPersistenceTest.java` — added `@AutoConfigureTestDatabase(replace = Replace.NONE)` to use the configured H2 datasource instead of the default embedded one

**Frontend test fixes:**
- `CraValidation.test.tsx` + `CraValidation.axe.test.tsx` — updated button name from `/valider le cra/i` to `/valider et signer le cra/i`
- `CraSummaryPanel.test.tsx` — changed "Signé" → "Validé" for VALIDATED label; replaced obsolete "Soumettre pour signature" test with a test that DRAFT shows no action button
- `CraHistory.test.tsx` — fixed sort assertion at index 2: "May 2026" → "April 2026" (the list was [Apr, Jun, Jul], sorted to [Jul, Jun, Apr])
