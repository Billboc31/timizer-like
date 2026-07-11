The plan is written to `runs/T011/plan.md`. It covers:

- **`CraNotFoundException`** — new runtime exception for the not-found case.
- **`CraRetrievalService`** — new service with `getById` and `getByMonthAndYear`, reusing the existing repository and mapper.
- **`CraController`** — two new GET endpoints (`/api/cra/{id}` and `/api/cra/{year}/{month}`) plus a `@ExceptionHandler` mapping `CraNotFoundException` → 404.
- **`CraControllerTest`** — six new test cases covering happy paths, 404, and input validation.
- No changes to any existing entity, DTO, repository, or mapper.
