The plan is written to `runs/T025/plan.md`. It covers:

- **4 required headings** in exact order
- `react-router-dom` installation and routing wiring in `App.jsx` / `main.jsx`
- New `HistoryPage` component with loading/error/empty states, a table with period/status/days/validation-date/actions columns, "Open" (navigate) and "Download PDF" (blob download, VALIDATED only) buttons
- Test setup additions (`@testing-library/react`, `jsdom` env) and 7 Vitest test cases
- Explicit flag on the `CraSummaryDto` / `validationDate` gap — the field isn't in the existing type, so the Coder must check the actual backend response and update the type or show "—"
- Clear exclusions: no backend changes, no `/cras/:id` detail page, no PDF generation, no filters
