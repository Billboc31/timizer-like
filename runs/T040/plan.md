## Objective

Fix all reproducible frontend bugs in the main CRA workflows: day data is never fetched when opening a CRA (leaving CalendarGrid empty), `httpClient.ts` reads a CRA-style env var that Vite never sets, components use a legacy API module that discards structured errors, and two conflicting `CraSummaryDto` definitions create type drift. All flows — month selection, CRA creation and loading, validation, history, PDF download — must complete without JavaScript exceptions or React console warnings.

## Included

### Defects to fix

**D1 — CRA day data never fetched on open (`App.tsx:27-29`)**
`handleOpen` sets `cra = { ...summary, days: [] }` without calling the API, so `CalendarGrid` always renders an empty calendar.
- Add `craLoading: boolean` and `craError: string | null` state to `App.tsx`.
- In `handleOpen`, call `getCra(summary.id)` from `craClient.ts`, set `craLoading = true` while in-flight, call `dtoToDetails` on success, set `craError` on failure.
- Replace the hardcoded `loading={false} error={null}` props on `CraSummaryPanel` (line 47) and `CalendarGrid` (line 48) with the real state values.

**D2 — Wrong env var accessor in `httpClient.ts` (line 3)**
`process.env.REACT_APP_API_BASE_URL` is a CRA convention; Vite never sets it, so `BASE_URL` is always `''`.
- Replace line 3 with:
  `const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';`

**D3 — Possible wrong POST URL in `api/cra.ts` (line 24)**
`createCra` posts to `/api/cra` while `listCras` uses `/api/cras`; one of the two is wrong.
- Verify the backend router. If the create endpoint is `/api/cras`, fix the URL. Migrate `createCra` call-site in `CraMonthSelector` to `craClient.ts` as part of D4 so this module becomes unused.

**D4 — `CraMonthSelector` and `CraHistory` import legacy `api/cra.ts`**
The legacy module throws bare `Error` objects, losing `ApiError` codes; components cannot distinguish network errors from API errors.
- Migrate both components to import `listCras`, `createCra`, and `downloadCraPdf` from `craClient.ts`.
- After migration, `api/cra.ts` has no active callers and can be removed.

**D5 — Duplicate `CraSummaryDto` with incompatible shapes**
`types/cra.ts` declares `CraSummaryDto` with `validationDate`; `api/types.ts` declares it without. `CraHistory` (and `App.tsx`) depends on `validationDate` being present.
- Add `validationDate: string | null` to `CraSummaryDto` in `api/types.ts`.
- Remove the duplicate definition in `types/cra.ts`; re-export `CraSummaryDto` from `api/types.ts` in its place (or update all imports to point to `api/types.ts` directly).
- Confirm no TypeScript errors after consolidation.

**D6 — No error boundary**
Uncaught render-phase exceptions crash the whole page with no recovery UI.
- Add `src/components/ErrorBoundary/ErrorBoundary.tsx` — a minimal React class component implementing `componentDidCatch` and rendering a fallback message.
- Wrap `<App />` with `<ErrorBoundary>` in `main.tsx`.

**D7 — useEffect fetch leaks (no AbortController)**
`listCras()` fires on mount in both `CraMonthSelector` and `CraHistory` with no cleanup; a state update on an unmounted component triggers a React warning.
- Add an optional `signal?: AbortSignal` parameter to `apiGet` and `apiGetBlob` in `httpClient.ts`, forwarded to `fetch`.
- Expose a `signal` option on `listCras` and `downloadCraPdf` in `craClient.ts`.
- Return an abort cleanup from each `useEffect` in `CraMonthSelector` and `CraHistory`.

### Tests

- `src/App.test.tsx` (new): assert that opening a CRA calls `getCra(id)`; assert CalendarGrid receives real day data; assert loading and error states render correctly.
- `CraMonthSelector.test.tsx`: add case verifying `createCra` is called and its result is reflected (post-migration to `craClient.ts`).
- `CraHistory.test.tsx`: add case verifying that a PDF download API failure renders the error message.
- `httpClient.test.ts` (new or added to existing suite): assert requests include the base URL from `import.meta.env.VITE_API_BASE_URL` when set.

## Excluded

- Day-editing UI: `CalendarGrid` is currently a read-only presenter; implementing `updateDay` interactions is a separate feature ticket.
- Cosmetic redesign, colour changes, or layout refactoring.
- Accessibility improvements (ARIA labels, keyboard navigation) beyond what is directly broken.
- New business features.
- Loading skeletons or progressive rendering.
- Date-utility library introduction.
- Provider/client profile fields in `CraDetails` (optional fields not involved in any broken flow).
- Suppressing or hiding warnings without fixing their root cause.

## Acceptance criteria

1. Opening an existing CRA via "Open CRA" (in either `CraMonthSelector` or `CraHistory`) triggers a `getCra(id)` call; `CalendarGrid` renders the server's day data, not an empty calendar.
2. `CraSummaryPanel` and `CalendarGrid` display a loading indicator while the CRA detail fetch is in-flight and an error message if it fails; they never receive hardcoded `loading={false}` and `error={null}`.
3. `httpClient.ts` line 3 references `import.meta.env.VITE_API_BASE_URL`; no `process.env.REACT_APP_*` reference remains in the codebase.
4. `createCra` in the API layer calls the correct backend route (verified against backend router); no 404 occurs on CRA creation.
5. `CraMonthSelector` and `CraHistory` import their API functions from `craClient.ts`; `api/cra.ts` is deleted (zero active callers).
6. `CraSummaryDto` is defined in exactly one place and includes `validationDate: string | null`; `tsc --noEmit` reports zero errors.
7. `src/components/ErrorBoundary/ErrorBoundary.tsx` exists; `main.tsx` wraps `<App />` inside `<ErrorBoundary>`.
8. `useEffect` hooks in `CraMonthSelector` and `CraHistory` return abort cleanup functions; no "state update on unmounted component" warning appears in the console.
9. Browser console shows no React warnings during the full normal-use sequence: select month → create/open CRA → validate → view history → download PDF.
10. `vitest run` passes all pre-existing tests plus the new regression tests added for D1–D7.
