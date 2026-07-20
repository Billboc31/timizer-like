The plan is written to `runs/T029/plan.md`.

**Summary of decisions:**

Three of the six acceptance criteria are already satisfied by existing tests (`CraMonthSelector.test.tsx` covers month selection; `CalendarGrid.test.tsx` covers day rendering and PDF download). The three missing behaviours — click-cycle, total summary, validated lock — are not yet implemented in `CalendarGrid.tsx`, so the plan covers both the component changes and the corresponding new tests in a single bounded scope.
