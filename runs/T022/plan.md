The plan is written to `runs/T022/plan.md`. It covers:

- **Backend**: `CraDetailsDto` gains `providerName`, `providerCompany`, `clientName` — populated in `CraDetailsMapper.toDto()` and `CraDayUpdateService.buildDto()` from the already-stored fields on `MonthlyCraReport`. Four test files updated accordingly.
- **Frontend types**: Both `api/types.ts` (`CraDetailsDto`) and `types/cra.ts` (`CraDetails`) gain the three new fields.
- **New component**: `CraSummaryPanel` (`.tsx`, `.css`, `.test.tsx`) under its own subfolder, mirroring the `CalendarGrid` pattern, receiving `cra | null`, `loading`, `error` props.
- **App.tsx**: Renders `<CraSummaryPanel>` alongside `<CalendarGrid>` with the same props already in state — no extra wiring needed for reactivity.
- **CalendarGrid test fixture**: Updated to satisfy the extended `CraDetails` type.
