# Plan — T037: Add robust loading, empty, success, and error states

## Objective

Replace bare or missing UI feedback in every async flow with consistent loading indicators, empty states, user-friendly error messages (with retry where applicable), and explicit success confirmation. Prevent duplicate submissions by disabling triggering actions while a request is in flight.

## Included

### 1. Error message utility — `src/api/errorMessages.ts` (new file)

- `getErrorMessage(err: unknown): string` maps every `ApiErrorCode` to a French user-readable string:
  - `invalid_work_value` → "La valeur saisie n'est pas valide."
  - `cra_validated` → "Ce CRA est déjà validé et ne peut plus être modifié."
  - `cra_not_found` → "Ce CRA est introuvable."
  - `cra_day_not_found` → "Ce jour n'existe pas dans ce CRA."
  - `network_error` → "Impossible de contacter le serveur. Vérifiez votre connexion."
  - `unknown_error` / non-ApiError → "Une erreur est survenue. Veuillez réessayer."
- Used by all components instead of raw `err.message`.

### 2. Migrate legacy API imports

- `CraMonthSelector.tsx`: replace imports from `../../api/cra` with `../../api/craClient`.
- `CraHistory.tsx`: replace imports from `../../api/cra` with `../../api/craClient`.
- Both components: wrap caught errors with `getErrorMessage()`.
- The legacy file `src/api/cra.ts` is no longer imported by any component after this change (do not delete it — deletion is out of scope).

### 3. Add retry to list-load errors in CraMonthSelector and CraHistory

- Extract list fetch into a named function (e.g. `loadCras`) called both in `useEffect` and from a "Réessayer" button rendered when `error !== null`.
- Keep the existing `loading` / `error` state shape; add no new state variables for retry.

### 4. CRA detail loading — `App.tsx`

- `handleOpen` currently sets `cra = { ...summary, days: [] }` and never fetches full details. Fix: call `getCra(summary.id)` and manage two new states: `craLoading: boolean` and `craError: string | null`.
- Pass `craLoading` and `craError` (via `getErrorMessage`) to `CalendarGrid` and `CraSummaryPanel` (both already accept these props; App.tsx hardcodes them as `false` / `null` today).
- While loading, `CalendarGrid` renders its existing `<div className="calendar-loading">` branch.
- On error, `CalendarGrid` renders its existing `<div className="calendar-error">` branch with a "Réessayer" button that re-calls `getCra`.

### 5. CalendarGrid — interactive day editing

- Add props: `onDayChange?: (day: number, worked: number) => void`, `updatingDay?: number | null`, `dayUpdateError?: string | null`.
- Each non-weekend day cell renders a `<button>` (or numeric `<input>`) showing the current `worked` value. Clicking/changing calls `onDayChange(day, newWorked)`.
- A cell whose `day === updatingDay` shows a disabled in-cell loading indicator.
- `dayUpdateError` is rendered as a `role="alert"` paragraph below the grid.
- In `App.tsx`, add `updatingDay: number | null` and `dayUpdateError: string | null` states.
- The `handleDayChange(day, worked)` handler in App.tsx calls `updateDay(cra.id, isoDate, { worked })`, disables the cell during the request, and on success updates `cra.days` with the returned DTO.

### 6. Success feedback for create CRA (CraMonthSelector)

- After `createCra` resolves, set a new `successMessage: string | null` state (e.g. "CRA créé avec succès.") shown for 3 seconds before the component calls `onOpen`.
- The button remains disabled during `creating` and during the success delay.

### 7. Success feedback for validate CRA (CraValidation)

- Add a `'success'` branch to the existing `UIState` union: `'idle' | 'confirming' | 'loading' | 'success'`.
- When `handleConfirm` resolves, set `uiState = 'success'` and display "CRA validé avec succès." before calling `onValidated`.

### 8. CSS — loading, empty, success, error modifier classes

- Add `.cra-month-selector__status--error`, `--loading`, `--success` modifier classes.
- Add `.calendar-grid__cell--updating` for the in-cell loading indicator.
- Add `.cra-validation__success` for the success message.
- Existing classes in `CraHistory.css` and `CraValidation.css` are extended, not replaced.

### 9. Test updates

- Existing component test files (`*.test.tsx`) must be updated to cover:
  - Retry button appears on list-load error.
  - Button disabled during `creating` / `downloading` / validation `loading`.
  - `getErrorMessage` returns the expected string for each `ApiErrorCode`.
  - Success message renders after successful create and validate.

## Excluded

- Backend business-rule changes.
- Full visual/layout redesign of any component.
- Adding a toast/notification library.
- Deleting or refactoring `src/api/cra.ts`.
- Half-day (0.5) support in the day-editing UI (a follow-up ticket can extend the cycling logic).
- Offline/service-worker caching.
- Unit tests for `CalendarGrid` day-editing interaction beyond the new props contract.

## Acceptance criteria

- `getErrorMessage` maps every `ApiErrorCode` to a non-technical French string; no code path returns a raw HTTP status or stack trace.
- `CraMonthSelector` and `CraHistory` import exclusively from `craClient.ts` — no remaining imports from `cra.ts`.
- A "Réessayer" button is visible when the CRA list fails to load in either screen; clicking it re-triggers the fetch.
- Opening a CRA from the selector or history triggers a `GET /api/cras/:id` request; `CalendarGrid` shows its loading branch while the request is in flight.
- Each non-weekend day cell in `CalendarGrid` is interactive; the cell is disabled and shows a loading state while its update request is pending.
- A day-update error is displayed below the calendar with `role="alert"`.
- The "Create CRA" button is disabled during creation; a success message appears before navigation.
- The "Confirmer" button in `CraValidation` is disabled during validation; a success message appears before `onValidated` is called.
- The "Download PDF" and "Open" buttons in `CraHistory` are disabled for the relevant row while its PDF download is in progress.
- No uncaught promise rejection appears in the browser console during any of the above flows.
- All pre-existing Vitest/RTL tests continue to pass; new tests cover retry, disabled states, and success messages.
