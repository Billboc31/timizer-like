The plan has been written to `runs/T022/plan.md`. Key decisions:

- **Backend scope**: `CraDetailsDto` gains 3 fields (`providerName`, `providerCompany`, `clientName`) sourced from `CraDefaultsProperties` (already in main). `CraDetailsMapper.toDto()` receives the properties to populate them. All callers and tests that construct the record need updating.
- **Frontend types**: Both `CraDetailsDto` (api/types.ts) and `CraDetails` (types/cra.ts) gain the 3 fields, which cascades a fixture fix to `CalendarGrid.test.tsx`.
- **New component**: `CraSummaryPanel` follows the exact `CalendarGrid` pattern — a `.tsx`, `.css`, and `.test.tsx` under its own subfolder, receiving `cra | null`, `loading`, `error` props.
- **Reactivity**: no special wiring — the panel reads `totalWorkedDays` from the prop; React re-renders propagate parent state updates automatically.
- **Wiring**: `App.tsx` adds `<CraSummaryPanel>` alongside `<CalendarGrid>` with the same three props already in scope.
