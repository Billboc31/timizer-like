The plan has been written to `runs/T022/plan.md`. It covers:

- **Backend**: extend `CraDetailsDto` record with 6 provider/client fields, update `CraDetailsMapper.toDto()` to populate them, fix any tests that construct the DTO directly.
- **Frontend types**: mirror the same 6 fields in `api/types.ts`.
- **New component**: `CraSummaryPanel` (`.tsx`, `.css`, `.test.tsx`) with `cra | null`, `loading`, `error` props and 5 test cases.
- **App.jsx wiring**: lift CRA state to `App`, fetch on mount, render the panel, expose a `handleDayUpdate` callback so the future CalendarGrid can push updated totals through — reactivity is free since `updateDay()` already returns a full `CraDetailsDto`.
