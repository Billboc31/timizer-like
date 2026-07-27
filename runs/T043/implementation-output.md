All done. Here's a summary of what was implemented:

---

## Changes made

**New dependency**
- `jest-axe ^8.0.0` added to `frontend/package.json`

**Test infrastructure**
- `setupTests.ts` — extended Vitest `expect` with `toHaveNoViolations()` and declared the type

**5 new axe test files** (11 tests total, all passing)
- `CalendarGrid.axe.test.tsx`, `CraHistory.axe.test.tsx`, `CraMonthSelector.axe.test.tsx`, `CraSummaryPanel.axe.test.tsx`, `CraValidation.axe.test.tsx`

**Accessibility fixes**
| # | Fix | File(s) |
|---|-----|---------|
| F-01/02 | Table `<th scope="col">` + `aria-label="CRA history"` | `CraHistory.tsx` |
| F-03/04 | `role="dialog"` + `aria-modal` + `aria-labelledby` + focus trap (Escape closes, Tab cycles, focus moves in/out on open/close) | `CraValidation.tsx` |
| F-09 | `role="alert"` on error paragraph | `CraSummaryPanel.tsx` |
| F-12 | `aria-label` on `<nav>` | `App.tsx` |
| F-11 | Global `:focus-visible` outline | `index.css` |

**Responsive layout fixes**
| # | Fix | File(s) |
|---|-----|---------|
| F-05 | Flex-wrap controls + column stack below 480 px | `CraMonthSelector.tsx` + new `CraMonthSelector.css` |
| F-06 | `overflow-x: auto` wrapper + `flex: 1 1 64px` cells | `CalendarGrid.tsx` + `CalendarGrid.css` |
| F-08 | `overflow-x: auto` table wrapper | `CraHistory.tsx` + `CraHistory.css` |
| F-10 | `max-width: min(90vw, 480px)` on dialog | `CraValidation.css` |

**Contrast fix**
- F-07: weekend cell text `#888 → #555` (3.1:1 → 6.6:1 on `#f0f0f0`) in `CalendarGrid.css`

**Findings document**: `runs/T043/fixes/findings.md`

**Test result**: 72/72 tests pass (`npm test`).
