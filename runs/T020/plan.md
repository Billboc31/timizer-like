The plan has been written to `runs/T020/plan.md`. It covers:

- **Objective**: `CalendarGrid` component displaying all CRA days with weekday labels, work values, and weekend styling
- **Included**: 4 new files (`calendarUtils.ts`, `calendarUtils.test.ts`, `CalendarGrid.tsx`, `CalendarGrid.css`) + 1 shared types file + 1 modified `App.tsx`; explicit hypothesis that the frontend app is already scaffolded
- **Excluded**: click cycling, API calls, state management, month selector, backend changes
- **Acceptance criteria**: all mechanically verifiable — exact day count, `.weekend` class presence, loading/empty states, TypeScript build clean, tests pass
