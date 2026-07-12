The plan is written to `runs/T025/plan.md`. It covers:

- **`CraSummaryDto`** — adds `validationDate` (missing from the current type, needed for the table column and PDF button condition).
- **Routing** — installs `react-router-dom`, wraps root with `BrowserRouter`, adds `/` and `/history` routes in `App.jsx`.
- **`HistoryPage`** — loading/error/empty/success states, a `<table>` with period, status, total days, validation date, and actions columns; "Open" navigates to `/cra/:id`, "Download PDF" is VALIDATED-only and uses a temporary anchor for blob download.
- **Tests** — 7 Vitest cases covering all states and both action buttons; `vite.config.js` updated to `jsdom` environment.
- **Exclusions** — backend API, PDF generation, CRA detail page, validation UI, filters/search all explicitly out of scope.
