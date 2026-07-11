The plan has been written to `runs/T011/plan.md`. It specifies:

- A new `CraRetrievalService` with `getById` and `getByMonthAndYear` methods, reusing the existing `MonthlyCraReportRepository` and `CraDetailsMapper`
- A second constructor on `CraNotFoundException` for the month/year case
- Two `@GetMapping` methods added to the existing `CraController` (`/api/cra/{id}` and `/api/cra/{year}/{month}`)
- No changes to the exception handler (it already covers `CraNotFoundException` → 404)
- Unit tests for the service and MockMvc tests for the controller
