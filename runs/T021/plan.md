`runs/T021/plan.md` is written. The plan covers:

- **1 new file**: `useDayClick.ts` hook — cycle logic, API call, per-cell saving/error state
- **3 modified files**: `CalendarGrid.tsx` (click wiring + locked gate), `CalendarGrid.css` (4 new modifier classes), `CalendarGrid.test.tsx` (6 new test cases)
- Two explicit assumptions: `CraDetailsDto`/`CraDetails` type reconciliation is the parent's responsibility; weekends are not locked
- No optimistic updates, no rollback — API response drives state
