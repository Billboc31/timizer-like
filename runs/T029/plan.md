Plan written to `runs/T029/plan.md`. Here's the summary:

**Already covered by existing tests (no changes needed):**
- Month selection display — `CraMonthSelector.test.tsx`
- Calendar day rendering — `CalendarGrid.test.tsx`
- PDF download button availability — `CalendarGrid.test.tsx`

**Gaps that require both component changes and new tests:**

`CalendarGrid.tsx` currently has no click handlers, no total worked days display, and no validate button. The plan adds:
1. `onDayUpdate` prop + day-cell click handler cycling `0 → 0.5 → 1 → 0`, with no click attached when `status === 'VALIDATED'`
2. `onValidate` prop + "Validate" button visible for DRAFT, absent for VALIDATED
3. `data-testid="total-worked-days"` display synced from internal state after each `onDayUpdate` response

`CalendarGrid.test.tsx` gets three new `describe` blocks covering click cycle (4 cases), total summary (2 cases), and validate action (3 cases), all using `vi.fn()` mocks.
