All 300 tests pass. Here's a summary of what changed:

**`App.test.tsx`** — Added `describe('App — browser navigation and focus restoration')` with two new tests:
- `browser back (popstate) closes the modal without leaving the originating view` — simulates browser back via `replaceState(null) + dispatchEvent(new PopStateEvent('popstate'))`, asserts dialog closes and history list stays mounted.
- `focus returns to the trigger element after closing the modal` — focuses the trigger button before clicking it, then asserts `document.activeElement === triggerButton` after closing the modal with ×.

**`App.tsx`** — Fixed deep-link parsing: `Number(id)` → `parseInt(id, 10)` with `isNaN` guard, preventing `getCra(NaN)` on malformed URLs.

**`CraDetailModal.tsx`** — Added `fetchCancelledRef` ref; set to `false` at the start of both the main `useEffect` fetch and `handleRetry`, set to `true` in the effect cleanup. Both callbacks now check the ref before updating state.
