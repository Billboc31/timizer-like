The plan has been written to `runs/T022/plan.md`. It covers:

- **Backend**: extend `CraDetailsDto` record with 6 provider/client fields and update `CraDetailsMapper.toDto()` to populate them; fix any tests that construct the DTO directly.
- **Frontend types**: add the same 6 fields to `CraDetailsDto` in `api/types.ts` (and mirror in `types/cra.ts`).
- **New component**: `CraSummaryPanel` (`.tsx`, `.css`, `.test.tsx`) with `cra | null / loading / error` props, following the `CalendarGrid` pattern. Five test cases covering data, loading, error, null, and reactivity.
- **App.tsx**: render `<CraSummaryPanel>` sharing the same CRA state as `<CalendarGrid>` — reactivity is free since the parent already refreshes `cra` on every day update.
