The plan has been written to `runs/T014/plan.md`. It covers:

- **Objective**: expose `GET /api/cras` returning sorted CRA summaries.
- **Included**: `CraSummaryDto` update, `CraDetailsMapper.toSummaryDto`, new `CraHistoryService`, new `CraHistoryController`, and two test files.
- **Excluded**: creation, edition, PDF, frontend, pagination, auth changes.
- **Acceptance criteria**: HTTP 200, correct JSON fields, descending sort, nullable `validationDate`, no pre-existing test breakage.
