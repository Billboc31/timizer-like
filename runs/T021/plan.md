`runs/T021/plan.md` has been written with the four required headings. The plan covers:

- **3 files** to modify: `CalendarGrid.tsx` (click handler + state + props), `CalendarGrid.css` (saving/error/locked classes), `CalendarGrid.test.tsx` (8 test cases).
- **Key design decisions**: no optimistic updates (value only changes after server confirms), double-click guard via `savingDays` set, cycle array `[0, 1, 0.5]` drives rotation by index.
- **Explicit hypothesis**: `CalendarGrid.tsx` already exists from a prior calendar layout ticket.
