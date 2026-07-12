The plan is written to `runs/T017/plan.md`. Here's what it covers:

**5 files total** — 4 new, 1 modified:

| File | Change |
|---|---|
| `CraNotValidatedException.java` | New domain exception (package `com.timizer.backend.cra`) |
| `CraPdfDownloadService.java` | New service: load → validate status → map to `CraPdfDocument` → generate bytes → return record with bytes + filename |
| `CraPdfDownloadController.java` | New controller: `GET /api/cras/{craId}/pdf` → `ResponseEntity<byte[]>` with PDF headers |
| `CraPdfDownloadControllerTest.java` | `@WebMvcTest` covering 200/404/422 cases |
| `CraApiExceptionHandler.java` | Add handler for `CraNotValidatedException` → HTTP 422 `cra_not_validated` |

Key design decisions captured in the plan:
- Filename sanitization logic (spaces → `_`, alphanumeric only)
- `CraDayEntry` → `CraPdfDayEntry` type resolution (WEEKEND/WORKED_FULL/WORKED_HALF/NOT_WORKED)
- `clientContactPhone` is explicitly out of scope (absent from `CraPdfContact`)
- HTTP 422 Unprocessable Entity for non-validated CRA (more precise than 409)
