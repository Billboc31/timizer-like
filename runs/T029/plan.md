The plan is written to `runs/T029/plan.md`.

**Key findings that shaped it:**

Three of the six acceptance criteria are already satisfied by existing tests (month selection → `CraMonthSelector.test.tsx`, calendar day rendering and PDF download → `CalendarGrid.test.tsx`). No changes needed there.

The three missing criteria all require new behavior in `CalendarGrid.tsx` before tests can be written:

- **Click cycle** — no `onClick` on day cells today; plan adds `onDayClick` prop and a 0→0.5→1→0 cycle handler (disabled for weekends and VALIDATED CRAs).
- **Total summary** — `totalWorkedDays` exists in the type but is never rendered; plan adds a `data-testid="total-worked"` summary element.
- **Validated locked state** — day cells get no-op behavior when VALIDATED; tested via a new CalendarGrid unit test.

`App.tsx` also needs wiring (it currently just `console.log`s the selected CRA) to support the CRA loading and total-update integration tests covered by the new `App.test.tsx`.
