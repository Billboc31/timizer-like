The plan is written to `runs/T011/plan.md`. It covers:

- **2 new GET endpoints** on `CraController` (`/api/cra/{id}` and `/api/cra?month=&year=`)
- **3 new production files**: `CraNotFoundException`, `CraRetrievalService`, `GlobalExceptionHandler`
- **2 new test files**: service unit tests and controller HTTP tests
- Reuses existing `CraDetailsDto`, `CraDetailsMapper`, and repository methods without modification
- 404 for missing records, 400 for invalid params, all existing tests must stay green
