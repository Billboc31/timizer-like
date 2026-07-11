The plan is written to `runs/T014/plan.md`. Key findings that shaped it:

- `findAllByOrderByYearDescMonthDesc()` already exists on the repository — no data-layer work needed.
- `CraSummaryDto` already exists but is missing `validationDate`, which the ticket explicitly requires.
- No `CraSummaryMapper` exists yet — needs to be created (mirrors the pattern of `CraDetailsMapper`).
- The controller only needs the repository injected; no new service layer is warranted.
