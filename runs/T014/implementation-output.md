Implementation complete. Here's a summary:

## Files modified / created

| File | Change |
|------|--------|
| `backend/src/main/java/com/timizerlike/backend/cra/dto/CraSummaryDto.java` | Added `LocalDate validationDate` field |
| `backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java` | **New** — `@Service` with `listHistory()`, maps each `MonthlyCraReport` via `CraTotalCalculationService` |
| `backend/src/main/java/com/timizerlike/backend/cra/web/CraHistoryController.java` | **New** — `GET /api/cras` → HTTP 200, `List<CraSummaryDto>` |
| `backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java` | **New** — 5 pure Mockito tests (empty list, draft, validated, SIGNED_BY_PROVIDER→DRAFT, ordering) |
| `backend/src/test/java/com/timizerlike/backend/cra/web/CraHistoryControllerTest.java` | **New** — 2 `@WebMvcTest` tests (empty array, list with summaries + null validationDate) |
| `backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java` | Updated `craSummaryDtoRoundTrip` for new constructor; added null/non-null `validationDate` tests |

**106 tests pass** (0 failures). The `SIGNED_BY_PROVIDER` status maps to `DRAFT` in the DTO, matching existing mapper behaviour.
