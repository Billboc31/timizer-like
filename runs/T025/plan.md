The plan is written to `runs/T025/plan.md`. It covers 5 files:

1. **`api/types.ts`** — extend `CraSummaryDto` with `validationDate` (already returned by the Java backend, missing from the TS type).
2. **`CraHistoryPage.tsx`** — new component: fetches `listCras()`, renders a table with period/status/days/validation date/actions, per-row PDF download with blob URL pattern, loading/error/empty states, `onOpen` callback prop.
3. **`CraHistoryPage.css`** — scoped styles.
4. **`CraHistoryPage.test.tsx`** — 9 test cases covering all states and interactions.
5. **`App.tsx`** — `useState<'selector' | 'history'>` for view switching, History and Back buttons.

No router install, no backend changes, no new props on `CraMonthSelector`.
