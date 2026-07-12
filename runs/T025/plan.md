The plan has been written to `runs/T025/plan.md`. It covers:

- **4 new files** to create: `HistoryPage.tsx`, `CraHistoryTable.tsx`, `CraHistoryRow.tsx`, and their test files
- **3 files to modify**: `App.jsx` (add routing), `types.ts` (add `validationDate` to `CraSummaryDto`), `package.json` (add `react-router-dom` + testing library)
- Key risk called out: `validationDate` is missing from the frontend `CraSummaryDto` type even though the backend already returns it (added in T014) — the plan includes fixing that
- Routing library install flagged explicitly since none exists yet
