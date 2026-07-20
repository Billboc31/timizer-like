Plan written to `runs/T021/plan.md`. Key decisions:

- **Cycle**: 0 → 1 → 0.5 → 0 as specified in the ticket acceptance criteria.
- **State**: per-cell saving and error state tracked with a `Set` and `Map` inside `CalendarGrid`; the server response (`CraDetailsDto`) is propagated up via an `onUpdate` callback so `App.tsx` stays the source of truth.
- **Lock**: `day-cell--locked` applied when `cra.status === 'VALIDATED'`; no API call is made.
- **No optimistic updates**: calendar reflects only values confirmed by the server, keeping rollback logic unnecessary.
- The `updateDay` function in `craClient.ts` already exists and needs no changes.
