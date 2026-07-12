`runs/T020/plan.md` is written. The plan covers:

- **4 new files**: `calendarUtils.ts` (pure date logic, no external library), `calendarUtils.test.ts` (Vitest, including leap year), `CalendarGrid.tsx` (props-driven, loading/empty states), `CalendarGrid.css` (7-column CSS Grid, `.weekend` class)
- **1 modified file**: `App.jsx` wired with `<CalendarGrid cra={undefined} />` as a placeholder
- **Excluded**: click cycling, data fetching inside the component, month selector, state management, `.jsx`→`.tsx` conversion
- **Acceptance criteria**: all mechanically verifiable — day count, `.weekend` class, loading/empty states, `npm test` and `npm run build` pass clean
