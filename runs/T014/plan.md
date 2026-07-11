Plan written to `runs/T014/plan.md`.

Key decisions:
- **`CraSummaryDto`** gets a `validationDate` field — it's needed by the ticket and already available on the entity.
- **No new repository method** — `findAllByOrderByYearDescMonthDesc()` already exists and covers the ordering requirement.
- **`SIGNED_BY_PROVIDER` → `DRAFT`** mapping is preserved via the existing `CraDetailsMapper.mapStatus()` logic.
- Two test classes: a `@WebMvcTest` controller test and a plain unit test for the service.
