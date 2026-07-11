The plan has been written to `runs/T014/plan.md`. It covers:

- **Objective** — `GET /api/cras` returning ordered CRA summaries.
- **Included** — 5 concrete changes: extend `CraSummaryDto` with `validationDate`, new `CraHistoryService`, new `CraHistoryController`, two test classes.
- **Excluded** — creation, editing, PDF, frontend, pagination, any unrelated file.
- **Acceptance criteria** — verifiable conditions: HTTP 200, expected JSON fields, `SIGNED_BY_PROVIDER` → `DRAFT` mapping, descending order, empty-list case, existing tests still green.

Key finding: the repository method `findAllByOrderByYearDescMonthDesc()` and `CraSummaryDto` already exist — the only DTO change needed is adding `validationDate` (nullable `LocalDate`).
