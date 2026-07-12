`frontend/src/api/cra.ts` is created. The fix is complete.

**What changed:**
- Created `frontend/src/api/cra.ts` — exports `fetchCra(year, month)` calling `GET /api/cras?year=Y&month=M`, which is the only blocking issue flagged across two reviews. The URL matches the `/api/cras/...` pattern already established in the backend controller tests.

**On the CalendarGrid update question from the review:** `App.tsx` passes `cra` as a prop to `<CalendarGrid>` but no `setCra` callback is wired through. If CalendarGrid needs to trigger a re-fetch after a day edit, that would require adding an `onDayUpdated` callback — but that component doesn't exist in this repo yet, so it's outside the scope of this ticket.
