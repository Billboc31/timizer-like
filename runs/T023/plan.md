Plan written to `runs/T023/plan.md`. It covers:

- **App.tsx** — add `openedCra` state to switch between the list view and detail view
- **New `CraDetail` component** — fetches CRA details, shows an inline confirmation panel (no external library), calls the existing `validateCra` API, and renders a validated badge on success
- **CalendarGrid** — gains a `locked` prop that adds a `calendar-grid--locked` CSS class for visual locking
- **Tests** — `CraDetail.test.tsx` for all acceptance-criteria branches, plus two new cases in `CalendarGrid.test.tsx`
