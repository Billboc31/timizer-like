All 288 tests across 32 test files pass. The `navigation not implemented` messages are JSDOM noise that pre-existed this change.

Here's a summary of what was done:

**Fix 1 — `selectedPeriod` clearing bug (`App.tsx:115-117`)**

Removed the `useEffect` that was watching `cra` and clearing `selectedPeriod` whenever `cra === null`. Since `loadCra()` sets `cra` to `null` synchronously at the start of every load, this effect would always fire and erase the period that `handleNewCraConfirm` had just set. The `selectedPeriod` now persists through the loading phase as intended.

**Fix 2 — Missing tests**

Created two new test files following the project's established patterns:

- `NewCraDialog.test.tsx` — 9 tests covering: closed/open state, empty date validation, end-before-start validation, valid submit with correct args, cancel button, ESC (native `cancel` event), `error` prop display, and `loading` disabled state.
- `NewCraDialog.axe.test.tsx` — 1 axe accessibility test in the open state.
