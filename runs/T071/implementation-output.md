All changes are implemented. Here's a summary:

---

## Changes made

**Bug 1 — URL generation uses container-internal host**

- **`backend/src/main/java/com/timizerlike/cra/config/TimizerProperties.java`** (new) — `@ConfigurationProperties(prefix = "timizer")` record with `publicFrontendBaseUrl` field. Picked up automatically via `@ConfigurationPropertiesScan` already present on the main class.
- **`backend/src/main/java/com/timizerlike/backend/cra/web/CraSignatureLinkController.java`** — removed `HttpServletRequest`, injected `TimizerProperties`, replaced `buildSignatureUrl()` with `properties.publicFrontendBaseUrl() + "/sign/" + rawToken`, deleted the now-unused static method.
- **`backend/src/main/resources/application.yml`** — added `timizer.public-frontend-base-url: http://localhost`.
- **`backend/src/test/resources/application.yml`** — same default for tests.
- **`backend/.env.example`** — added `TIMIZER_PUBLIC_FRONTEND_BASE_URL=http://localhost`.
- **`.env.production.example`** — added `TIMIZER_PUBLIC_FRONTEND_BASE_URL=https://your-domain.example.com` with explanatory comment.

**Bug 2 — nginx doesn't proxy `/public/` to the backend**

- **`frontend/nginx.conf`** — added `location /public/ { proxy_pass http://backend:8000; ... }` before the SPA catch-all.

**Test coverage**

- **`CraSignatureLinkControllerTest`** — added `@TestPropertySource(properties = "timizer.public-frontend-base-url=https://timizer.example.com")`; updated `postSignatureLinkReturns201WithSignatureUrl` to assert the URL starts with the configured base; added `signatureUrlDoesNotContainContainerInternalHost`.
- **`CraSignatureWorkflowIntegrationTest`** — added `properties = "timizer.public-frontend-base-url=https://timizer.example.com"` to `@SpringBootTest`; added `generatedLinkUrlHasConfiguredBasePrefix` end-to-end test covering: create CRA → validate → generate link → assert URL prefix → extract token → `GET /public/cra-link/{token}` → assert 200 + correct status.
