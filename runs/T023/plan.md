Now I have a full picture of the codebase. Writing the plan.

## Objective

Add a validate action to the CRA page that shows an inline confirmation before calling `POST /api/cras/:craId/validate`. After successful validation, the CRA status transitions to `VALIDATED` in UI state, locking all day edits. Validation errors are displayed clearly.

## Included

**New component — `frontend/src/components/CraValidation/CraValidation.tsx`**
- Receives props: `cra: CraDetailsDto`, `onValidated: (updated: CraDetailsDto) => void`
- Renders nothing when `cra.status === 'VALIDATED'` (already locked — CalendarGrid handles the locked display)
- When `status === 'DRAFT'`: renders a "Valider le CRA" button
- On click: transitions to a confirmation state (inline — no modal library needed), showing a warning message ("La validation verrouille le CRA, cette action est irréversible.") plus "Confirmer" and "Annuler" buttons
- On "Confirmer": calls `validateCra(cra.id, { providerSignatureDate: new Date().toISOString().slice(0, 10) })` from `craClient`; sets loading state during call
- On success: calls `onValidated` with the updated `CraDetailsDto` returned by the API
- On `ApiError`: displays `error.message` (or a fallback string for `unknown_error`) inline near the button; stays in DRAFT mode so the user can retry
- On "Annuler": returns to the initial button state without API call

**New CSS — `frontend/src/components/CraValidation/CraValidation.css`**
- Styles for validate button, confirmation prompt, error message; follows BEM convention (`cra-validation`, `cra-validation__button`, `cra-validation__error`, etc.)

**New tests — `frontend/src/components/CraValidation/CraValidation.test.tsx`**
- Renders validate button for DRAFT CRA
- Does not render validate button for VALIDATED CRA
- Clicking button shows confirmation UI
- Clicking "Annuler" hides confirmation, no API call made
- Clicking "Confirmer" calls `validateCra` and then `onValidated` with the API response
- API error is displayed; button is re-enabled
- Loading state prevents double-submit during in-flight request

**Wiring — `frontend/src/App.tsx`** (or whichever parent renders `CalendarGrid`)
- Pass a `handleCraValidated` callback that updates the CRA in local state
- Render `<CraValidation cra={cra} onValidated={handleCraValidated} />` adjacent to `<CalendarGrid>`

**No changes** to `craClient.ts` (the `validateCra` function already exists), `apiError.ts`, `httpClient.ts`, `CalendarGrid.tsx`, or `CalendarGrid.css` (locked state already implemented).

## Excluded

- Backend validation API implementation
- PDF download button
- Client signature or date picker for client signature
- Reopen/unlock workflow
- Authentication
- Global modal/dialog infrastructure (confirmation is inline within CraValidation)
- Changes to CalendarGrid internals (locked state already works)

## Acceptance criteria

- A "Valider le CRA" button is visible on the CRA page when `status === 'DRAFT'`
- Clicking the button shows an inline confirmation with a warning message and "Confirmer" / "Annuler" options; no API call is made at this point
- Clicking "Annuler" dismisses the confirmation and returns to the initial button; `validateCra` is never called
- Clicking "Confirmer" calls `validateCra(cra.id, { providerSignatureDate: <today ISO date> })`; the button is disabled during the in-flight request
- On success, the CRA page reflects `status: 'VALIDATED'`: the validate button disappears, CalendarGrid shows the locked state (existing behaviour), day cells are non-clickable
- On API error, an error message is displayed near the validate button; the CRA stays in DRAFT and the user can retry
- `vitest run` passes with no regressions on existing tests
- `tsc -b` and `oxlint` produce no new errors
