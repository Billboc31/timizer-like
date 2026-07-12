`runs/T017/plan.md` is written. The plan covers:

- **New endpoint** `GET /api/cras/{id}/pdf` in `CraPdfController`
- **New service** `CraPdfDownloadService` that loads the CRA, guards on `VALIDATED` status, maps `MonthlyCraReport` → `CraPdfDocument` (using `CraDefaultsProperties` for address/contact not stored on the entity), and delegates byte generation to the existing `CraPdfGenerator`
- **New exception** `CraNotValidatedException` → HTTP 422 via the existing `CraApiExceptionHandler`
- **Filename sanitization** (`CRA-{providerCompany}-{clientCompany}-{year}-{MM}.pdf`)
- **Two test classes** (unit service test + `@WebMvcTest` controller test) covering the 200/404/422 cases
