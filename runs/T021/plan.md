## Objective

Add click cycling behavior to `CalendarGrid` day cells so that clicking a DRAFT CRA day cycles its `worked` value through `0 → 1 → 0.5 → 0` and persists each change via the existing `PATCH /api/cras/{id}/days/{date}` endpoint. VALIDATED CRA days are displayed as locked and cannot be clicked.

## Included

### `frontend/src/components/CalendarGrid/CalendarGrid.tsx`

- Add optional prop `onCraUpdate?: (updated: CraDetails) => void` so the parent can receive the updated CRA returned by the API.
- Add internal state `savingDays: Set<number>` (days with an in-flight PATCH request) and `dayErrors: Map<number, string>` (per-cell error message after a failed PATCH).
- Add pure helper `nextWorkValue(current: number): 0 | 0.5 | 1`:
  - `0 → 1`, `1 → 0.5`, `0.5 → 0`
- In the cell render loop:
  - If `cra.status === 'VALIDATED'`: add class `day-cell--locked`, omit `onClick`.
  - Otherwise attach `onClick` that: returns immediately if the day is already in `savingDays`; computes the ISO date string `${cra.year}-${pad(cra.month)}-${pad(day)}`; computes `next = nextWorkValue(worked)`; adds the day to `savingDays` and clears any prior error for that day; calls `updateDay(cra.id, isoDate, { workValue: next })`; on success removes the day from `savingDays` and calls `onCraUpdate?.(result)`; on error removes the day from `savingDays` and stores the error message in `dayErrors`.
  - When a day is in `savingDays`, add class `day-cell--saving` and render a `<span className="day-cell__saving">saving…</span>` element inside the cell.
  - When `dayErrors.get(day)` is set, add class `day-cell--error` and render a `<span className="day-cell__error">{message}</span>` element inside the cell.

### `frontend/src/components/CalendarGrid/CalendarGrid.css`

- Add `cursor: pointer` to the base `.day-cell` rule so all clickable cells have pointer cursor.
- Add `.day-cell--locked { cursor: not-allowed; opacity: 0.6; }`.
- Add `.day-cell--saving { opacity: 0.7; pointer-events: none; }`.
- Add `.day-cell--error { border: 1px solid red; }`.
- Add `.day-cell__saving { font-size: 0.7em; color: #888; }`.
- Add `.day-cell__error { font-size: 0.7em; color: red; }`.

### `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`

Mock `updateDay` from `../../api/craClient` with `vi.mock`. Add test cases:

1. Clicking a cell with `worked=0` in a DRAFT CRA calls `updateDay` with `workValue: 1`.
2. Clicking a cell with `worked=1` in a DRAFT CRA calls `updateDay` with `workValue: 0.5`.
3. Clicking a cell with `worked=0.5` in a DRAFT CRA calls `updateDay` with `workValue: 0`.
4. The cell shows `day-cell--saving` while the PATCH is in-flight.
5. `onCraUpdate` is called with the API response on success.
6. On PATCH failure the cell shows class `day-cell--error` and the error text.
7. Cells in a VALIDATED CRA have class `day-cell--locked` and clicking them does not call `updateDay`.

## Excluded

- Backend changes: `PATCH /api/cras/{id}/days/{date}` already exists and rejects VALIDATED CRAs with 409.
- Calendar layout and CRA creation (existing feature).
- Notes editing, PDF generation, client signature.
- Optimistic UI updates (the worked value displayed updates only after the API responds successfully).
- `CraMonthSelector` changes.

## Acceptance criteria

1. Clicking a DRAFT day cell with `worked=0` sends `PATCH` with `{ workValue: 1 }`; after response the cell displays `1`.
2. Clicking a DRAFT day cell with `worked=1` sends `PATCH` with `{ workValue: 0.5 }`; after response the cell displays `0.5`.
3. Clicking a DRAFT day cell with `worked=0.5` sends `PATCH` with `{ workValue: 0 }`; after response the cell displays `0`.
4. During an in-flight PATCH the cell has class `day-cell--saving` and a second click on the same cell is ignored.
5. On PATCH failure the cell has class `day-cell--error` and an error message is visible inside the cell.
6. All day cells in a VALIDATED CRA have class `day-cell--locked`; clicking them does not trigger `updateDay`.
7. `npm test` (Vitest) passes with all new and existing `CalendarGrid` tests green.
