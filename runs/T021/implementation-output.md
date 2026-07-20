All 36 tests pass. Here's a summary of the changes:

---

## Files modified

**`frontend/src/components/CalendarGrid/CalendarGrid.tsx`**
- Added `useState` import and `updateDay` import from `craClient`
- Added `onCraUpdate?: (updated: CraDetails) => void` prop
- Added `savingDays: Set<number>` and `dayErrors: Map<number, string>` state (above early returns)
- Added pure helpers `nextWorkValue` (0→1→0.5→0) and `pad` (zero-pad for ISO dates)
- Added `handleDayClick` async handler: guards concurrent clicks, calls `updateDay`, manages saving/error states
- Cell render: computes `classes` array, adds `onClick` only for DRAFT CRAs, renders `day-cell__saving` and `day-cell__error` spans conditionally

**`frontend/src/components/CalendarGrid/CalendarGrid.css`**
- Added `cursor: pointer` to `.day-cell`
- Added `.day-cell--locked`, `.day-cell--saving`, `.day-cell--error`, `.day-cell__saving`, `.day-cell__error`

**`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`**
- Added `vi.mock('../../api/craClient')` and `vi.mocked(updateDay)`
- Added `fireEvent`, `waitFor` imports
- Added 7 new test cases covering all acceptance criteria

**Note**: `lru-cache` was missing from `node_modules` (a pre-existing environment issue, not caused by this ticket) — installed it as a dev dependency to restore test execution.
