The plan is written to `runs/T029/plan.md`. Here's what it covers:

**Gap identified from reading the code:** `CalendarGrid.tsx` currently has no click handler, no total summary display, and no VALIDATED cell lock — three of the five untested acceptance criteria require these features to exist before tests can be written.

**Already covered (no new tests needed):**
- Month selection display — `CraMonthSelector.test.tsx` ✓
- Calendar day rendering — `CalendarGrid.test.tsx` ✓
- PDF download button availability — `CalendarGrid.test.tsx` ✓

**Plan scope:**
1. Extend `CalendarGrid.tsx` with: `onDayClick` prop, local worked state with 0→0.5→1→0 cycling, `data-testid="total-worked"` summary, DRAFT-only click (VALIDATED cells inert)
2. Add two new `describe` blocks in `CalendarGrid.test.tsx`: one for click cycle (6 cases) and one for total summary (3 cases)
