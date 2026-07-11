`runs/T014/plan.md` has been rewritten with a valid plan document containing the four required headings. The previous content was an invalid status report; the new plan describes what the Coder must build:

- New `CraHistoryItemDto` with all required fields including nullable `validationDate`
- Repository query method `findAllByOrderByYearDescMonthDesc()`
- New `CraHistoryService` and `CraHistoryController` for `GET /api/cras`
- Service unit test (Mockito) and controller test (`@WebMvcTest`)
