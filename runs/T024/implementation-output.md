All fixes are in place. Here's the complete summary:

---

**Files modified:**

- **`frontend/src/components/CalendarGrid/CalendarGrid.tsx`** — Removed out-of-scope day-click cycling code (`handleDayClick`, `savingDays`, `dayErrors`, `onCraUpdate`, `nextWorkValue`). Kept `pad` (used by fallback filename). Fixed DOM attachment: `document.body.appendChild(a)` before `.click()` and `removeChild` after. Download-only feature is clean.

- **`frontend/src/components/CalendarGrid/CalendarGrid.css`** — Removed `cursor: pointer` and all day-click cycling classes (`.day-cell--locked`, `.day-cell--saving`, `.day-cell--error`, `.day-cell__saving`, `.day-cell__error`). Added `.calendar-download` with flex layout.

- **`frontend/src/components/CalendarGrid/CalendarGrid.test.tsx`** — Removed `updateDay` import, `vi.mock('../../api/craClient')`, `mockUpdateDay`, and the entire `CalendarGrid click cycling` describe block (7 tests). Updated anchor test to use a real `<a>` element with a mocked `click` method so `appendChild`/`removeChild` work without error.

- **`frontend/package.json`** — Removed `lru-cache@^11.5.2` devDependency.

- **`frontend/package-lock.json`** — Updated automatically via `npm install`.

- **`frontend/node_modules/lru-cache/`** — Previously tracked files deleted by `npm install`.

**Result:** 35 tests pass, 0 failures (down from 42 — exactly the 7 extracted click-cycling tests).

**Scope compliance:** Only download UI functionality remains in this diff. Day-click cycling belongs to a separate ticket.
