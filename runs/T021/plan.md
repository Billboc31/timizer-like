`runs/T021/plan.md` has been written with the four required sections.

**Summary of the plan:**
- **CalendarGrid.tsx** — add `onDayClick`, `savingDays`, `errorDays` props; compute next cycle value (0→1→0.5→0); lock cells when `status === 'VALIDATED'`; apply CSS modifier classes per state.
- **CalendarGrid.css** — three new modifier classes: `--locked`, `--saving`, `--error`.
- **Parent page** — own the `handleDayClick` handler: optimistic update, call `craClient.updateDay()`, rollback on error.
- **CalendarGrid.test.tsx** (new) — 6 automated test cases covering all acceptance criteria.

One explicit assumption is noted: the parent page file path needs to be located by the Coder (likely `App.tsx` or `CraPage.tsx`).
