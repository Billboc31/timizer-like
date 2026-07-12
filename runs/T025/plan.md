Plan written to `runs/T025/plan.md`. Key decisions made:

- **React Router** must be installed (not yet in `package.json`).
- **`CraSummaryDto`** needs `validationDate: string | null` added — the backend already returns it but the frontend type is missing it.
- Three new source files: `HistoryPage.tsx`, `CraHistoryTable.tsx`, `CraHistoryRow.tsx`.
- Routing wired in `App.jsx` with `/history` and a stub `/cra/:id` (so "Open" links resolve without a 404, but the detail page itself is out of scope).
- Tests cover loading, error, empty, and populated states, plus PDF action visibility gating on `VALIDATED` status.
