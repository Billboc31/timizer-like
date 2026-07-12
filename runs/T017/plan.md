`runs/T017/plan.md` has been rewritten as a proper forward-looking implementation plan. It defines 4 new files and 1 modified file:

- **`CraNotValidatedException`** — new domain exception
- **`CraPdfDownloadService`** — fetches CRA, validates status, maps to `CraPdfDocument`, generates bytes, builds sanitized filename
- **`CraPdfDownloadController`** — `GET /api/cras/{craId}/pdf` returning `ResponseEntity<byte[]>`
- **`CraPdfDownloadControllerTest`** — `@WebMvcTest` covering 200/404/422
- **`CraApiExceptionHandler`** — extended with HTTP 422 handler for `CraNotValidatedException`
