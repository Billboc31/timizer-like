All 288 tests pass. Here's a summary of every change made:

**BLOQUANT #1 — `localStorage` crash** — `frontend/src/setupTests.ts`: added an in-memory `localStorage` mock that replaces the jsdom-corrupted object before any test runs.

**BLOQUANT #2 — stale D1 tests** — `frontend/src/App.test.tsx`: rewrote all 4 tests in `App — D1`:
- Test 1: now asserts `getCra` is called automatically by `AnnualCalendar` on mount (no click needed).
- Tests 2–4: wait for the July card to appear with label `"Juillet 2026 — 1 jour(s) travaillé(s)"` (one worked day per the `DETAILS` fixture), then click it. Tests 3 and 4 use split mocks (`mockResolvedValueOnce` + `mockReturnValueOnce`/`mockRejectedValueOnce`) so the `AnnualCalendar` auto-fetch succeeds (card renders) while the editor fetch stays pending or fails.

**Recommended — dead code removed**:
- Deleted `frontend/src/components/CraOverview/CraOverview.tsx` and `CraOverview.css`.
- Removed the unused `selectedPeriod` state and its two `setSelectedPeriod(...)` calls from `frontend/src/App.tsx`.
