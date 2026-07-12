The plan has been written to `runs/T017/plan.md`. It covers:

- **1 new exception**: `CraNotValidatedException` (same package/pattern as existing ones)
- **2 modified files**: `CraPdfGenerator` (add `@Component`) + `CraApiExceptionHandler` (add 422 handler)
- **1 new service**: `CraPdfDownloadService` — loads CRA, guards on VALIDATED status, maps entity → `CraPdfDocument`, generates bytes, builds sanitized filename
- **1 new controller**: `CraPdfDownloadController` — `GET /api/cras/{craId}/pdf` returning `application/pdf` with `Content-Disposition`
- **2 new test classes**: controller (`@WebMvcTest`) + service (unit with mocks)

One noted assumption: `CraDayEntry` has no weekend/holiday type distinction, so all 0.0 workValue entries map to `NOT_WORKED` in the PDF.
