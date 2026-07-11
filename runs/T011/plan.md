`runs/T011/plan.md` has been written with the four required sections:

- **Objective** — two GET endpoints for CRA retrieval.
- **Included** — `CraRetrievalService` (2 methods), `CraRetrievalController` (`GET /api/cras/{id}` and `GET /api/cras?month=&year=`), and tests for both; all existing infrastructure reused without modification.
- **Excluded** — creation, updates, PDF, auth, pagination, any entity/DTO changes.
- **Acceptance criteria** — HTTP 200/404 behavior, response shape, 8 test cases, and `mvn test` clean.
