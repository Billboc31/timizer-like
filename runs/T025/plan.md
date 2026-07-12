The plan has been written to `runs/T025/plan.md`. It covers:

- Adding `react-router-dom` v7 as the only new dependency
- Patching `CraSummaryDto` to include `validationDate` (missing from the current type)
- A new `CraHistoryTable` presentational component with co-located CSS and Vitest tests
- A new `HistoryPage` that wires `listCras()` with loading/error/empty states
- Restructuring `App.tsx` to use `BrowserRouter` with two routes: `/` → HistoryPage, `/cra/:year/:month` → existing calendar view extracted into `CraDetailPage`
