The plan is written to `runs/T025/plan.md`. It covers:

- One new dependency: `react-router-dom` v7
- A type patch to add `validationDate` to `CraSummaryDto`
- A new presentational `CraHistoryTable` component with co-located CSS and tests
- A new `HistoryPage` wiring `listCras()` with loading/error/empty states and PDF download
- A `CraDetailPage` extracted from the current `App.tsx` to support routing
- `App.tsx` updated to use `BrowserRouter` with routes `/` → HistoryPage and `/cra/:year/:month` → CraDetailPage
