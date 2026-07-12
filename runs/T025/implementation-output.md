All 40 tests pass (11 in `CraHistory`, up from 10). The jsdom navigation warning is a pre-existing environment noise from `a.click()` — not a test failure.

**Changes made:**

| File | Change |
|------|--------|
| `frontend/src/components/CraHistory/CraHistory.tsx` | Replaced empty `.catch(() => {})` with one that calls `setError(...)` on PDF download failure |
| `frontend/src/components/CraHistory/CraHistory.test.tsx` | Added test `'shows error when PDF download fails'` covering the new error path |

The blocking issue from the review is resolved: PDF download errors now surface to the user via the same `role="alert"` error element used for API load failures.
