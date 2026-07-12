I have everything I need. Here is the review.

---

# PR Review — T020 Create CRA Calendar Grid

## Résumé

Implementation of the CalendarGrid React component covering the full monthly CRA display. The component code itself is correct and complete. The blocking issue is in the test suite.

## Vérifications effectuées

- All acceptance criteria checked against component code
- Test suite reviewed line by line
- TypeScript configuration reviewed
- API integration and state management reviewed
- Scope compliance against ticket Out of Scope list

## Points validés

- **Days count** — `new Date(cra.year, cra.month, 0).getDate()` correctly computes days in month for any year/month input.
- **Weekday labels** — `WEEKDAY_ABBR[weekdayIndex]` renders Sun–Sat abbreviations per cell.
- **Worked value display** — `dayMap.get(day)?.worked ?? 0` correctly defaults to 0 for missing days.
- **Weekend distinction** — `day-cell--weekend` applied to Saturday (6) and Sunday (0) indices; CSS gives clear visual contrast.
- **Component reactivity** — CalendarGrid is purely prop-driven; it will re-render correctly for any new `cra` object passed to it.
- **State handling** — loading, error, and empty (null CRA) branches are all present and distinct.
- **Scope discipline** — no month selector, no click cycling, no persistence; stays within T020 bounds.
- **TypeScript** — strict mode enabled; explicit types throughout.

## Problèmes détectés

### [BLOCKING] Test `shows the worked value for days present in cra.days` is ambiguous

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` line 38–46

```typescript
days: [{ day: 1, worked: 1, note: '' }],
// ...
expect(cells[0]).toHaveTextContent('1');
```

`cells[0]` is day 1, which renders text content `"1Wed1"` (day number "1", weekday "Wed", worked "1"). `toHaveTextContent('1')` matches because the **day number** is "1" — regardless of whether the worked value is rendered. Removing the `<span className="day-cell__worked">` from the component would not cause this test to fail.

The acceptance criterion "Current work value is visible for each day" has no reliable test coverage.

**Fix:** Use a day/worked pair where the values differ, e.g. `day: 3, worked: 1`, then assert on the specific span:

```typescript
it('shows the worked value for days present in cra.days', () => {
  const cra: CraDetails = {
    ...JULY_2026,
    days: [{ day: 3, worked: 1, note: '' }],
  };
  render(<CalendarGrid cra={cra} loading={false} error={null} />);
  const cells = screen.getAllByTestId('day-cell');
  // Day 3 has worked=1; day number is 3, so "1" unambiguously comes from worked
  expect(cells[2].querySelector('.day-cell__worked')).toHaveTextContent('1');
});
```

---

### [OBSERVATION] `afterEach(cleanup)` placed between import statements

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.test.tsx` lines 4–5

```typescript
import { describe, it, expect, afterEach } from 'vitest';

afterEach(cleanup);          // ← executable statement mid-imports
import { CalendarGrid } from './CalendarGrid';
```

ESM hoisting makes this work, but it is misleading. Move `afterEach(cleanup)` after all imports.

---

### [OBSERVATION] Typo in `tsconfig.app.json` silently disables a compiler check

**File:** `frontend/tsconfig.app.json`

```json
"noFalltreoughCasesInSwitch": true   // typo: "treough" instead of "through"
```

TypeScript ignores unknown compiler options without error. The `noFallthroughCasesInSwitch` rule is effectively off. Fix the spelling.

---

### [OBSERVATION] Acceptance criterion "Calendar updates when a different CRA month is loaded" has no test

The component renders correctly for any month, but there is no test exercising a second month (e.g. February 2026 → 28 cells). This criterion is partially verified by the month logic itself, but a second test case would close the gap.

## Risques éventuels

None on the implementation side. The ambiguous test creates a risk that future work silently removes worked value display without test failure.

## Décision

- REQUEST_CHANGES — one blocking test quality issue; component implementation is correct.

## Actions demandées

1. Fix test `shows the worked value for days present in cra.days` to use `day ≠ worked` values and assert on `.day-cell__worked` element directly.
2. (Optional) Move `afterEach(cleanup)` after all import statements.
3. (Optional) Fix typo `noFalltreoughCasesInSwitch` → `noFallthroughCasesInSwitch`.
4. (Optional) Add a test verifying a month other than July renders the correct number of cells.

---

IMPLEMENTATION_FIX_REQUIRED
