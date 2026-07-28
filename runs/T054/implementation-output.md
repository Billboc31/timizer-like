All 208 tests pass. Here's a summary of every change made:

---

### Files modified

**BLOQUANT 1 — Wrong final status**

- **`ClientSignatureService.java:65`** — `ValidationStatus.VALIDATED` → `ValidationStatus.FULLY_SIGNED`
- **`ClientSignatureServiceTest.java`** — updated test name and `verify()` call to `FULLY_SIGNED`

**BLOQUANT 2 — Error code mismatch**

- **`frontend/src/api/apiError.ts`** — removed dead codes `signature_too_large` and `signature_invalid_format`; added `invalid_signature_image` (matches what the backend emits)
- **`frontend/src/api/httpClient.ts`** — same replacement in the `known` array

**BLOQUANT 3 — Truncated integration test** (+ prerequisite fixes)

- **`CraSignatureTokenService.java`** — `resolveToken` and `validateAndConsume` now check for `AWAITING_CLIENT_SIGNATURE` instead of `SIGNED_BY_PROVIDER` — required because `sendToClient` transitions the CRA before the client signs; without this fix the integration test would always get 410 at the signing step
- **`CraSignatureTokenServiceTest.java`** — added `awaitingClientSignatureCra()` helper; updated `resolveTokenReturnsCraPublicViewForValidToken` to use it
- **`CraSignatureWorkflowIntegrationTest.java`** — added step 4a (token generation while SIGNED_BY_PROVIDER), then step 5 (client signs → 200 OK), status assertion (FULLY_SIGNED via `GET /api/cras`), and step 6 (re-sign → 410 GONE with `token_already_consumed`)
