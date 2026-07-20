The plan is written to `runs/T029/plan.md`.

**Key decisions:**

- Three acceptance criteria are already covered by existing tests (month selection, calendar day rendering, PDF download) — no changes needed there.
- Three criteria require extending `CalendarGrid.tsx` before tests can be written: click cycling (`onDayClick` prop + 0→0.5→1→0 handler), total summary (`data-testid="total-worked"` element), and validated lock state (conditional `onClick`).
- Validate button follows the same pattern as the existing `onDownload` prop (callback injected as prop, local loading/error state, `role="alert"` on rejection).
- `App.tsx` wiring of the new props to actual API calls is explicitly out of scope — the ticket covers tests, not end-to-end integration.
