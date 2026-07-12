All 39 tests pass. Here's a summary of everything implemented:

---

## Files modified / created

| File | Change |
|------|--------|
| `frontend/src/types/cra.ts` | Added `validationDate: string \| null` to `CraSummaryDto` |
| `frontend/src/api/cra.ts` | Added `downloadCraPdf(id)` function |
| `frontend/src/components/CraHistory/CraHistory.tsx` | New component — table list of CRAs with all required columns and actions |
| `frontend/src/components/CraHistory/CraHistory.css` | Scoped styles for the history table |
| `frontend/src/components/CraHistory/CraHistory.test.tsx` | 10 tests covering all states and interactions |
| `frontend/src/App.tsx` | Added `history` view toggle via state-lifted navigation |
| `frontend/package.json` | Added `lru-cache` (missing transitive dep of jsdom, blocked all tests) |

## Acceptance criteria coverage

- **History page lists CRAs** — `useEffect` fetches `listCras()` on mount
- **Period, status, worked days** — shown in table columns
- **Open CRA from history** — "Open" button calls `onOpen(cra)` for every row
- **Download PDF when validated** — "Download PDF" button only renders for `VALIDATED` status, calls `downloadCraPdf()` and triggers browser download
- **Empty state** — "No CRA records found." paragraph
- **Loading and error states** — handled with matching messages, error uses `role="alert"`

## Assumptions flagged

- `validationDate` on `CraSummaryDto` assumes the backend's `GET /api/cras` endpoint returns it; if missing, the column will show `—` without breaking anything (consistent with what the plan noted).
