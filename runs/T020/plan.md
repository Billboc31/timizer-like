The plan has been written to `runs/T020/plan.md`. It covers:

- **Objective**: `CalendarGrid` component showing day number, weekday label, and work value per day, with visual weekend distinction and loading/empty states.
- **Included**: 4 files created (`calendarUtils.ts`, its Vitest test, `CalendarGrid.tsx`, `CalendarGrid.css`) + `App.jsx` wired with a hardcoded stub for visual verification. Exact prop shapes and CSS class names are specified.
- **Excluded**: click cycling, API calls, month selector integration, state management, backend, validation, PDF, history.
- **Acceptance criteria**: all mechanically verifiable — correct day count, `.weekend` class on weekends only, loading/empty states rendered, TypeScript build clean, Vitest tests pass.
