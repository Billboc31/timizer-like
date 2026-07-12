<<<<<<< HEAD
## Objective

Bootstrap the React + TypeScript frontend application and implement a `CalendarGrid` component that displays all days of the selected CRA month, with day number, weekday label, current work value per day, and visual weekend distinction.

## Included

### Frontend bootstrap

- `frontend/` — Initialise a React + TypeScript project via `npx create-react-app frontend --template typescript`. Remove default boilerplate (logo, default CSS content, default `App.test.tsx` assertions).
- `frontend/.env.development` — Set `REACT_APP_API_BASE_URL=http://localhost:8080`.

### TypeScript types

- `frontend/src/types/cra.ts` — Define:
  - `CraDayEntry: { day: number; worked: number; note: string }`
  - `CraDetails: { id: number; month: number; year: number; totalWorkedDays: number; status: 'DRAFT' | 'VALIDATED'; days: CraDayEntry[] }`

### API service

- `frontend/src/api/cra.ts` — Export `fetchCra(year: number, month: number): Promise<CraDetails>` calling `POST /api/cra` with `{ year, month }` (backend endpoint is idempotent: returns 201 on creation, 200 if it already exists).

### CalendarGrid component

- `frontend/src/components/CalendarGrid/CalendarGrid.tsx` — Props: `cra: CraDetails | null`, `loading: boolean`, `error: string | null`. Renders:
  - A loading placeholder when `loading` is `true`.
  - An error message when `error` is non-null.
  - An empty state message when `cra` is `null` and not loading.
  - One cell per day of the month (derived from `cra.month`/`cra.year` to know the full month length), each showing:
    - Day number.
    - Weekday abbreviation (Mon – Sun), computed from year + month + day.
    - `worked` value from the matching `CraDayEntry` (fall back to `0` if the day is missing from the list).
  - Weekend cells (Saturday and Sunday) carry the CSS class `day-cell--weekend`.
- `frontend/src/components/CalendarGrid/CalendarGrid.css` — Minimal styles: grid layout (7-column or inline-flex), distinct background for `.day-cell--weekend`.

### App wiring

- `frontend/src/App.tsx` — Hard-code initial state to the current month (July 2026). On mount call `fetchCra`, pass `loading`, `error`, and `cra` to `<CalendarGrid />`. No month-switching UI.

### Tests

- `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` — React Testing Library:
  - Renders exactly N cells for a month with N days (e.g., July 2026 → 31 cells).
  - Weekend cells carry the class `day-cell--weekend`; weekday cells do not.
  - Loading state renders a loading element.
  - Error state renders the error message string.

## Excluded

- Month selector or navigation UI — the displayed month is hard-coded for now.
- Click interaction on day cells (click cycling out of scope per ticket).
- Backend mutation calls or day-value persistence.
- Validation button.
- PDF download.
- CRA history view.
- Production build, deployment, or CI/CD configuration.

## Acceptance criteria

- `frontend/` exists; `npm install && npm start` launches the dev server without errors.
- `npm test -- --watchAll=false` passes for `CalendarGrid.test.tsx`.
- The rendered page shows one cell per calendar day of the loaded month (correct count, matching the actual number of days in the month).
- Each cell displays the day number, weekday abbreviation, and the `worked` value for that day.
- Saturday and Sunday cells are visually distinct from weekday cells (CSS class `day-cell--weekend` applied).
- While data is loading, a loading indicator is visible.
- If the API call fails, an error message is visible.
- Changing the hard-coded month in `App.tsx` re-renders the grid with the correct days for the new month.
=======
Plan written to `runs/T020/plan.md`. It covers:

- **3 new files**: `calendarUtils.ts` (pure date logic, no library), `CalendarGrid.tsx` (presentational, props-driven), `CalendarGrid.css` (7-column grid, weekend styling)
- **1 test file**: utility tests for day count, weekend detection, leap years
- **1 modified file**: `App.jsx` wired with `cra={undefined}` as placeholder
- **Excluded**: click cycling, API calls, month navigation, DOM component tests (no testing-library installed)
- **Acceptance criteria**: all verifiable — day count, CSS classes, empty/loading states, prop-driven re-render, `npm test` green
>>>>>>> 1397119 (T020: planner checkpoint)
