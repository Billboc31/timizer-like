I have all the data I need. Here is the full test report.

---

## Test Report — T053: Secure Public Client-Signature Link for CRA

**Test date:** 2026-07-28  
**Branch:** `ticket/T053-create-a-secure-public-client-signature-link-for-a`

---

### Test execution summary

| Suite | Tests | Result |
|---|---|---|
| Backend (Maven) | 135 | ✅ All pass |
| Frontend unit (Vitest) | 127 | ✅ All pass |
| E2E (Playwright) | 2 (mock-based) | ✅ All pass |

---

### Acceptance criteria

#### AC1 — A provider-signed CRA can generate a non-guessable client-signature link.
**PASS**

`CraSignatureTokenService.generateToken()` uses `SecureRandom.nextBytes(32)` (256 bits of entropy) encoded as Base64 URL-safe. Token is tied to CRA ID. Tests confirm non-blank token is generated and returned in `signatureUrl` (`/sign/{rawToken}`).

---

#### AC2 — The public link exposes only the associated CRA data required for review.
**PASS**

`CraPublicViewDto` is a Java record containing: month, year, provider name/company, client name/company/email, providerSignatureDate, totalWorkedDays, dayEntries. No `id`, `status`, or unrelated fields. Controller test `getPublicCraExposesNoIdOrStatus()` explicitly asserts these are absent.

---

#### AC3 — Draft or unsigned CRAs cannot generate a client link.
**PASS**

`generateToken()` rejects anything other than `SIGNED_BY_PROVIDER` status with a `CraNotSignedByProviderException` (→ HTTP 409). Service tests cover DRAFT and VALIDATED statuses. Additionally, if a CRA's status later changes (e.g., after client validation), `resolveToken()` also rejects the link.

---

#### AC4 — The provider can revoke and regenerate the link.
**FAIL — Security issue**

The revoke/regenerate mechanics work correctly: `DELETE /api/cras/{craId}/signature-link` hard-deletes the token; `POST` deletes any existing token before creating a new one. However, **`spring-boot-starter-security` is absent from `pom.xml`**. There is no `SecurityConfig` class. Both the `POST` and `DELETE` endpoints under `/api/cras/{craId}/signature-link` are completely unauthenticated — any anonymous caller can revoke or regenerate any CRA's signature link. This violates the AC requirement that this capability belongs exclusively to the provider.

---

#### AC5 — Expired, revoked, invalid, and already-used links show a safe user-facing message.
**PASS** *(with a note)*

All invalid-token scenarios return HTTP 404 + `{ "error": "token_invalid" }` from the backend. The frontend displays the generic safe message: *"Ce lien est invalide, expiré ou déjà utilisé."* Tests cover bad token, revoked token, and token-for-no-longer-signed CRA.

Note: There is no time-based expiry (`createdAt` is stored but never checked). The ticket does not require a time limit, so this is acceptable. "Already used" (post-client-signature) is also out of scope per the ticket.

---

#### AC6 — Tokens are not stored or logged in plain text where avoidable.
**PASS**

Tokens are stored as SHA-256 hex (64 chars, field `token_hash`). The raw token is only in the HTTP response body, never persisted. Service test `generateTokenSavesHashNotRawToken()` explicitly asserts the saved entity's hash differs from the raw token and has length 64. No explicit logging statements leak the raw token.

---

#### AC7 — Automated security and integration tests cover valid and invalid link access.
**PARTIAL PASS — Coverage gap**

Unit and controller tests are thorough (8 controller + 11 service tests covering valid, invalid, revoked, draft, and validated scenarios). However, the backend integration test (`CraWorkflowIntegrationTest`) covers only the pre-existing flow (create → update days → validate → history → PDF) and **does not include a single step for the signature link feature** (generate → access public endpoint → revoke → verify invalid access). The E2E Playwright tests mock the backend entirely rather than testing against a running server, so they do not constitute real integration coverage for this feature.

---

### Additional finding — Dead code

`CraSignatureToken.isRevoked()` (`CraSignatureToken.java:66`) checks `revokedAt != null`, but `revokedAt` is never set by any code path (the constructor doesn't set it, no setter exists, and `revokeToken()` hard-deletes the row). The guard at `CraSignatureTokenService.java:68` is therefore unreachable dead code. This is not a functional bug but is misleading — it implies soft-delete revocation was planned but never implemented.

---

### Verdict

| # | Issue | Severity |
|---|---|---|
| 1 | POST/DELETE `/api/cras/{craId}/signature-link` have no authentication — anyone can revoke or regenerate any link | **BLOCKING** |
| 2 | No integration test covers the signature link flow end-to-end against a real backend | Non-blocking |
| 3 | `CraSignatureToken.isRevoked()` is dead code (`revokedAt` is never set; revocation is a hard delete) | Non-blocking |

**RESULT: REFUSED** — AC4 fails due to missing authentication on the management endpoints. The implementation must add authentication (e.g., `spring-boot-starter-security`) before this ticket can be accepted.
