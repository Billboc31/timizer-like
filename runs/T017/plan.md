The plan is written to `runs/T017/plan.md`. Here's what it covers:

- **1 new exception** — `CraNotValidatedException` (mirrors existing `CraNotFoundException` pattern, in `com.timizer.backend.cra`)
- **1 new service** — `CraPdfDownloadService`: loads CRA, guards on `VALIDATED` status, maps entity → `CraPdfDocument`, calls `CraPdfGenerator`, returns bytes + filename
- **1 new record** — `CraPdfDownloadResult(byte[] content, String filename)`
- **1 modified class** — `CraPdfGenerator` gains `@Component` for injection
- **1 new controller** — `GET /api/cras/{craId}/pdf` returning `application/pdf` with `Content-Disposition`
- **1 modified handler** — `CraApiExceptionHandler` adds HTTP 422 for `CraNotValidatedException`
- **2 new test classes** — controller (`@WebMvcTest`) + service (Mockito unit)

Key assumption noted in `## Excluded`: no holiday data in the entity, so `workValue == 0.0` on any day maps to `NOT_WORKED`.
