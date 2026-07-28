Now I have enough context to write the plan.

## Objective

Add a dedicated read-only CRA history detail view, accessible from each entry in the history list, showing the exact covered period, all metadata from the CRA snapshot (provider, client, contact, status, signature dates, total days), a read-only day-by-day calendar, and a PDF download action.

## Included

### `frontend/src/api/types.ts`
- Extend `CraDetailsDto` with snapshot provider/client fields: `providerFirstName`, `providerLastName`, `providerCompany`, `clientFirstName`, `clientLastName`, `clientCompany`, `clientContactFirstName`, `clientContactLastName` (all `string | null`), and `clientSignatureDate: string | null`.
- These fields are already partially present in the frontend `CraDetails` type (`types/cra.ts`) — align both type definitions so neither has orphaned optional fields.

### `frontend/src/components/CraHistoryDetail/CraHistoryDetail.tsx` (NEW)
- Props: `craId: number | null`, `onBack: () => void`.
- Internal state: loads `CraDetailsDto` via `getCra(craId)` on mount; manages `loading`, `error`, `downloading` states.
- **Period heading**: month/year as main title (e.g., `Juillet 2026`), covered period as subtitle (e.g., `1 juillet 2026 – 31 juillet 2026`) using `Intl.DateTimeFormat('fr-FR')` to compute first and last calendar days of the month.
- **Metadata section** (read-only): provider name + company, client name + company, client contact name, total worked days, CRA status badge, validation date, provider signature date, client signature date — display `—` when absent.
- **Read-only calendar**: reuse `CalendarGrid` with the CRA in `VALIDATED` status (the component already disables day clicks for validated CRAs); pass the loaded `CraDetailsDto` cast to the expected `CraDetails` shape.
- **Actions**: "Back to history" button calling `onBack`; "Download PDF" button (visible only when `status === 'VALIDATED'`) reusing existing `downloadCraPdf` logic with the same blob download pattern as in `CraHistory`.
- Handle loading skeleton, error state with retry, and null/missing CRA (404 mapped to friendly message).

### `frontend/src/components/CraHistoryDetail/CraHistoryDetail.css` (NEW)
- Layout styles for period heading, metadata grid, and action bar; responsive breakpoints for mobile.

### `frontend/src/components/CraHistory/CraHistory.tsx`
- Replace the existing `onOpen` prop (currently typed as `(cra: CraSummaryDto) => void`) with `onOpenDetail: (cra: CraSummaryDto) => void` — the "Open" button on each card triggers this callback.
- Remove or rename any previous wiring that sent history entries to the CRA editor view.

### `frontend/src/App.tsx`
- Extend `View` type to `'selector' | 'history' | 'history-detail'`.
- Add `historyDetailId: number | null` state.
- Add `handleOpenDetail(cra: CraSummaryDto)` that sets `view = 'history-detail'` and `historyDetailId = cra.id`.
- Pass `onOpenDetail={handleOpenDetail}` to `<CraHistory>`.
- Render `<CraHistoryDetail craId={historyDetailId} onBack={() => setView('history')} />` when `view === 'history-detail'`.

### Tests

**`frontend/src/components/CraHistoryDetail/CraHistoryDetail.test.tsx`** (NEW, Vitest + RTL)
- Renders loading skeleton while fetching.
- Renders full metadata and period from a `CraDetailsDto` fixture.
- Covered period string is correct for edge months (January, December, February leap/non-leap).
- "Back to history" calls `onBack`.
- "Download PDF" triggers `downloadCraPdf` and initiates blob download; shows download error banner on failure.
- Download button absent for `DRAFT` status.
- Error state shown and retry re-fetches on API failure.
- Mobile viewport (`375px`) renders without horizontal overflow (use `ResizeObserver` mock or CSS snapshot).
- Desktop viewport (`1280px`) renders metadata grid in expected column layout.

**`frontend/src/components/CraHistoryDetail/CraHistoryDetail.axe.test.tsx`** (NEW)
- `toHaveNoViolations()` check for loaded state.
- `toHaveNoViolations()` check for loading and error states.

**`frontend/src/components/CraHistory/CraHistory.test.tsx`** (MODIFY)
- Update all cases that previously asserted on `onOpen` to assert on `onOpenDetail`.

**`frontend/src/App.test.tsx`** (MODIFY)
- Add integration test: clicking "Open" on a history entry calls `getCra`, transitions to `history-detail` view, and renders the detail component.
- Add integration test: clicking "Back to history" from detail returns to the history list.

**`frontend/e2e/cra-workflow.spec.ts`** (MODIFY) or new `frontend/e2e/cra-history-detail.spec.ts`
- E2E: navigate to history, click "Open" on a validated CRA, verify period heading and metadata visible, verify PDF download initiates, verify "Back to history" returns to list.

## Excluded

- Editing or re-validating an archived CRA from the detail view.
- Deleting historical CRAs.
- Comparing multiple CRAs side by side.
- URL-based routing (no React Router introduction; the app's state-based view pattern is retained).
- Backend implementation of the snapshot fields — this plan assumes `GET /api/cras/:id` already returns provider/client snapshot data; if not, a separate backend ticket is required before this plan can pass its acceptance criteria.
- Visual regression snapshots (covered by the existing `visual.spec.ts` suite; new screens will be picked up on first run).

## Acceptance criteria

- Clicking "Open" on any history entry transitions the view to `history-detail` and renders `CraHistoryDetail` with the correct CRA id.
- The period subtitle is displayed as a human-readable French date range: first calendar day → last calendar day of the CRA month (e.g., `1 juillet 2026 – 31 juillet 2026`).
- Provider, client, client contact, total worked days, CRA status, validation date, provider signature date, and client signature date are all visible in the detail view; absent optional values render as `—`.
- All days of the covered month and their worked values (0, 0.5, 1) are displayed via the calendar; no day cell is interactive.
- The "Download PDF" button is present and functional for `VALIDATED` CRAs and absent for `DRAFT` CRAs.
- All displayed values come from the `CraDetailsDto` loaded by id — not from any current provider/client settings.
- Loading skeleton shown while the API call is in flight; error state with retry shown on failure; missing CRA (404) shows a friendly message.
- `CraHistoryDetail.test.tsx` passes all cases including mobile and desktop viewport assertions.
- `CraHistoryDetail.axe.test.tsx` reports no violations for loaded, loading, and error states.
- `App.test.tsx` integration cases for `history-detail` navigation and back-navigation pass.
- E2E test covering the open → inspect → back flow passes against the running app.
