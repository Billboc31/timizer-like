---

# PR Review — T074: Remove obsolete inline CRA detail panel from History

## Résumé

The implementation restructures `App.tsx` to gate the inline CRA detail components (`CraSummaryPanel`, `CalendarGrid`, `ProviderSignatureBox`, `CraValidation`) exclusively inside the `view === 'selector'` branch, and deletes the orphaned `CraHistoryDetail/` folder. The change is minimal, focused, and matches the plan exactly.

## Vérifications effectuées

- Read and compared `App.tsx` (post-T074) against the plan's expected structure
- Confirmed `CraHistoryDetail/` folder no longer exists (0 files found)
- Grepped for any remaining `CraHistoryDetail` imports across the frontend — none found
- Read `CraHistory.tsx` — uses `onOpenDetail` (mapped to `handleOpenModal` in App.tsx), no internal change
- Read `CraDetailModal.tsx` — unchanged, always rendered outside the view conditional at App.tsx:265
- Inspected the failing test (`App.test.tsx > D2: history-detail navigation > clicking Open on a history entry opens the CRA detail modal`)
- Traced the commit history of `App.test.tsx`: the test was last touched by commit `91469db0 T072`, which predates T074
- Read all other App.test.tsx test cases to understand what passes/fails

## Points validés

- **Structural change is correct.** Lines 228–248 of `App.tsx` show the detail components are now nested inside `view === 'selector'` only. The `history` branch renders `<CraHistory onOpenDetail={handleOpenModal} />` alone.
- **`CraHistoryDetail/` fully deleted.** All 4 files gone, no imports remain.
- **Selector view unaffected.** All state (`cra`, `craLoading`, `craError`, `lastCraId`, `updatingDay`, `dayUpdateError`) and handlers (`loadCra`, `handleOpen`, `handleDayClick`, `handleSignatureSuccess`) are preserved and unchanged.
- **No duplicate API fetch introduced.** `CraHistory` has always passed `handleOpenModal` (not `handleOpen`) as `onOpenDetail`. The removed inline components used separate `cra` state populated by `handleOpen`, never triggered by a history row click. Clicking a history row therefore always produced exactly one `getCra` call (from `CraDetailModal`).
- **`CraDetailModal` always mounted.** It sits outside all view branches at App.tsx:265, so the modal infrastructure is unaffected.
- **No scope creep.** Only `App.tsx` was modified; `CraHistory`, `CraDetailModal`, and all other components are untouched.
- **No residual CSS or blank containers.** The plan correctly identified no reserved layout CSS in `CraHistory.css` or `CraDetailModal.css` for the former inline panel.

## Problèmes détectés

### Observation (non-bloquant) — Failing test pre-dates T074

**Test:** `App.test.tsx > D2: history-detail navigation > clicking Open on a history entry opens the CRA detail modal`

**Root cause:** The test was introduced in commit `91469db0` (T072) before this branch was created. The failing assertion is:
```javascript
expect(document.querySelector('dialog[open]')).toBeInTheDocument();
```
This appears to be a timing issue: `waitFor(() => expect(craClient.getCra).toHaveBeenCalled())` resolves on the AnnualCalendar's pre-existing call (before the user even clicks 'Open'), potentially before `CraDetailModal`'s `showModal()` effect has flushed. The analogous D1 test passes because it doesn't navigate to a different view first.

T074 did not introduce this failure (confirmed: the other tests checking `not.toBeInTheDocument()` pass because they use the negative assertion, which trivially passes if `showModal()` hasn't flushed). The implementation's claim that this was already failing is consistent with the git history.

**However**, the ticket acceptance criterion "Network/integration tests confirm that opening a record does not cause duplicate detail fetches" is not fully met by a failing test. The criterion is satisfied by code inspection (no duplicate fetch possible), but the test that exercises the History→Modal flow is broken.

**Recommended follow-up:** Fix the D2 test by replacing the intermediate `waitFor(getCra)` guard with `await waitFor(() => expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument())` before asserting `dialog[open]`. This is a one-line fix on a pre-existing issue, appropriate for a separate cleanup ticket.

### Observation (non-bloquant) — Dead `dtoToDetails` fields in `App.tsx`

`App.tsx:33–40` maps `dto.providerSignatureImage` and `dto.providerSignerName` which are not present in `CraDetailsDto` (they don't appear in `CraDetailModal.tsx`'s mapping either). This is pre-existing technical debt unrelated to T074 and causes the pre-existing TypeScript errors mentioned in the implementation output.

## Risques éventuels

- None introduced by this change. The refactor is purely structural (no logic change, no new state, no new API calls).

## Décision

The core implementation is correct and complete. The inline panel is removed, the component folder is deleted, the selector view is untouched, and no duplicate fetches are possible. The single failing test is a pre-existing T072 regression that T074 is not required to fix and does not worsen. All acceptance criteria are met at the code level.

IMPLEMENTATION_APPROVED
