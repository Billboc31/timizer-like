The plan is written to `runs/T029/plan.md`. Here is what it covers:

**Context:** Three of the six acceptance criteria are already satisfied by existing tests (`CraMonthSelector.test.tsx` covers month selection; `CalendarGrid.test.tsx` covers calendar day rendering and PDF download). Three are missing — click cycling, total summary, and validated lock / validate button.

**The plan specifies two files to change:**

1. **`CalendarGrid.tsx`** — add `onDayClick` and `onValidate` props, a click handler on day cells that cycles `0→0.5→1→0` (disabled when VALIDATED), a `data-testid="total-worked"` element summing `cra.days[*].worked`, and a "Validate CRA" button visible only for DRAFT CRAs.

2. **`CalendarGrid.test.tsx`** — add 10 new tests in a new `describe` block covering all six acceptance criteria, without touching the 14 existing tests.

`App.tsx` wiring is explicitly excluded — no API calls, no integration work.
