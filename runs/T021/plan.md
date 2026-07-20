The plan has been written to `runs/T021/plan.md`. It covers three files to modify:

- **`CalendarGrid.tsx`** — new props (`craId`, `status`, `onDayUpdated`), `cycleValue` helper (`0→1→0.5→0`), async click handler, per-cell CSS modifier classes, inline error rendering.
- **`CalendarGrid.css`** — three new modifier classes: `--saving`, `--error`, `--locked`.
- **`App.tsx`** — wire `CalendarGrid` with the open CRA and an `onDayUpdated` callback to keep CRA state fresh after each API response.
