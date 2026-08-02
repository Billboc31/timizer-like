My changes are restored. The implementation is complete. Here's the summary:

**Changes made:**

- **`frontend/src/App.tsx`** — Restructured the else-branch so `CraSummaryPanel`, `CalendarGrid`, `ProviderSignatureBox`, and `CraValidation` are now nested exclusively inside `view === 'selector'`. The `view === 'history'` branch now renders only `<CraHistory onOpenDetail={handleOpenModal} />`.

- **`frontend/src/components/CraHistoryDetail/`** — Entire folder deleted (4 files: `CraHistoryDetail.tsx`, `.css`, `.test.tsx`, `.axe.test.tsx`).

**Verification:**
- 30 of 31 test files pass (276/277 tests). The single failing test (`App.test.tsx > clicking Open on a history entry opens the CRA detail modal`) was already failing before this ticket — confirmed by running it against the original code.
- TypeScript errors are all pre-existing and unrelated to this change.
- No new regressions introduced.
