## Objective

Restrict the CRA detail components (`CraSummaryPanel`, `CalendarGrid`, `ProviderSignatureBox`, `CraValidation`) to the `'selector'` view only in `App.tsx`, so they never render beneath the History list, and delete the orphaned `CraHistoryDetail` component folder.

## Included

### `frontend/src/App.tsx` (lines 229–249)

Restructure the `else` branch so that `<CraSummaryPanel>`, `<CalendarGrid>`, `<ProviderSignatureBox>`, and `<CraValidation>` are nested inside the `view === 'selector'` conditional rather than sitting at the shared level:

```tsx
) : view === 'selector' ? (
  <>
    <CraMonthSelector onOpen={handleOpen} />
    <CraSummaryPanel cra={cra} loading={craLoading} error={craError} onSuccess={handleSignatureSuccess} />
    <CalendarGrid
      cra={cra}
      loading={craLoading}
      error={craError}
      onRetry={lastCraId !== null ? () => loadCra(lastCraId) : undefined}
      onDayClick={cra?.status === 'DRAFT' ? handleDayClick : undefined}
      updatingDay={updatingDay}
      dayUpdateError={dayUpdateError}
    />
    {cra && (
      <ProviderSignatureBox cra={cra} onSignClick={() => {}} />
    )}
    <CraValidation cra={cra} onValidated={handleSignatureSuccess} onGoToSettings={() => setView('settings')} />
  </>
) : (
  <CraHistory onOpenDetail={handleOpenModal} />
)
```

All state variables (`cra`, `craLoading`, `craError`, `lastCraId`, `updatingDay`, `dayUpdateError`) and functions (`loadCra`, `handleOpen`, `handleDayClick`, `handleSignatureSuccess`) are preserved unchanged — they remain used by the selector view.

### `frontend/src/components/CraHistoryDetail/` (entire folder — delete)

- `CraHistoryDetail.tsx`
- `CraHistoryDetail.css`
- `CraHistoryDetail.test.tsx`
- `CraHistoryDetail.axe.test.tsx`

This component is not imported or rendered anywhere in production code. Its tests reference nothing that will remain in the codebase.

## Excluded

- Changes to `CraHistory`, `CraDetailModal`, `CraSummaryPanel`, `CalendarGrid`, or any other component internals.
- State cleanup on view navigation (clearing `cra` when switching from `'selector'` to `'history'`): out of scope; the detail components no longer render in the history view.
- Removing `handleOpen`, `loadCra`, or related state — these belong to the selector view and are preserved.
- Deep-link and browser back/forward behavior: already handled by #143, no change needed.
- CSS changes to `CraHistory.css` or `CraDetailModal.css`: no layout reserved for the inline panel in those files.

## Acceptance criteria

- `view === 'history'` renders only `<CraHistory>` in the content area — no `CraSummaryPanel`, `CalendarGrid`, `ProviderSignatureBox`, or `CraValidation` visible or in the DOM.
- `view === 'selector'` continues to render the month selector and all inline detail components as before.
- `frontend/src/components/CraHistoryDetail/` no longer exists in the repository.
- TypeScript compiles without errors (`tsc --noEmit`).
- Existing test suite passes: no test references `CraHistoryDetail` and the `CraHistory` / `CraDetailModal` tests are unaffected.
- Opening a CRA from the History list triggers exactly one API request (from `CraDetailModal`), not two.
- No blank space or empty container appears below the history list after clicking a row or after closing the modal.
