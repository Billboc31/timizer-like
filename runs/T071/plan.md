## Objective

Fix two root-cause defects that prevent the client-signature link from working end to end: (1) `CraSignatureLinkController` derives the link URL from `HttpServletRequest`, producing a container-internal address (`http://backend:8000/sign/TOKEN`) that is unreachable by external recipients; (2) `nginx.conf` does not proxy the `/public/` API prefix to the backend, so the public-signature page's API calls receive `index.html` instead of JSON.

## Included

### Bug 1 — URL generation uses container-internal host
**Root cause:** `CraSignatureLinkController.buildSignatureUrl()` reads `request.getScheme()`, `request.getServerName()`, and `request.getServerPort()`. Behind Docker Compose the scheme/host/port resolved from the request are `http`, `backend`, and `8000` respectively, producing an unreachable internal URL.

**Changes:**

- **`backend/src/main/java/com/timizerlike/cra/config/TimizerProperties.java`** (new file)
  - Spring Boot `@ConfigurationProperties(prefix = "timizer")` record
  - Single field: `String publicFrontendBaseUrl`
  - Annotate application main class with `@EnableConfigurationProperties(TimizerProperties.class)`

- **`backend/src/main/resources/application.yml`**
  - Add `timizer.public-frontend-base-url: http://localhost` (local dev default)

- **`backend/src/test/resources/application.yml`**
  - Add `timizer.public-frontend-base-url: http://localhost` (test default)

- **`backend/.env.example`**
  - Add `TIMIZER_PUBLIC_FRONTEND_BASE_URL=http://localhost`

- **`.env.production.example`**
  - Add `TIMIZER_PUBLIC_FRONTEND_BASE_URL=https://your-domain.example.com` with an explanatory comment

- **`backend/src/main/java/com/timizerlike/backend/cra/web/CraSignatureLinkController.java`**
  - Remove `HttpServletRequest` parameter from `generateLink()`
  - Inject `TimizerProperties` via constructor
  - Replace `buildSignatureUrl(request, rawToken)` with `properties.publicFrontendBaseUrl() + "/sign/" + rawToken`
  - Delete the now-unused `buildSignatureUrl()` static method

---

### Bug 2 — nginx doesn't proxy `/public/` to the backend
**Root cause:** `nginx.conf` only defines `location /api/` and `location /health` as backend proxy targets. Requests to `/public/cra-link/{token}` fall through to the `try_files` SPA fallback, returning `index.html`; the frontend then fails to parse the response as JSON.

**Changes:**

- **`frontend/nginx.conf`**
  - Add before the catch-all `location /` block:
    ```nginx
    location /public/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    ```

---

### Test coverage
- **`backend/src/test/java/com/timizerlike/backend/cra/web/CraSignatureLinkControllerTest.java`**
  - Add `@TestPropertySource(properties = "timizer.public-frontend-base-url=https://timizer.example.com")`
  - Update `postSignatureLinkReturns201WithSignatureUrl` assertion: URL must start with `https://timizer.example.com/sign/` (not `containsString` alone)
  - Add `signatureUrlDoesNotContainContainerInternalHost`: assert URL does not contain `localhost:8080`, `backend:`, or `8000`

- **`backend/src/test/java/com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.java`**
  - Add `generatedLinkUrlHasConfiguredBasePrefix`: creates a CRA, validates, calls `POST /api/cras/{id}/signature-link`, asserts `signatureUrl` starts with the configured test base URL, then calls `GET /public/cra-link/{token}` and asserts 200 — covering the broken-link scenario end to end

## Excluded

- Token URL-encoding/decoding issues (Base64URL without padding already avoids `+`, `/`, `=` in the token; no encoding fix is needed)
- Reverse proxy HTTPS termination or TLS configuration
- Email or sharing mechanism for the link
- Frontend error-page visual design (existing error handling is already mapped by `CraApiExceptionHandler`)
- Docker Compose networking changes beyond nginx.conf
- Any changes to the CRA state machine or PDF generation
- Monitoring or alerting for broken links

## Acceptance criteria

- `CraSignatureLinkController` no longer accepts or reads `HttpServletRequest`; all tests pass without mocking the request.
- `POST /api/cras/{id}/signature-link` with `TIMIZER_PUBLIC_FRONTEND_BASE_URL=https://timizer.example.com` returns `{ "signatureUrl": "https://timizer.example.com/sign/<token>" }`.
- `CraSignatureLinkControllerTest.signatureUrlDoesNotContainContainerInternalHost` passes.
- `CraSignatureWorkflowIntegrationTest.generatedLinkUrlHasConfiguredBasePrefix` passes, confirming: generated URL → extract token → `GET /public/cra-link/{token}` → 200 with CRA data.
- `nginx.conf` contains a `location /public/` block with `proxy_pass http://backend:8000`.
- Direct navigation to `/sign/<token>` in the SPA continues to work (SPA fallback unchanged).
- All existing backend tests remain green.
