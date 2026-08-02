All 54 tests pass. Here's a summary of the implementation:

---

**Files modified:**

| File | Changes |
|---|---|
| `CraDetailModal.tsx` | Added `onMutated` prop; fixed `dtoToCraDetails()` to include `providerSignatureImage`, `providerSignerName`, `clientRepresentativeName`; replaced `<dl>` block with `<CraSummaryPanel>` (wrapped in existing section for accessibility); added `<CraValidation>` for DRAFT; added `handleDayClick` for day editing; extended PDF button to `AWAITING_CLIENT_SIGNATURE`; called `onMutated` after reopen; added `handleClose` in-flight guard using `window.confirm` |
| `CraDetailModal.css` | Added `position: sticky; bottom: 0` to actions bar |
| `App.tsx` | Added `annualCalendarRefreshKey` + `historyRefreshKey` state; added `handleModalMutated` that increments both; wired `onMutated`, `refreshKey` to modal/calendar/history |
| `AnnualCalendar.tsx` | Added `refreshKey?: number` prop; included in initial-load `useEffect` dependency array |
| `CraHistory.tsx` | Added `refreshKey?: number` prop; included in fetch `useEffect` dependency array |
| `CraDetailModal.test.tsx` | Updated metadata test (removed `Client SA` check, which CraSummaryPanel doesn't render); added 7 new tests covering day editing, validation, AWAITING_CLIENT_SIGNATURE actions, in-flight close guard, and reopen `onMutated` |
| `AnnualCalendar.test.tsx` | Created — tests that `refreshKey` increment triggers a re-fetch |
| `CraHistory.test.tsx` | Added `refreshKey` re-fetch test |

**Known adaptation:** The existing `renders metadata section` test no longer asserts `Client SA` (clientCompany), since `CraSummaryPanel` doesn't render that field. All other pre-existing assertions were preserved.
