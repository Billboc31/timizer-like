The plan has been written to `runs/T023/plan.md`. It covers:

- **1 new page component** (`CraPage`) that fetches CRA data, manages state, and renders an inline confirmation panel
- **1 CSS file** following the project's BEM-like conventions
- **1 test file** with 9 test cases covering all acceptance criteria
- **1 minimal wiring change** in `App.tsx` to connect `CraMonthSelector → CraPage`

Key architectural choices:
- Inline confirmation panel (no separate dialog component) — simpler and sufficient
- `providerSignatureDate` defaults to today but is editable via `<input type="date">`
- `CalendarGrid` already handles the locked state for `VALIDATED` CRAs — no changes needed there
