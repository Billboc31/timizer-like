Plan written to `runs/T020/plan.md`. It covers:

- **3 new files**: `calendarUtils.ts` (pure date logic, no library), `CalendarGrid.tsx` (props-driven presentational component), `CalendarGrid.css` (7-column CSS Grid, weekend styling)
- **1 test file**: `calendarUtils.test.ts` — utility tests for day count, first weekday, weekend detection, and labels
- **1 modified file**: `App.jsx` wired with `cra={undefined}` as placeholder
- **Excluded**: click cycling, API calls inside the component, month navigation, DOM-level component tests (no Testing Library installed)
- **Acceptance criteria**: all verifiable — day count per month, weekend CSS class, loading state, prop-driven re-render, `npm test` and `npm run lint` pass
