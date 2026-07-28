All 145 tests pass. Here's a summary of all changes:

---

## Files modified or created

### Modified
| File | Change |
|---|---|
| `frontend/src/api/types.ts` | Added 9 optional snapshot fields to `CraDetailsDto` (`providerFirstName/LastName/Company`, `clientFirstName/LastName/Company`, `clientContactFirstName/LastName`, `clientSignatureDate`) |
| `frontend/src/types/cra.ts` | Added matching optional fields to `CraDetails` and its local `CraDetailsDto` |
| `frontend/src/components/CraHistory/CraHistory.tsx` | Renamed `onOpen` prop → `onOpenDetail` |
| `frontend/src/components/CraHistory/CraHistory.test.tsx` | Updated all `onOpen` → `onOpenDetail` references |
| `frontend/src/components/CraHistory/CraHistory.axe.test.tsx` | Fixed pre-existing broken import (`../../api/cra` → `../../api/craClient`), updated prop name |
| `frontend/src/components/CraMonthSelector/CraMonthSelector.axe.test.tsx` | Fixed pre-existing broken import |
| `frontend/src/App.tsx` | Added `'history-detail'` to `View` type, `historyDetailId` state, `handleOpenDetail` handler, renders `CraHistoryDetail` for that view |
| `frontend/src/App.test.tsx` | Extended `DETAILS` fixture with new nullable fields, added two `D2` integration tests |

### Created
| File | Purpose |
|---|---|
| `frontend/src/components/CraHistoryDetail/CraHistoryDetail.tsx` | Read-only detail view: period heading, metadata grid (provider/client/contact/dates/status), `CalendarGrid` in forced VALIDATED mode, back + download actions |
| `frontend/src/components/CraHistoryDetail/CraHistoryDetail.css` | Layout for header, 2-column metadata grid, actions bar, badge, skeleton, mobile breakpoints |
| `frontend/src/components/CraHistoryDetail/CraHistoryDetail.test.tsx` | 19 unit tests covering loading, metadata, period edge months (Jan/Dec/Feb leap/non-leap), retry, download success/error, read-only calendar, null craId, mobile/desktop viewports |
| `frontend/src/components/CraHistoryDetail/CraHistoryDetail.axe.test.tsx` | Axe a11y checks for loaded, loading, and error states |
| `frontend/e2e/cra-history-detail.spec.ts` | E2E: open → inspect period + metadata → download PDF → back; and error-state test |
