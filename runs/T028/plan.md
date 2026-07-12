The plan is written to `runs/T028/plan.md`. Key decisions:

- **Three missing GET endpoints** must be added first — `GET /api/cras/{id}`, `GET /api/cras`, and `GET /api/cras/{id}/pdf` — because the integration test workflow requires them
- **Three new services** back those endpoints (`CraDetailsService`, `CraHistoryService`, `CraPdfDownloadService`), each in the existing `com.timizerlike.cra.service` package
- **H2 in-memory datasource** added to `src/test/resources/application.yml` — H2 is already on the test classpath
- **Single `@SpringBootTest` test class** with one `fullWorkflow()` method that flows through all seven steps sequentially using `TestRestTemplate`
- **PDF test** only asserts HTTP 200 + `Content-Type: application/pdf` + non-empty body (no pixel comparison, signature image field passed as null)
