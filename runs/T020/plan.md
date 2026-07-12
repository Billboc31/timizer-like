Plan written to `runs/T020/plan.md`. It covers:

- **3 new files**: `calendarUtils.ts` (pure date logic, no library), `CalendarGrid.tsx` (presentational, props-driven), `CalendarGrid.css` (7-column grid, weekend styling)
- **1 test file**: utility tests for day count, weekend detection, leap years
- **1 modified file**: `App.jsx` wired with `cra={undefined}` as placeholder
- **Excluded**: click cycling, API calls, month navigation, DOM component tests (no testing-library installed)
- **Acceptance criteria**: all verifiable — day count, CSS classes, empty/loading states, prop-driven re-render, `npm test` green
