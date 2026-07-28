All 208 backend tests pass (207 + 1 new). Here's a summary of what was changed:

---

**BLOQUANT 1 — False positive:** The project uses Hibernate `ddl-auto: update`, not Flyway. No SQL migration files are needed — Hibernate manages the schema from JPA entity annotations automatically.

**BLOQUANT 2 — Fixed:** `IllegalArgumentException` for invalid signature image format now maps correctly to 400 Bad Request.

### Files changed

| File | Change |
|------|--------|
| `com/timizer/backend/cra/InvalidSignatureImageException.java` | **New** — dedicated exception for invalid signature image format |
| `com/timizerlike/cra/service/ClientSignatureService.java` | Throws `InvalidSignatureImageException` instead of `IllegalArgumentException` |
| `com/timizerlike/backend/cra/web/CraApiExceptionHandler.java` | Added `handleInvalidSignatureImage()` → 400 with `"error": "invalid_signature_image"` |
| `ClientSignatureServiceTest.java` | Updated 2 test names + expected exception type to `InvalidSignatureImageException` |
| `PublicCraSigningControllerTest.java` | Added `returns400WhenSignatureImageHasInvalidFormat()` test |

Total: **208 backend tests passing**, no regressions.
