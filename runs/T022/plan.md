The plan is written to `runs/T022/plan.md`. Key decisions:

- **Backend change required**: `CraDetailsDto` lacks provider/client fields — extends it with `providerName`, `providerCompany`, `clientName` populated from the existing `CraDefaultsProperties` Spring Boot config.
- **Three new frontend files**: `CraSummaryPanel.tsx`, `.css`, `.test.tsx` — following the exact same component pattern as `CalendarGrid`.
- **One type update**: `types/cra.ts` gains the three new required fields, which means the `CalendarGrid.test.tsx` fixture also needs the new fields added (included in scope to keep tests green).
- **Wiring is minimal**: App.tsx already owns `cra/loading/error` state — the panel is simply added alongside `<CalendarGrid>` using the same props.
- **"Total updates" criterion**: satisfied by prop-driven reactivity — no special wiring needed since the panel reads `totalWorkedDays` from the prop.
