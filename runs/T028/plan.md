The plan has been written to `runs/T028/plan.md`. Key decisions reflected in the plan:

- Three GET endpoints (`/api/cras/{id}`, `/api/cras`, `/api/cras/{id}/pdf`) are missing and included in scope — the integration tests can't cover "retrieve", "history listing", and "PDF download" without them.
- A `CraPdfExportService` must be created to bridge `MonthlyCraReport` → `CraPdfDocument` → bytes, since `CraPdfGenerator` exists but nothing wires it to a request.
- The integration test uses `@SpringBootTest` + `@AutoConfigureMockMvc` with the existing H2 in-memory test config, ordered test methods sharing a single `craId` across steps.
- Total calculation is verified concretely: January 2025 starts at 23.0 worked days; patching Jan 6 (weekday) to 0.5 yields 22.5.
- PDF verification is limited to status code + `Content-Type` header — pixel-perfect comparison is explicitly excluded.
