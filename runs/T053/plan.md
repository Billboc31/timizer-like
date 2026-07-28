## Objective

Add backend support for a cryptographically secure, time-limited, revocable signature token linked to a single provider-signed CRA, and expose a public read-only frontend route that renders the CRA for client review, without requiring any account or exposing internal identifiers.

## Included

### Backend — new entity

**`CraSignatureToken`** (new JPA entity, table `cra_signature_token`):
- `id` Long (identity)
- `tokenHash` String (SHA-256 of the raw token, unique, not-null) — stored instead of the raw token
- `craId` Long (FK → `monthly_cra_report.id`, not-null)
- `revokedAt` Instant (nullable)
- `createdAt` Instant (set via `@PrePersist`)

No expiry column: the link becomes unusable once the client has signed (status reaches `VALIDATED`), or when explicitly revoked. Token is single-use by design — once the CRA is `VALIDATED` the link is dead.

**`CraSignatureTokenRepository`** — `JpaRepository<CraSignatureToken, Long>` with:
- `findByTokenHash(String hash): Optional<CraSignatureToken>`
- `findByCraId(Long craId): Optional<CraSignatureToken>` (at most one active token per CRA)
- `deleteByCraId(Long craId)` (for revoke/regenerate)

### Backend — service

**`CraSignatureTokenService`**:
- `generateToken(Long craId): String` — asserts CRA status is `SIGNED_BY_PROVIDER`, deletes any existing token for that CRA, generates a 256-bit secure random token via `SecureRandom`, stores its SHA-256 hash, returns the raw token (only time it is available in plain text).
- `resolveToken(String rawToken): CraDetailsDto` — hashes the input, looks up the entity, verifies it is not revoked, verifies CRA status is still `SIGNED_BY_PROVIDER`, returns the public CRA view DTO.
- `revokeToken(Long craId)` — deletes the token row for the given CRA.
- Helper: `sha256(String): String` (hex digest, private).

Raw token must never be logged (use `@SuppressWarnings` or structured log exclusion).

### Backend — DTOs

**`CraPublicViewDto`** (new, package `com.timizerlike.backend.cra.dto`):
- `month`, `year`: int
- `providerFirstName`, `providerLastName`, `providerCompany`: String
- `clientFirstName`, `clientLastName`, `clientCompany`: String
- `clientContactEmail`: String
- `providerSignatureDate`: LocalDate
- `totalWorkedDays`: double
- `dayEntries`: List<`CraDayEntryDto`> (existing DTO)

No `id`, no `status`, no `updatedAt`, no internal foreign keys.

### Backend — controllers

**`CraSignatureLinkController`** (`/api/cras/{craId}/signature-link`, existing auth namespace, POST and DELETE):
- `POST /api/cras/{craId}/signature-link` → generates (or regenerates) token, returns `{ "signatureUrl": "https://…/sign/{rawToken}" }` with HTTP 201. Fails with 409 if CRA is not `SIGNED_BY_PROVIDER`.
- `DELETE /api/cras/{craId}/signature-link` → revokes token, returns 204. Idempotent.

**`PublicCraViewController`** (`/public/cra-link/{token}`, no auth):
- `GET /public/cra-link/{token}` → returns `CraPublicViewDto` (200). Returns structured error JSON (404 with `error: token_invalid`) for all invalid, revoked, or post-signature tokens — no distinction between cases to prevent oracle attacks.

### Backend — exception handling

Extend `CraApiExceptionHandler` (or add `PublicCraApiExceptionHandler` scoped to `/public/**`):
- `TokenNotFoundException` / `TokenRevokedException` / `CraAlreadySignedException` → 404 `token_invalid` (single safe message for all invalid-link cases).
- `CraNotSignedByProviderException` → 409 `cra_not_signed` (for link generation attempt on a non-eligible CRA).

### Backend — tests

**`CraSignatureTokenServiceTest`** (unit, Mockito):
- Token is generated only for `SIGNED_BY_PROVIDER` CRAs.
- Token is rejected for DRAFT / VALIDATED CRAs.
- Revoked token resolves to 404 response.
- Raw token is not present in the stored entity.

**`CraSignatureLinkControllerTest`** (`@WebMvcTest`):
- POST 201 with valid CRA in `SIGNED_BY_PROVIDER`.
- POST 409 for DRAFT CRA.
- DELETE 204 revokes.
- GET `/public/cra-link/{token}` 200 returns `CraPublicViewDto` fields, no `id` or `status`.
- GET `/public/cra-link/{invalid}` 404 with `token_invalid`.
- GET after revoke 404.

### Frontend — public route detection

Add path-based route detection in `main.tsx` (or `App.tsx`) before rendering the normal app:
```
if (window.location.pathname.startsWith('/sign/')) {
  // extract token from path, render <CraSignaturePage token={...} />
} else {
  // render normal App
}
```
No third-party router library needed.

### Frontend — new component

**`CraSignaturePage`** (`src/public/CraSignaturePage.tsx`):
- Calls `GET /public/cra-link/{token}` via `apiGet`.
- Renders: period (month/year), provider name & company, client name & company, provider signature date, total worked days, day-by-day detail table.
- Shows a safe user-facing message for 404 (invalid/expired/revoked/already-used link) — single generic message.
- Loading and error states.
- Read-only; no form inputs.

**`craPublicClient.ts`** (`src/api/craPublicClient.ts`):
- `getPublicCra(token: string): Promise<CraPublicView>` — thin wrapper on `apiGet`.

**Types**: `CraPublicView` in `src/types/craPublicView.ts`.

### Frontend — tests

**`CraSignaturePage.test.tsx`** (Vitest + RTL):
- Renders CRA data on 200 response.
- Renders generic error message on 404.
- Renders loading state.

**`e2e/publicSignature.test.ts`** (Playwright):
- Navigate to `/sign/{valid-token}` → CRA fields visible.
- Navigate to `/sign/invalid-token` → error message visible.

## Excluded

- Client signature capture (form, ink pad, upload) — separate ticket.
- Sending the link by email.
- Client authentication accounts.
- Link expiry by wall-clock time (token is invalidated by CRA status change or explicit revoke).
- PDF generation from the public page.
- Spring Security integration (no global auth added; public endpoint is unauthenticated by design, provider endpoints remain unguarded as today).
- Multi-CRA or batch token generation.
- Audit log of who accessed the link.

## Acceptance criteria

- `POST /api/cras/{id}/signature-link` returns 201 and a `signatureUrl` when the CRA status is `SIGNED_BY_PROVIDER`.
- `POST /api/cras/{id}/signature-link` returns 409 when the CRA is DRAFT or VALIDATED.
- `DELETE /api/cras/{id}/signature-link` returns 204 and subsequent GET on that token returns 404.
- A new `POST` after a revoke returns a new `signatureUrl` (regenerate works).
- `GET /public/cra-link/{token}` returns 200 with `CraPublicViewDto` containing month, year, provider, client, providerSignatureDate, totalWorkedDays, dayEntries — and no `id`, no `status` field.
- `GET /public/cra-link/{invalid|revoked|post-signature token}` returns 404 with `{ "error": "token_invalid" }`.
- The `cra_signature_token` table stores a hash, not the raw token.
- No raw token appears in application logs.
- Navigating to `/sign/{valid-token}` in the browser renders the CRA read-only view.
- Navigating to `/sign/bad` renders a single generic "link invalid" message.
- All backend controller tests pass (`mvn test`).
- All frontend unit tests pass (`pnpm test`).
- Playwright E2E tests for valid and invalid token paths pass.
