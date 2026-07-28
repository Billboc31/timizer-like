All tests pass. Here's the complete summary of what was implemented:

---

## Implementation Summary

### Backend — New Files

| File | Purpose |
|------|---------|
| `com/timizer/backend/cra/CraSignatureToken.java` | JPA entity storing `tokenHash` (SHA-256), `craId`, `revokedAt`, `createdAt` — never stores the raw token |
| `com/timizer/backend/cra/CraSignatureTokenRepository.java` | JPA repository with `findByTokenHash`, `findByCraId`, `deleteByCraId` |
| `com/timizer/backend/cra/CraNotSignedByProviderException.java` | Thrown when generating a link for a non-`SIGNED_BY_PROVIDER` CRA |
| `com/timizer/backend/cra/TokenNotFoundException.java` | Thrown for invalid/revoked/post-signature tokens (single type to prevent oracle attacks) |
| `com/timizerlike/backend/cra/dto/CraPublicViewDto.java` | Public DTO with no `id`, no `status` |
| `com/timizerlike/cra/service/CraSignatureTokenService.java` | 256-bit `SecureRandom` token, SHA-256 hashing, generate/resolve/revoke logic |
| `com/timizerlike/backend/cra/web/CraSignatureLinkController.java` | `POST /api/cras/{id}/signature-link` → 201, `DELETE` → 204 |
| `com/timizerlike/backend/cra/web/PublicCraViewController.java` | `GET /public/cra-link/{token}` → 200 or 404 |

### Backend — Modified Files

- `CraApiExceptionHandler.java` — added `TokenNotFoundException` → 404 `token_invalid`, `CraNotSignedByProviderException` → 409 `cra_not_signed`
- `CraControllerTest.java` — fixed pre-existing constructor arity bug (8 args → 14)

### Backend Tests

- `CraSignatureTokenServiceTest.java` — 12 unit tests (Mockito)
- `CraSignatureLinkControllerTest.java` — 8 `@WebMvcTest` tests covering POST/DELETE/GET

**Result: 135 backend tests pass**

### Frontend — New Files

| File | Purpose |
|------|---------|
| `src/types/craPublicView.ts` | `CraPublicView` TypeScript interface |
| `src/api/craPublicClient.ts` | `getPublicCra(token)` thin wrapper on `apiGet` |
| `src/public/CraSignaturePage.tsx` | Read-only CRA view with loading/error states |
| `src/public/CraSignaturePage.test.tsx` | 6 Vitest+RTL tests |
| `e2e/publicSignature.spec.ts` | 2 Playwright E2E tests (mocked) |

### Frontend — Modified Files

- `src/main.tsx` — path-based routing: `/sign/{token}` → `<CraSignaturePage>`, else `<App>`
- `src/api/apiError.ts` — added `token_invalid` to `ApiErrorCode`
- `src/api/httpClient.ts` — added `token_invalid` to known error codes
- `CraHistory.axe.test.tsx` / `CraMonthSelector.axe.test.tsx` — fixed pre-existing broken import (`api/cra` → `api/craClient`)

**Result: 127 frontend tests pass**
