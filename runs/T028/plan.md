Plan written to `runs/T028/plan.md`. Key decisions:

- The three GET endpoints (`/api/cras/{id}`, `/api/cras`, `/api/cras/{id}/pdf`) don't exist yet and are included in scope — the tests can't cover "retrieve", "history listing", and "PDF download" without them.
- A single `@SpringBootTest` integration test class covers all 8 workflow steps in order, using the existing H2 in-memory config from `src/test/resources/application.yml`.
- `totalWorkedDays=1.5` is the concrete, verifiable assertion for total calculation after two PATCH calls (1.0 + 0.5).
- PDF download is verified only by status code and `Content-Type`, as pixel-perfect comparison is explicitly out of scope.
