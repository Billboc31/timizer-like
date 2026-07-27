All done. Here's what was changed:

---

**Files modified:**

**`frontend/src/components/CalendarGrid/CalendarGrid.tsx`**
- Added `useState` import and two new API imports (`updateDay`, `CraDetailsDto`)
- Added optional `onDayChange?: (updatedCra: CraDetailsDto) => void` prop
- Added `updatingDay` and `apiError` state
- Added `nextWorkValue(current)` helper implementing the `0 → 1 → 0.5 → 0` cycle
- Added `handleDayClick` async handler: guards VALIDATED status and in-flight requests, calls `updateDay`, invokes `onDayChange` on success, sets `apiError` on failure
- Day cells gain `aria-disabled={isBusy || undefined}` and an `onClick` handler
- Renders a `role="alert"` div when `apiError` is set

**`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`**
- Added `vi.mock('../../api/craClient')` at module level and `vi.resetAllMocks()` in `afterEach`
- Added a second `describe` block with 8 new tests covering all plan criteria: three cycle steps, `onDayChange` propagation, `aria-disabled` during in-flight, re-enable after resolution, `role="alert"` on error, and VALIDATED guard

**Result:** 69 tests, all green.
