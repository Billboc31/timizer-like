The plan is written to `runs/T022/plan.md`. It covers:

- **Backend**: `CraDetailsDto` gains 6 new fields (provider first/last name, company; client first/last name, company), populated in `CraDetailsMapper.toDto()` from the already-stored `MonthlyCraReport` fields. Affected tests updated.
- **Frontend types**: Both `api/types.ts` and `types/cra.ts` gain the same 6 fields.
- **New component**: `CraSummaryPanel` (`.tsx`, `.css`, `.test.tsx`) under its own subfolder, with props `cra | null`, `loading`, `error` — mirroring the `CalendarGrid` pattern.
- **App.tsx**: Renders `<CraSummaryPanel>` alongside `<CalendarGrid>` sharing the same state, satisfying the reactivity requirement without extra wiring.
- **CalendarGrid test fixture**: Updated to satisfy the extended `CraDetails` type.
