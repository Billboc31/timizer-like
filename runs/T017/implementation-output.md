All 107 tests pass and the commit is in. Here's a summary of what was implemented:

---

## Changes — T017 CRA PDF Download API

### New files

| File | Purpose |
|------|---------|
| `com.timizer.backend.cra.CraNotValidatedException` | Exception thrown when a non-validated CRA is requested for download |
| `com.timizerlike.cra.service.CraPdfDownloadResult` | Record holding `byte[] content` + `String filename` |
| `com.timizerlike.cra.service.CraPdfDownloadService` | Loads CRA, guards on `VALIDATED` status, maps entity → `CraPdfDocument`, generates PDF bytes, builds filename |
| `com.timizerlike.backend.cra.web.CraPdfDownloadController` | `GET /api/cras/{craId}/pdf` — returns `application/pdf` with `Content-Disposition` header |
| `CraPdfDownloadControllerTest` | `@WebMvcTest` covering 200/404/422 cases |
| `CraPdfDownloadServiceTest` | Mockito unit tests covering not-found, not-validated, bytes, filename |

### Modified files

| File | Change |
|------|--------|
| `CraPdfGenerator` | Added `@Component` for Spring injection |
| `CraApiExceptionHandler` | Added HTTP 422 handler for `CraNotValidatedException` |

### Key design decisions
- Filename format: `CRA-{providerCompany}-{clientCompany}-{yyyy-MM}.pdf` (special chars replaced with `_`)
- Non-validated CRA → HTTP 422 Unprocessable Entity (distinct from 404 not-found and 409 conflict)
- Day type mapping: `1.0` → WORKED_FULL, `0.5` → WORKED_HALF, weekend + `0.0` → WEEKEND, weekday + `0.0` → NOT_WORKED (no holiday data in entity, per plan assumption)
