Plan written to `runs/T029/plan.md`. Here's a summary of the key decisions:

**Three acceptance criteria are already covered** by existing tests: month selection and CRA loading (`CraMonthSelector.test.tsx`), calendar day rendering and PDF download (`CalendarGrid.test.tsx`).

**Three are not yet implemented in the component** and are therefore in scope for both code and tests:

1. **Click-cycle** — `CalendarGrid` has no click handlers; needs `onDayClick` prop + toggle logic (0↔1).
2. **Total summary** — `totalWorkedDays` is in the data but never rendered; needs a summary element.
3. **Validate action visibility / locked state** — needs a "Validate CRA" button (DRAFT only) and disabled day clicks for VALIDATED.

**One prerequisite fix** is flagged: `vite.config.js` has `environment: 'node'` which breaks `@testing-library/react`; it must be changed to `jsdom` before any component tests can pass.
