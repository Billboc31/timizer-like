The plan has been written to `runs/T029/plan.md`. Here's what it covers:

**Objective**: Gap-fill T021's unimplemented click cycle in `CalendarGrid.tsx`, then add tests for it. Five of the six acceptance criteria are already satisfied by tests in the T019–T023 component branches.

**Two files to change**:
1. `CalendarGrid.tsx` — add `onCraUpdate` prop, `handleDayClick` async handler (cycle 0→1→0.5→0), saving/error/locked states
2. `CalendarGrid.test.tsx` — add 8 new tests in two `describe` blocks (click cycle + locked state), leaving the existing 8 tests untouched

**Key design choices**:
- The plan explicitly states the prerequisite: T018–T024 branches must be merged before the Coder runs
- The click cycle is a gap-fill, not scope creep — T021 described it but never committed any frontend files
- All other acceptance criteria (month selection, day rendering, summary, validation UI, PDF download) are covered by existing test files from their respective ticket branches
