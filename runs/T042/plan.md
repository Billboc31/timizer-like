I now have all the information needed to write the plan.

## Objective

Implement click-cycling interaction on `CalendarGrid` (worked values 0 → 1 → 0.5 → 0, backed by `updateDay` API call) and extend the component test suite so that all ticket acceptance criteria are covered by focused Vitest + React Testing Library tests.

## Included

**`frontend/src/components/CalendarGrid/CalendarGrid.tsx`** — extend the component:
- Add `onDayChange?: (updatedCra: CraDetailsDto) => void` prop.
- Add per-day click handler: compute next `workValue` in cycle `0 → 1 → 0.5 → 0`, call `updateDay(cra.id, 'YYYY-MM-DD', { workValue })` from `../../api/craClient`.
- Track a `updatingDay: number | null` state; disable all day cells while a request is in-flight to prevent duplicate submissions.
- On success, call `onDayChange(dto)`.
- On error, display an inline error message (role `alert`) and re-enable cells.
- Block clicks when `cra.status === 'VALIDATED'`.

**`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`** — add the following test cases (mock `../../api/craClient` with `vi.mock`):

| # | Test case | Criterion covered |
|---|---|---|
| 1 | First click on a day with `worked: 0` calls `updateDay` with `workValue: 1` | cycle 0 → 1 |
| 2 | Second click (worked: 1) calls `updateDay` with `workValue: 0.5` | cycle 1 → 0.5 |
| 3 | Third click (worked: 0.5) calls `updateDay` with `workValue: 0` | cycle 0.5 → 0 |
| 4 | `onDayChange` is called with the resolved `CraDetailsDto` (incl. new `totalWorkedDays`) | totals propagate |
| 5 | All day cells carry `disabled` / pointer-events-none while update is in-flight | no duplicate actions |
| 6 | After resolution, cells become interactive again | loading lifted |
| 7 | API error renders `role="alert"` with message; cells re-enable | error feedback |
| 8 | No click on a VALIDATED CRA; `updateDay` never called | VALIDATED guard |

No new test files are needed for `CraSummaryPanel`, `CraValidation`, or `CraHistory` — their test suites are already comprehensive and satisfy the relevant criteria.

## Excluded

- Implementing or testing any backend endpoint.
- End-to-end / Playwright tests.
- Snapshot-only assertions.
- Changes to `CraHistory`, `CraSummaryPanel`, `CraValidation`, or `CraMonthSelector` components.
- A shared error/feedback component extraction (errors remain inline per component as-is).
- PDF download interaction tests beyond what already exists in `CraHistory.test.tsx`.
- Note-field editing on day cells.

## Acceptance criteria

- `npm test` (run from `frontend/`) exits 0 with all existing and new tests green.
- `CalendarGrid.test.tsx` contains at least one test per cycle step (0→1, 1→0.5, 0.5→0) using `fireEvent.click` + a mocked `updateDay`.
- A test asserts that `onDayChange` receives the API-returned dto including the updated `totalWorkedDays`.
- A test asserts that day cells become non-interactive (disabled or aria-disabled) while `updateDay` is pending, and recover after resolution.
- A test asserts that `role="alert"` appears on API failure.
- A test asserts that `updateDay` is never called when `cra.status === 'VALIDATED'`.
- No new test relies on component internals (no assertions on state variables, no `instance()` calls); all assertions go through the rendered DOM.
